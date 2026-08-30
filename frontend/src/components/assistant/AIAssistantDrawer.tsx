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
  Mic,
  RotateCcw,
  Calculator,
  Compass,
  ArrowRight
} from 'lucide-react';
import { MarkdownRenderer } from './MarkdownRenderer';
import { buildUserContext } from '../../services/userProfileRepository';

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
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);

  const storageKey = `smartvest_chat_history_${user?.id || 'active'}`;

  const defaultWelcomeMessage: Message = {
    id: 'msg_welcome',
    sender: 'assistant',
    text: `Hi ${user?.name || 'there'}! I'm your SmartVest AI Advisor.

Your active profile is loaded with **${formatCurrency(surplus)}/month** investable surplus and a **${risk}** risk profile.

Feel free to ask about asset allocation, goal funding, expense optimization, or loan affordability.`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    followUps: [
      'Where should I invest my monthly surplus?',
      'Why did you choose these investments?',
      'Can I afford a ₹10 lakh car?',
      'How can I reach ₹1 crore?'
    ]
  };

  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Ignore
    }
    return [defaultWelcomeMessage];
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(messages));
    } catch {
      // Ignore
    }
  }, [messages, storageKey]);

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

  const handleClearChat = () => {
    setMessages([defaultWelcomeMessage]);
    localStorage.removeItem(storageKey);
  };

  const handleToggleVoice = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechError('Voice input is not supported in this browser.');
      setTimeout(() => setSpeechError(null), 4000);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-IN';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechError(null);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInput(transcript);
          handleSendMessage(transcript);
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
        setSpeechError('Could not recognize voice. Please type your query.');
        setTimeout(() => setSpeechError(null), 4000);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsListening(false);
      setSpeechError('Could not start voice recognition.');
      setTimeout(() => setSpeechError(null), 4000);
    }
  };

  const getUserContext = () => buildUserContext(user, expenses, goals, strategy);
  const latestRequestIdRef = useRef<string>('');

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
      const userContext = getUserContext();
      const chatHistory = messages.slice(-6).map(m => ({
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

      if (res?.requestId && res.requestId !== latestRequestIdRef.current) {
        return;
      }

      let answerText = res?.answer || res?.response || '';
      let calcData = res?.calculations || null;
      let followUps = res?.followUps || [];

      if (!answerText) {
        answerText = `I have received your query regarding "${userText}". How else can I assist with your financial strategy?`;
      }

      const assistantMsg: Message = {
        id: `ai_${Date.now()}`,
        sender: 'assistant',
        text: answerText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        calculations: calcData,
        followUps: followUps.length > 0 ? followUps : undefined
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      const qLow = userText.toLowerCase();
      let fallbackText = '';
      if (qLow.includes('etf')) {
        fallbackText = `### Exchange Traded Fund (ETF)\n\nAn ETF is a basket of securities that trades on an exchange throughout market hours.\n\n* **Index Tracking:** Replicates benchmarks like Nifty 50 or Nasdaq-100.\n* **Intraday Trading:** Traded in real-time via Demat.\n* **Low Cost:** Minimal expense ratios.`;
      } else if (qLow.includes('sip')) {
        fallbackText = `### Systematic Investment Plan (SIP)\n\nA SIP automatically invests a fixed monthly amount into funds, benefiting from rupee-cost averaging and long-term compounding.`;
      } else if (qLow.includes('surplus') || qLow.includes('where should i invest')) {
        fallbackText = `Based on your **${risk} Profile** and investable surplus of **${formatCurrency(surplus)}/month**, SmartVest recommends deploying your capital into low-cost index funds:\n\n* **Core Large Cap (35%):** UTI Nifty 50 Index Fund Direct\n* **Multi-Cap Alpha (25%):** Parag Parikh Flexi Cap Fund Direct\n* **Global Tech (15%):** Motilal Oswal Nasdaq 100 ETF (MON100)\n* **Liquid Buffer (15%):** ICICI Prudential Liquid Fund Direct\n* **Gold Hedge (10%):** GoldBeES`;
      } else {
        fallbackText = `I can help you review portfolio diversification, calculate affordability, or explain financial concepts. What would you like to explore?`;
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

  const renderCalculationCard = (calc: CalculationData) => {
    if (calc.type === 'sip' && calc.monthlyInvestment) {
      return (
        <div className="mt-3 p-3.5 rounded-xl bg-[#F8F9FC] border border-teal-200 space-y-2.5 shadow-xs">
          <div className="flex items-center justify-between font-bold text-teal-850 text-[14px]">
            <span className="flex items-center gap-1.5 text-teal-800">
              <Calculator className="w-4 h-4 text-teal-600" />
              <span>{calc.title || 'Compounding Projection'}</span>
            </span>
            <span className="text-[12px] text-[#667085]">~{calc.cagr || 13.5}% CAGR</span>
          </div>
          <div className="grid grid-cols-2 gap-2.5 pt-0.5">
            <div className="p-2.5 rounded-lg bg-white border border-[#E7E9F0]">
              <span className="text-[11.5px] text-[#667085] block mb-0.5">Monthly SIP</span>
              <span className="text-[14.5px] font-bold text-[#172033] font-mono">{formatCurrency(calc.monthlyInvestment)}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-white border border-[#E7E9F0]">
              <span className="text-[11.5px] text-[#667085] block mb-0.5">Projected Value</span>
              <span className="text-[14.5px] font-bold text-teal-700 font-mono">{formatCurrency(calc.totalValue || 0)}</span>
            </div>
          </div>
        </div>
      );
    }

    if (calc.type === 'affordability') {
      const isComfortable = calc.verdict === 'Comfortable';
      return (
        <div className="mt-3 p-3.5 rounded-xl bg-[#F8F9FC] border border-[#E7E9F0] space-y-2.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-[#172033] text-[14px] flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-teal-600" />
              <span>Affordability Analysis</span>
            </span>
            <span className={`text-[12px] font-bold px-2.5 py-0.5 rounded ${
              isComfortable ? 'bg-teal-50 text-teal-800 border border-teal-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
            }`}>
              {calc.verdict}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2.5 text-center">
            <div className="p-2.5 rounded-lg bg-white border border-[#E7E9F0]">
              <span className="text-[11.5px] text-[#667085] block mb-0.5">Estimated EMI</span>
              <span className="text-[14.5px] font-bold text-teal-700 font-mono">{formatCurrency(calc.monthlyEmi || 0)}/mo</span>
            </div>
            <div className="p-2.5 rounded-lg bg-white border border-[#E7E9F0]">
              <span className="text-[11.5px] text-[#667085] block mb-0.5">Surplus Impact</span>
              <span className="text-[13px] font-semibold text-slate-700">{calc.surplusImpact}</span>
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
        className="fixed inset-0 bg-black/40 z-40 transition-opacity animate-fade-in"
      />

      <aside className="fixed top-0 right-0 bottom-0 z-50 w-full sm:w-[440px] bg-white border-l border-[#E7E9F0] shadow-2xl flex flex-col overflow-hidden animate-slide-left font-sans">
        
        {/* Header */}
        <header className="p-4 sm:p-5 border-b border-[#E7E9F0] bg-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-[16px] font-bold text-[#172033] tracking-tight">SmartVest AI Advisor</h2>
              <p className="text-[12px] text-[#667085] font-medium">Context-Aware Financial Decision Support</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleClearChat}
              title="Clear Conversation"
              className="p-2 rounded-lg text-[#667085] hover:text-[#172033] hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              title="Close Assistant"
              className="p-2 rounded-lg text-[#667085] hover:text-[#172033] hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Regulatory Badge Strip */}
        <div className="px-5 py-2 bg-[#F8F9FC] border-b border-[#E7E9F0] flex items-center justify-between text-[12px] text-[#667085]">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600 shrink-0" />
            <span>Advisory Only • No Trade Execution</span>
          </div>
          <span className="font-semibold text-slate-700">{user?.name || 'Investor'} • {risk}</span>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-[#F6F7FB]">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div 
                key={msg.id}
                className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}
              >
                {!isUser && (
                  <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 border border-teal-200 flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                )}

                <div className={`max-w-[90%] sm:max-w-[380px] rounded-2xl p-4 text-[14px] leading-relaxed space-y-2.5 relative shadow-xs ${
                  isUser 
                    ? 'bg-teal-600 text-white font-medium rounded-tr-none' 
                    : 'bg-white border border-[#E7E9F0] text-[#172033] rounded-tl-none'
                }`}>
                  {isUser ? (
                    <div className="whitespace-pre-wrap">{msg.text}</div>
                  ) : (
                    <MarkdownRenderer content={msg.text} />
                  )}

                  {msg.calculations && renderCalculationCard(msg.calculations)}

                  {msg.followUps && msg.followUps.length > 0 && (
                    <div className="pt-2.5 border-t border-[#E7E9F0] space-y-1.5">
                      <span className="text-[11.5px] font-bold text-[#667085] uppercase tracking-wider block">
                        Suggested:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.followUps.map((chip, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSendMessage(chip)}
                            className="px-2.5 py-1.5 rounded-lg bg-[#F8F9FC] hover:bg-slate-100 border border-[#E7E9F0] text-slate-700 text-[12px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer text-left"
                          >
                            <span>{chip}</span>
                            <ArrowRight className="w-3 h-3 text-teal-600 shrink-0" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className={`flex items-center justify-between pt-1.5 border-t text-[11px] ${
                    isUser ? 'border-teal-700 text-teal-100' : 'border-[#F1F5F9] text-[#667085]'
                  }`}>
                    <span>{msg.timestamp}</span>
                    {!isUser && (
                      <button
                        onClick={() => handleCopy(msg.text, msg.id)}
                        className="hover:text-teal-700 flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        {copiedId === msg.id ? <Check className="w-3 h-3 text-teal-600" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex gap-2.5 items-center text-[13px] text-[#667085] animate-fade-in pl-8">
              <div className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-pulse" />
              <span>Analyzing portfolio parameters...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3.5 sm:p-4 border-t border-[#E7E9F0] bg-white space-y-2">
          {speechError && (
            <div className="text-[12px] text-amber-800 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200">
              {speechError}
            </div>
          )}

          <form 
            onSubmit={(e) => { e.preventDefault(); handleSendMessage(input); }}
            className="flex items-center gap-2"
          >
            <button
              type="button"
              onClick={handleToggleVoice}
              className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
                isListening 
                  ? 'bg-rose-50 text-rose-600 border-rose-300 animate-pulse' 
                  : 'bg-[#F8F9FC] text-[#667085] border-[#E7E9F0] hover:text-[#172033]'
              }`}
              title={isListening ? 'Stop listening' : 'Voice Input'}
            >
              <Mic className="w-4 h-4" />
            </button>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about funds, goals, or affordability..."
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#F8F9FC] border border-[#E7E9F0] text-[#172033] text-[14px] placeholder:text-[#98A2B3] focus:outline-none focus:border-teal-500 focus:bg-white"
            />

            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="glow-btn-primary p-2.5 rounded-xl text-white cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </aside>
    </>
  );
};
