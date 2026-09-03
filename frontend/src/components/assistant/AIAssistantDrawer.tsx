import React, { useState, useEffect, useRef } from 'react';
import { useFintechStore } from '../../store/useFintechStore';
import { authApi } from '../../services/api';
import { 
  Bot, 
  Send, 
  Sparkles, 
  ShieldCheck, 
  Copy, 
  Check, 
  X, 
  RotateCcw, 
  Calculator, 
  Compass, 
  ArrowRight 
} from 'lucide-react';
import { MarkdownRenderer } from './MarkdownRenderer';
import { buildUserContext } from '../../services/userProfileRepository';
import { buildGroundedContext, generateGroundedOfflineResponse } from '../../services/vestiqGrounding';

interface CalculationData {
  type?: string;
  title?: string;
  monthlyInvestment?: number;
  investedAmount?: number;
  estimatedReturns?: number;
  totalValue?: number;
  cagr?: number;
  years?: number;
  itemCost?: number;
  downPayment?: number;
  monthlyEmi?: number;
  surplusImpact?: string;
  verdict?: string;
  remainingSurplus?: number;
  targetAmount?: number;
  estimatedYears?: number;
  sip10y?: number;
  sip15y?: number;
  sip20y?: number;
  monthlyExpenses?: number;
  targetFund?: number;
  currentFund?: number;
  status?: string;
  existingAmount?: number;
  concentrationPct?: number;
  riskLevel?: string;
}

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  calculations?: CalculationData | null;
  followUps?: string[];
}

interface AIAssistantDrawerProps {
  onClose: () => void;
}

