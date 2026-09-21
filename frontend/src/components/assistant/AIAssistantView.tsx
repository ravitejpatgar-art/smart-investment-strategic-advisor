import React, { useState, useEffect, useRef } from 'react';
import { useFintechStore } from '../../store/useFintechStore';
import { authApi } from '../../services/api';
import { 
  Send, 
  ShieldCheck, 
  Copy,
  Check
} from 'lucide-react';
import { VestiqMark } from '../common/VestiqLogo';
import { MarkdownRenderer } from './MarkdownRenderer';
import { buildUserContext } from '../../services/userProfileRepository';
import { buildGroundedContext, generateGroundedOfflineResponse, parseAssistantApiResponse } from '../../services/vestiqGrounding';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  followUps?: string[];
}

export const AIAssistantView: React.FC = () => {
  const { user, expenses, goals, strategy, formatCurrency } = useFintechStore();

  const salary = user?.salaryIncome || user?.monthlyIncome || 0;
  const otherInc = user?.otherIncome || 0;
  const income = salary + otherInc;
  const expTotal = expenses.reduce((sum, e) => sum + e.amount, 0) || (user?.monthlyExpenses || 0);
  const surplus = Math.max(0, income - expTotal);
  const risk = user?.riskTolerance || 'Moderate';

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const defaultWelcomeMessage: Message = {
    id: 'msg_welcome',
    sender: 'assistant',
    text: `👋 Hello **${user?.name || 'Investor'}**! I am your **SmartVest AI Strategic Advisor**.

I have synthesized your active financial parameters:
* **Monthly Inflow:** ${formatCurrency(income)}
* **Monthly Living Outflow:** ${formatCurrency(expTotal)}
* **Investable Surplus:** **${formatCurrency(surplus)}/month**
* **Risk Mandate:** **${risk}**
* **Active Milestones:** ${goals.length} Goals (${user?.financialGoal || 'Wealth Building'})

How can I help guide your financial and investment decisions today?`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    followUps: [
      'Where should I invest my monthly surplus?',
      'Suggest me some US stocks',
      'Can I afford a ₹10 lakh car?',
      'How can I reach ₹1 crore?'
    ]
  };

  const [messages, setMessages] = useState<Message[]>([defaultWelcomeMessage]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const latestRequestIdRef = useRef<string>('');

  const promptChips = [
    'Where should I invest my monthly surplus?',
    'Suggest me some US stocks',
    'What is an ETF?',
    'Can I afford a ₹10 lakh car?',
    'How can I reach ₹1 crore?'
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSendMessage = async (userText: string) => {
    if (!userText.trim() || loading) return;

    const reqId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    latestRequestIdRef.current = reqId;

    const userMsg: Message = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const userContext = buildUserContext(user, expenses, goals, strategy);
      const chatHistory = messages.slice(-6).map((m) => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text
      }));

      const res = await authApi.askAssistant({
        question: userText,
        message: userText,
        requestId: reqId,
        user_context: userContext,
        history: chatHistory
      });

      // Ignore stale responses from out-of-order race conditions
      if (res?.requestId && res.requestId !== latestRequestIdRef.current) {
        return;
      }

      const parsed = parseAssistantApiResponse(res, userText);

      const assistantMsg: Message = {
        id: `ai_${Date.now()}`,
        sender: 'assistant',
        text: parsed.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        followUps: parsed.followUps
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 401 || status === 403) {
        setMessages((prev) => [
          ...prev,
          {
            id: `ai_${Date.now()}`,
            sender: 'assistant',
            text: '⚠️ **Authentication Required:** Please sign in to access personalized strategic advisory.',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      } else {
        const groundedCtx = buildGroundedContext(user, expenses, goals, strategy);
        const offlineRes = generateGroundedOfflineResponse(userText, groundedCtx);
        const fallbackMsg: Message = {
          id: `ai_${Date.now()}`,
          sender: 'assistant',
          text: offlineRes.text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          followUps: offlineRes.followUps && offlineRes.followUps.length > 0 ? offlineRes.followUps : undefined
        };
        setMessages((prev) => [...prev, fallbackMsg]);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Advisor Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-950/80 border border-slate-800/80 rounded-3xl p-6 shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-400">
            <VestiqMark size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white">VestIQ Advisory Engine</h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                Institutional Advisory
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Personalized guidance synthesizing your real cashflows, goals, and risk mandate.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-900/80 px-3.5 py-2 rounded-2xl border border-slate-800">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Fiduciary Guidance • Independent Advisory</span>
        </div>
      </div>

      {/* Main Chat Interface Box */}
      <div className="bg-slate-950/80 border border-slate-800/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[600px] backdrop-blur-md">
        
        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';

            return (
              <div 
                key={msg.id}
                className={`flex gap-3.5 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-teal-500/15 border border-teal-500/30 text-teal-400 flex items-center justify-center shrink-0 mt-1">
                    <VestiqMark size={16} />
                  </div>
                )}

                <div className={`max-w-[85%] sm:max-w-[75%] space-y-2 ${isUser ? 'items-end' : 'items-start'}`}>
                  <div 
                    className={`p-4 sm:p-5 rounded-3xl text-xs sm:text-sm leading-relaxed shadow-md ${
                      isUser 
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-medium rounded-tr-none' 
                        : 'bg-slate-900/90 text-slate-200 border border-slate-800 rounded-tl-none'
                    }`}
                  >
                    <MarkdownRenderer content={msg.text} />
                  </div>

                  {/* Follow-up Quick Action Chips */}
                  {!isUser && msg.followUps && msg.followUps.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {msg.followUps.map((chip, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSendMessage(chip)}
                          className="px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-emerald-950/40 border border-slate-800 hover:border-emerald-500/40 text-[11px] text-slate-400 hover:text-emerald-300 transition-all cursor-pointer"
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className={`flex items-center gap-2 px-1 text-[10px] text-slate-500 ${isUser ? 'justify-end' : 'justify-start'}`}>
                    <span>{msg.timestamp}</span>
                    {!isUser && (
                      <button 
                        onClick={() => handleCopy(msg.text, msg.id)}
                        className="hover:text-slate-300 cursor-pointer flex items-center gap-1"
                        title="Copy message"
                      >
                        {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex gap-3.5 items-start">
              <div className="w-8 h-8 rounded-xl bg-teal-500/15 border border-teal-500/30 text-teal-400 flex items-center justify-center shrink-0">
                <VestiqMark size={16} />
              </div>
              <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 text-slate-400 text-xs flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                <span>VestIQ analyzing market data & financial parameters...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Quick Prompt Chips */}
        <div className="px-4 py-2.5 bg-slate-900/60 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto scrollbar-none">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider shrink-0">Quick Prompts:</span>
          {promptChips.map((chip, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(chip)}
              className="px-3 py-1 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 whitespace-nowrap transition-colors cursor-pointer shrink-0"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Input Composer */}
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(input);
          }}
          className="p-3 bg-slate-950 border-t border-slate-800/80 flex items-center gap-2"
        >
          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your financial allocation, fund selections, goals, or loan affordability..."
            disabled={loading}
            className="flex-1 bg-slate-900/80 border border-slate-800 rounded-2xl px-4 py-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 transition-colors"
          />

          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="p-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold hover:opacity-95 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
          >
            <Send className="w-4 h-4 stroke-[2.5]" />
          </button>
        </form>

      </div>

    </div>
  );
};
