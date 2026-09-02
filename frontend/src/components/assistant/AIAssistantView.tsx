import React, { useState, useEffect, useRef } from 'react';
import { useFintechStore } from '../../store/useFintechStore';
import { authApi } from '../../services/api';
import { 
  Bot, 
  Send, 
  Sparkles, 
  ShieldCheck, 
  Copy,
  Check
} from 'lucide-react';
import { MarkdownRenderer } from './MarkdownRenderer';
import { buildUserContext } from '../../services/userProfileRepository';

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

      let answerText = res?.answer || res?.response || res?.reply || res?.message || '';
      let followUps = res?.followUps || res?.follow_up_suggestions || res?.suggested_questions || [];

      if (!answerText) {
        answerText = `I have received your query regarding "${userText}". How else can I assist with your financial strategy?`;
      }

      const assistantMsg: Message = {
        id: `ai_${Date.now()}`,
        sender: 'assistant',
        text: answerText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        followUps: followUps.length > 0 ? followUps : undefined
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      // Intent-aware fallback to prevent displaying fake numbers
      const qLow = userText.toLowerCase();
      let fallbackText = '';
      if (qLow.includes('etf')) {
        fallbackText = `### Exchange Traded Fund (ETF)\n\nAn ETF is a basket of securities (like stocks or bonds) that trades on an exchange like an individual stock throughout market hours.\n\n* **Index Tracking:** Most ETFs track benchmarks like Nifty 50 or Nasdaq-100.\n* **Intraday Trading:** Traded in real-time with continuous price discovery via a Demat account.\n* **Ultra-Low Cost:** Passive management yields minimal expense ratios.`;
      } else if (qLow.includes('sip') && !qLow.includes('increase') && !qLow.includes('calculate')) {
        fallbackText = `### Systematic Investment Plan (SIP)\n\nA SIP is a disciplined wealth-building method where a fixed amount is automatically invested into mutual funds each month, benefiting from rupee-cost averaging and long-term compounding.`;
      } else if (qLow.includes('us stock') || qLow.includes('american stock') || (qLow.includes('stock') && qLow.includes('suggest'))) {
        fallbackText = `### US Stock Screening (Offline Mode)\n\nBased on your **${risk}** risk profile, consider high-quality global compounders:\n\n1. **Microsoft (MSFT):** Enterprise cloud moat (Azure) and high free cash flow.\n2. **Alphabet (GOOGL):** Attractive valuation with digital search and YouTube dominance.\n3. **Visa (V):** Resilient consumer payments network compounder.\n\n*Guidance: Limit direct individual equities to 5%–10% of your equity portfolio.*`;
      } else if (qLow.includes('surplus') || qLow.includes('where should i invest') || qLow.includes('recommendation')) {
        fallbackText = `Based on your **${risk} Profile** and investable surplus of **${formatCurrency(surplus)}/month**, SmartVest recommends deploying your capital into low-cost Direct-Growth index funds.\n\n* **Core Large Cap (35%):** UTI Nifty 50 Index Fund Direct\n* **Multi-Cap Alpha (25%):** Parag Parikh Flexi Cap Fund Direct\n* **Global Tech (15%):** Motilal Oswal Nasdaq 100 ETF (MON100)\n* **Liquid Buffer (15%):** ICICI Prudential Liquid Fund Direct\n* **Gold Hedge (10%):** Sovereign Gold Bonds / GoldBeES`;
      } else {
        fallbackText = `I can help you screen US and Indian stocks, analyze instruments, review portfolio diversification, calculate loan affordability, or explain any financial concept. What would you like to explore?`;
      }

      const fallbackMsg: Message = {
        id: `ai_${Date.now()}`,
        sender: 'assistant',
        text: fallbackText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-white dark:bg-[#0B1120] border border-slate-200/90 dark:border-white/[0.08] rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#E6FDF7] dark:bg-[#00D4AA]/15 text-[#0D9488] dark:text-[#00D4AA] flex items-center justify-center shrink-0 border border-[#0D9488]/20 dark:border-[#00D4AA]/30">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">SmartVest AI Strategic Advisor</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E6FDF7] text-[#0D9488] dark:bg-[#00D4AA]/15 dark:text-[#00D4AA] border border-[#0D9488]/20 dark:border-[#00D4AA]/30">
                ACTIVE
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Personalized guidance synthesizing your real cashflows, goals, and risk mandate.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-[#060811] px-3.5 py-2 rounded-xl border border-slate-200/80 dark:border-white/[0.08]">
          <ShieldCheck className="w-4 h-4 text-[#0D9488] dark:text-[#00D4AA]" />
          <span>Fiduciary Guidance • Independent Advisory</span>
        </div>
      </div>

      {/* Main Chat Interface Box */}
      <div className="bg-white dark:bg-[#0B1120] border border-slate-200/90 dark:border-white/[0.08] rounded-2xl shadow-xs overflow-hidden flex flex-col h-[620px]">
        
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
                  <div className="w-8 h-8 rounded-xl bg-[#E6FDF7] dark:bg-[#00D4AA]/15 text-[#0D9488] dark:text-[#00D4AA] flex items-center justify-center shrink-0 mt-1 border border-[#0D9488]/20 dark:border-[#00D4AA]/30 shadow-xs">
                    <Sparkles className="w-4 h-4 stroke-[2.5]" />
                  </div>
                )}

                <div className={`max-w-[85%] sm:max-w-[75%] space-y-2 ${isUser ? 'items-end' : 'items-start'}`}>
                  <div 
                    className={`p-4 sm:p-5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs ${
                      isUser 
                        ? 'bg-[#0D9488] dark:bg-[#00D4AA] text-white dark:text-[#060811] font-semibold rounded-tr-none' 
                        : 'bg-slate-50 dark:bg-[#0F172A] text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-white/[0.08] rounded-tl-none'
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
                          className="px-3 py-1 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-[#0F172A] dark:hover:bg-[#152238] border border-slate-200 dark:border-white/[0.08] text-[11px] text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer shadow-2xs"
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className={`flex items-center gap-2 px-1 text-[10px] text-slate-400 ${isUser ? 'justify-end' : 'justify-start'}`}>
                    <span>{msg.timestamp}</span>
                    {!isUser && (
                      <button 
                        onClick={() => handleCopy(msg.text, msg.id)}
                        className="hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer flex items-center gap-1"
                        title="Copy message"
                      >
                        {copiedId === msg.id ? <Check className="w-3 h-3 text-[#0D9488] dark:text-[#00D4AA]" /> : <Copy className="w-3 h-3" />}
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
              <div className="w-8 h-8 rounded-xl bg-[#E6FDF7] dark:bg-[#00D4AA]/15 text-[#0D9488] dark:text-[#00D4AA] flex items-center justify-center shrink-0 border border-[#0D9488]/20 dark:border-[#00D4AA]/30 shadow-xs animate-pulse">
                <Sparkles className="w-4 h-4 stroke-[2.5]" />
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200/80 dark:border-white/[0.08] text-slate-600 dark:text-slate-400 text-xs flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#0D9488] dark:bg-[#00D4AA] animate-ping" />
                <span>SmartVest AI analyzing market data & financial parameters...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Quick Prompt Chips */}
        <div className="px-4 py-2.5 bg-slate-50/70 dark:bg-[#060811] border-t border-slate-200/80 dark:border-white/[0.06] flex items-center gap-2 overflow-x-auto scrollbar-none">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">Quick Prompts:</span>
          {promptChips.map((chip, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(chip)}
              className="px-3 py-1 rounded-full bg-white dark:bg-[#0F172A] hover:bg-slate-100 dark:hover:bg-[#152238] text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200 dark:border-white/[0.08] whitespace-nowrap transition-colors cursor-pointer shrink-0 shadow-2xs"
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
          className="p-3 bg-white dark:bg-[#0B1120] border-t border-slate-200/80 dark:border-white/[0.08] flex items-center gap-2"
        >
          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your financial allocation, fund selections, goals, or loan affordability..."
            disabled={loading}
            className="flex-1 bg-slate-50 dark:bg-[#060811] border border-slate-200 dark:border-white/[0.08] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#0D9488] dark:focus:border-[#00D4AA] transition-colors"
          />

          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="p-2.5 sm:px-4 sm:py-2.5 rounded-xl bg-[#0D9488] hover:bg-[#0F766E] dark:bg-[#00D4AA] dark:hover:bg-[#00D4AA]/90 text-white dark:text-[#060811] font-bold disabled:opacity-40 disabled:cursor-not-allowed shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Send className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden sm:inline text-xs">Send</span>
          </button>
        </form>

      </div>
    </div>
  );
};