export const AIAssistantDrawer: React.FC<AIAssistantDrawerProps> = ({ onClose }) => {
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

  const storageKey = `smartvest_chat_history_${user?.id || 'active'}`;

  // Initial welcome message
  const defaultMessages: Message[] = [
    {
      id: 'welcome_1',
      sender: 'assistant',
      text: `Greetings, **${user?.name || 'Investor'}**. I am **VestIQ**, your institutional financial intelligence co-pilot.\n\nYour current profile indicates a **${risk} risk mandate** with a monthly surplus of **${formatCurrency(surplus)}**.\n\nHow may I assist your portfolio planning today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      followUps: [
        'Review my portfolio allocation',
        'Can I afford a major purchase?',
        'How much SIP do I need for ₹1 Crore?',
      ]
    }
  ];

  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) return JSON.parse(saved);
    } catch {
      // Ignore
    }
    return defaultMessages;
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(messages));
    } catch {
      // Ignore
    }
  }, [messages, storageKey]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleClearChat = () => {
    setMessages(defaultMessages);
    localStorage.removeItem(storageKey);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    const userMsg: Message = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const clientCtx = buildUserContext(user, expenses, goals, strategy);
      const apiPayload = {
        message: query,
        user_context: clientCtx,
        conversation_id: `drawer_${user?.id || 'default'}`
      };

      const response = await authApi.askAssistant(apiPayload);
      const assistantText = response?.reply || response?.response || response?.message || 'I have analyzed your request based on your portfolio parameters.';

      const assistantMsg: Message = {
        id: `ai_${Date.now()}`,
        sender: 'assistant',
        text: assistantText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        calculations: response?.calculations || null,
        followUps: response?.follow_up_suggestions || response?.suggested_questions || []
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      const groundedCtx = buildGroundedContext(user, expenses, goals, strategy);
      const offlineRes = generateGroundedOfflineResponse(query, groundedCtx);
      const fallbackMsg: Message = {
        id: `ai_${Date.now()}`,
        sender: 'assistant',
        text: offlineRes.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        calculations: offlineRes.calculations || null,
        followUps: offlineRes.followUps || []
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  };

  const renderCalculationCard = (calc: CalculationData) => {
    if (!calc || !calc.type) return null;

    if (calc.type === 'sip' || calc.type === 'compound') {
      return (
        <div className="mt-2.5 p-3 rounded-lg bg-[#0A1022] border border-white/[0.06] space-y-2 text-xs">
          <div className="flex items-center justify-between font-bold text-white">
            <span className="flex items-center gap-1.5 text-[#00D4AA]">
              <Calculator className="w-3.5 h-3.5" />
              <span>Compounding Projection</span>
            </span>
            <span className="text-[11px] font-mono text-[#8A94A6]">{calc.cagr || 12}% CAGR</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="p-2 rounded bg-[#101827] border border-white/[0.04]">
              <span className="text-[10px] text-[#8A94A6] block mb-0.5">Total Invested</span>
              <span className="text-xs font-bold text-white font-mono">{formatCurrency(calc.investedAmount || 0)}</span>
            </div>
            <div className="p-2 rounded bg-[#101827] border border-white/[0.04]">
              <span className="text-[10px] text-[#8A94A6] block mb-0.5">Future Value ({calc.years || 10}Y)</span>
              <span className="text-xs font-bold text-[#00D4AA] font-mono">{formatCurrency(calc.totalValue || 0)}</span>
            </div>
          </div>
        </div>
      );
    }

    if (calc.type === 'affordability') {
      const isComfortable = calc.verdict === 'Comfortable';
      return (
        <div className="mt-2.5 p-3 rounded-lg bg-[#0A1022] border border-white/[0.06] space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-white flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-[#00D4AA]" />
              <span>Affordability Evaluation</span>
            </span>
            <span className={`text-[10.5px] font-bold px-2 py-0.2 rounded ${
              isComfortable ? 'bg-[#00C853]/10 text-[#00C853] border border-[#00C853]/30' : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
            }`}>
              {calc.verdict}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="p-2 rounded bg-[#101827] border border-white/[0.04]">
              <span className="text-[10px] text-[#8A94A6] block mb-0.5">Estimated EMI</span>
              <span className="text-xs font-bold text-[#00D4AA] font-mono">{formatCurrency(calc.monthlyEmi || 0)}/mo</span>
            </div>
            <div className="p-2 rounded bg-[#101827] border border-white/[0.04]">
              <span className="text-[10px] text-[#8A94A6] block mb-0.5">Surplus Impact</span>
              <span className="text-xs font-semibold text-white">{calc.surplusImpact}</span>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <>
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-black/60 z-40 backdrop-blur-xs transition-opacity animate-fade-in"
      />

      <aside className="fixed top-0 right-0 bottom-0 z-50 w-full sm:w-[420px] bg-[#101827] border-l border-white/[0.08] shadow-2xl flex flex-col overflow-hidden animate-slide-left font-sans text-white">
        
        {/* Header */}
        <header className="p-4 border-b border-white/[0.06] bg-[#0A1022] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#101827] border border-white/[0.08] flex items-center justify-center text-[#00D4AA]">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">VestIQ Strategic Advisory</h2>
              <p className="text-[11px] text-[#8A94A6]">Context-Aware Institutional Intelligence</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleClearChat}
              title="Clear Conversation"
              className="p-1.5 rounded-lg text-[#8A94A6] hover:text-white bg-[#101827] border border-white/[0.06] cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={onClose}
              title="Close Assistant"
              className="p-1.5 rounded-lg text-[#8A94A6] hover:text-white bg-[#101827] border border-white/[0.06] cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </header>

        {/* Regulatory Badge Strip */}
        <div className="px-4 py-2 bg-[#0A1022] border-b border-white/[0.06] flex items-center justify-between text-xs text-[#8A94A6]">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#00D4AA] shrink-0" />
            <span>Fiduciary Mandate Calibrated</span>
          </div>
          <span className="font-semibold text-white">{user?.name || 'Investor'} • {risk}</span>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#050816]">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div 
                key={msg.id}
                className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}
              >
                {!isUser && (
                  <div className="w-6 h-6 rounded-md bg-[#101827] text-[#00D4AA] border border-white/[0.08] flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles className="w-3 h-3" />
                  </div>
                )}

                <div className={`max-w-[88%] rounded-xl p-3.5 text-xs leading-relaxed space-y-2 relative shadow-xs ${
                  isUser 
                    ? 'bg-[#00D4AA] text-[#050816] font-semibold rounded-tr-none' 
                    : 'bg-[#101827] border border-white/[0.08] text-white rounded-tl-none'
                }`}>
                  {isUser ? (
                    <div className="whitespace-pre-wrap">{msg.text}</div>
                  ) : (
                    <MarkdownRenderer content={msg.text} />
                  )}

                  {msg.calculations && renderCalculationCard(msg.calculations)}

                  {msg.followUps && msg.followUps.length > 0 && (
                    <div className="pt-2 border-t border-white/[0.06] space-y-1">
                      <span className="text-[10px] font-bold text-[#8A94A6] uppercase tracking-wider block">
                        Suggested:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {msg.followUps.map((chip, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSendMessage(chip)}
                            className="px-2 py-1 rounded bg-[#0A1022] hover:bg-[#141F36] border border-white/[0.06] text-white text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer text-left"
                          >
                            <span>{chip}</span>
                            <ArrowRight className="w-2.5 h-2.5 text-[#00D4AA] shrink-0" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className={`flex items-center justify-between pt-1 border-t text-[10px] ${
                    isUser ? 'border-[#050816]/20 text-[#050816]/80' : 'border-white/[0.06] text-[#8A94A6]'
                  }`}>
                    <span>{msg.timestamp}</span>
                    {!isUser && (
                      <button
                        onClick={() => handleCopy(msg.text, msg.id)}
                        className="hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        {copiedId === msg.id ? <Check className="w-2.5 h-2.5 text-[#00D4AA]" /> : <Copy className="w-2.5 h-2.5" />}
                        <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex gap-2 items-center text-xs text-[#8A94A6] pl-8">
              <div className="w-2 h-2 rounded-full bg-[#00D4AA] animate-pulse" />
              <span>Analyzing portfolio parameters...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-white/[0.06] bg-[#0A1022]">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSendMessage(input); }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about funds, goals, or affordability..."
              className="flex-1 px-3 py-2 rounded-lg bg-[#101827] border border-white/[0.08] text-white text-xs placeholder:text-[#5A667A] focus:outline-none focus:border-[#00D4AA]"
            />

            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="p-2 rounded-lg bg-[#00D4AA] text-[#050816] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

      </aside>
    </>
  );
};
