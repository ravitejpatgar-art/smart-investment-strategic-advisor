import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useFintechStore } from '../../store/useFintechStore';
import { authApi } from '../../services/api';
import { buildUserContext } from '../../services/userProfileRepository';
import { VestiqHeader } from './VestiqHeader';
import { VestiqSidebar, type VestiqSession } from './VestiqSidebar';
import { VestiqContextPanel } from './VestiqContextPanel';
import { VestiqEmptyState } from './VestiqEmptyState';
import { VestiqConversation } from './VestiqConversation';
import type { VestiqChatMessage } from './VestiqMessage';
import { AlertCircle, RefreshCw } from 'lucide-react';

export const VestiqShell: React.FC = () => {
  const { user, expenses, goals, strategy, setActiveView } = useFintechStore();

  // Sessions list
  const [sessions, setSessions] = useState<VestiqSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<VestiqChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationsLoadError, setConversationsLoadError] = useState<string | null>(null);
  const [lastQuery, setLastQuery] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Responsive drawer states
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [contextOpen, setContextOpen] = useState(false);

  const latestRequestIdRef = useRef<string>('');
  const isCreatingRef = useRef<boolean>(false);

  // Helper to sync conversation ID to URL
  const updateUrlForConversation = (id: string | null) => {
    try {
      if (id) {
        window.history.pushState({}, '', `/vestiq/chat/${id}`);
      } else {
        window.history.pushState({}, '', '/vestiq');
      }
    } catch {
      // Ignore
    }
  };

  // 1. Fetch conversations from backend
  const fetchConversations = useCallback(async () => {
    setConversationsLoadError(null);
    try {
      const data = await authApi.getConversations();
      if (Array.isArray(data)) {
        setSessions(data);
        return data;
      }
      setSessions([]);
      return [];
    } catch (err: any) {
      const status = err?.response?.status;
      const errorDetail = err?.response?.data?.detail || err?.message || 'Network / Connection Error';
      const reqUrl = err?.config?.url || '/conversations';
      console.warn('[VestIQ Diagnostic]', {
        requestUrl: reqUrl,
        status: status ?? 'CONNECTION_REFUSED',
        error: errorDetail,
      });
      setConversationsLoadError('Unable to load your conversations.');
      return [];
    }
  }, []);


  // 2. Load a specific conversation and its messages
  const loadConversation = useCallback(async (sessionId: string) => {
    setError(null);
    try {
      const data = await authApi.getConversation(sessionId);
      if (data && data.id) {
        setActiveSessionId(data.id);
        updateUrlForConversation(data.id);
        
        const mappedMessages: VestiqChatMessage[] = (data.messages || []).map((m: any) => {
          let calcData = undefined;
          let followUps = undefined;
          let intent = undefined;
          let entities = undefined;

          // Attempt to parse structured AI metadata if present in content
          return {
            id: m.id,
            sender: m.role === 'user' ? 'user' : 'assistant',
            text: m.content,
            timestamp: m.created_at ? new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now',
            calculations: calcData,
            followUps: followUps,
            intent: intent,
            entities: entities
          };
        });

        setMessages(mappedMessages);
        return;
      }
    } catch (err) {
      console.error(`Failed to load conversation ${sessionId}:`, err);
      setError('Unable to load this conversation. It may have been deleted.');
    }
  }, []);

  // 3. Initial load & URL routing
  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      const convs = await fetchConversations();

      if (!isMounted) return;

      // Check if URL has a chat ID (e.g. /vestiq/chat/conv_123 or ?chat=conv_123)
      let initialChatId: string | null = null;
      try {
        const path = window.location.pathname;
        const match = path.match(/\/vestiq\/chat\/([^\/\?]+)/i);
        if (match && match[1]) {
          initialChatId = match[1];
        } else {
          const params = new URLSearchParams(window.location.search);
          initialChatId = params.get('chat') || params.get('id');
        }
      } catch {
        // Ignore
      }

      if (initialChatId && convs.some((c: VestiqSession) => c.id === initialChatId)) {
        await loadConversation(initialChatId);
      } else if (convs.length > 0) {
        if (initialChatId) {
          await loadConversation(convs[0].id);
        }
      }
    };

    init();

    return () => {
      isMounted = false;
    };
  }, [fetchConversations, loadConversation]);


  // Deep-linking / URL query listener for initial query prompts (e.g., /ai?topic=nvidia or /ai?q=...)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const topic = params.get('topic') || params.get('q');
      if (topic) {
        let formattedQuery = topic;
        if (topic.toLowerCase() === 'nvidia') formattedQuery = 'Why is Nvidia moving and what is its valuation outlook?';
        else if (topic.toLowerCase() === 'portfolio') formattedQuery = 'Review my portfolio and asset allocation';
        else if (topic.toLowerCase() === 'goal') formattedQuery = 'How much monthly SIP do I need for my primary goal?';
        
        handleSendMessage(formattedQuery);
      }
    } catch {
      // Ignore
    }
  }, []);

  // 4. Start + New Analysis
  const handleNewAnalysis = () => {
    // If current conversation has 0 messages, we are already in an empty new analysis state
    if (activeSessionId && messages.length === 0) {
      setSidebarOpen(false);
      return;
    }
    setActiveSessionId(null);
    setMessages([]);
    setError(null);
    updateUrlForConversation(null);
    setSidebarOpen(false);
  };

  // 5. Rename conversation
  const handleRenameConversation = async (id: string, newTitle: string) => {
    try {
      await authApi.renameConversation(id, newTitle);
      setSessions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, title: newTitle } : s))
      );
    } catch (err) {
      console.error('Failed to rename conversation:', err);
    }
  };

  // 6. Pin / Unpin conversation
  const handleTogglePin = async (id: string, isPinned: boolean) => {
    try {
      await authApi.pinConversation(id, isPinned);
      // Re-fetch to guarantee backend ordering (pinned first, newest first)
      await fetchConversations();
    } catch (err) {
      console.error('Failed to pin/unpin conversation:', err);
    }
  };

  // 7. Delete conversation
  const handleDeleteConversation = async (id: string) => {
    try {
      await authApi.deleteConversation(id);
      setSessions((prev) => prev.filter((s) => s.id !== id));
      if (activeSessionId === id) {
        handleNewAnalysis();
      }
    } catch (err) {
      console.error('Failed to delete conversation:', err);
    }
  };

  // 8. Send message with backend persistence and advisory AI execution
  const handleSendMessage = async (userText: string, isRetry: boolean = false) => {
    const trimmedText = userText.trim();
    if (!trimmedText || loading || isCreatingRef.current) return;

    setError(null);
    setLastQuery(trimmedText);
    const reqId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    latestRequestIdRef.current = reqId;

    const tempUserMsgId = `usr_${Date.now()}`;
    const userMsg: VestiqChatMessage = {
      id: tempUserMsgId,
      sender: 'user',
      text: trimmedText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // If retrying, check if user message is already the last message to avoid duplicates
    let updatedMessages: VestiqChatMessage[];
    if (isRetry && messages.length > 0 && messages[messages.length - 1].sender === 'user') {
      updatedMessages = [...messages];
    } else {
      updatedMessages = [...messages, userMsg];
      setMessages(updatedMessages);
    }
    setLoading(true);

    let currentConvId = activeSessionId;

    try {
      isCreatingRef.current = true;

      // 1. If no active conversation, create one on backend
      let validConvId: string = currentConvId || '';
      if (!validConvId) {
        try {
          const newConv = await authApi.createConversation();
          if (newConv && newConv.id) {
            validConvId = newConv.id;
            setActiveSessionId(validConvId);
            updateUrlForConversation(validConvId);
          }
        } catch (convErr) {
          console.warn('[VestIQ] Conversation create notice:', convErr);
        }
      }

      // 2. Persist user message to backend
      if (validConvId && !isRetry) {
        try {
          await authApi.addConversationMessage(validConvId, 'user', trimmedText, tempUserMsgId);
        } catch (msgErr) {
          console.warn('[VestIQ] User message persist notice:', msgErr);
        }
      }

      // 3. Build context & call existing AI Reasoning Engine
      const userContext = buildUserContext(user, expenses, goals, strategy);
      const chatHistory = updatedMessages.slice(-8).map((m) => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text,
      }));

      const res = await authApi.askAssistant({
        question: trimmedText,
        message: trimmedText,
        requestId: reqId,
        user_context: userContext,
        history: chatHistory,
      });

      if (res?.requestId && res.requestId !== latestRequestIdRef.current) {
        return;
      }

      let answerText = res?.answer || res?.response || '';
      let calcData = res?.calculations || null;
      let followUps = res?.followUps || [];

      if (!answerText) {
        answerText = `I have analyzed your query regarding "${trimmedText}". Let me know if you would like me to simulate additional wealth scenarios.`;
      }

      const tempAiMsgId = `ai_${Date.now()}`;
      const assistantMsg: VestiqChatMessage = {
        id: tempAiMsgId,
        sender: 'assistant',
        text: answerText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        calculations: calcData,
        followUps: followUps.length > 0 ? followUps : undefined,
        intent: res?.intent,
        entities: res?.entities,
      };

      // 4. Persist assistant message to backend
      if (validConvId) {
        try {
          await authApi.addConversationMessage(validConvId, 'assistant', answerText, tempAiMsgId);
        } catch (aiMsgErr) {
          console.warn('[VestIQ] Assistant message persist notice:', aiMsgErr);
        }
      }

      // 5. Update messages and refresh conversation list
      setMessages((prev) => [...prev, assistantMsg]);
      await fetchConversations();

    } catch (err: any) {
      console.error('[VestIQ] Error during message exchange:', err);
      const status = err?.response?.status;
      const detail = err?.response?.data?.detail;
      
      if (status === 401 || status === 403) {
        setError("Session expired or authentication required. Please sign in.");
      } else if (status === 404) {
        setError("AI advisory endpoint not found on backend.");
      } else if (status === 429) {
        setError("Rate limit reached. Please wait a moment before retrying.");
      } else if (status === 500) {
        setError(detail || "Backend processing error. Please retry.");
      } else if (!err?.response) {
        setError("Unable to connect to SmartVest backend. Please check network connection and retry.");
      } else {
        setError(detail || "VestIQ couldn't complete that request.");
      }
    } finally {
      isCreatingRef.current = false;
      setLoading(false);
    }
  };

  const handleRetry = () => {
    if (lastQuery) {
      handleSendMessage(lastQuery, true);
    }
  };

  return (
    <div className="h-screen bg-[#F6F7FB] text-[#172033] flex flex-col overflow-hidden font-sans selection:bg-teal-500/20 selection:text-teal-900">
      
      {/* Top Header */}
      <VestiqHeader
        onNewAnalysis={handleNewAnalysis}
        onBackToSmartVest={() => setActiveView('dashboard')}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onToggleContext={() => setContextOpen(!contextOpen)}
      />

      {/* Main 3-Column Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Left: AI Sidebar (Persistent on Desktop >=1024px) */}
        <div className="hidden lg:flex h-full">
          <VestiqSidebar
            sessions={sessions}
            activeSessionId={activeSessionId}
            onSelectSession={loadConversation}
            onNewAnalysis={handleNewAnalysis}
            onRenameSession={handleRenameConversation}
            onTogglePinSession={handleTogglePin}
            onDeleteSession={handleDeleteConversation}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            loading={loading}
          />
        </div>

        {/* Mobile Left Sidebar Drawer */}
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex animate-fade-in">
            <div
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/40"
            />
            <div className="relative z-10 w-[290px] bg-white h-full shadow-2xl animate-slide-left">
              <VestiqSidebar
                sessions={sessions}
                activeSessionId={activeSessionId}
                onSelectSession={(id) => {
                  loadConversation(id);
                  setSidebarOpen(false);
                }}
                onNewAnalysis={handleNewAnalysis}
                onRenameSession={handleRenameConversation}
                onTogglePinSession={handleTogglePin}
                onDeleteSession={handleDeleteConversation}
                onCloseMobile={() => setSidebarOpen(false)}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                loading={loading}
              />
            </div>
          </div>
        )}

        {/* Center: AI Workspace */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col justify-between">
          {/* Non-blocking banner when conversation history fails to load */}
          {conversationsLoadError && (
            <div className="mb-3 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-500" />
              <span className="flex-1">Chat history unavailable — backend connecting. You can still send messages.</span>
              <button
                onClick={() => fetchConversations()}
                className="ml-2 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-800 font-semibold transition-all cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                Retry
              </button>
            </div>
          )}
          {messages.length === 0 ? (
            <VestiqEmptyState
              onSend={handleSendMessage}
              loading={loading}
            />
          ) : (
            <VestiqConversation
              messages={messages}
              loading={loading}
              error={error}
              onSend={handleSendMessage}
              onClear={handleNewAnalysis}
              onRetry={handleRetry}
              onNewAnalysis={handleNewAnalysis}
            />
          )}
        </main>

        {/* Right: Personal SmartVest Context Panel (Desktop >= 1280px) */}
        <div className="hidden xl:flex p-4 border-l border-[#E7EAF0] bg-[#F8FAFC] h-full overflow-y-auto">
          <VestiqContextPanel onNavigateToProfile={() => setActiveView('profile')} />
        </div>

        {/* Mobile / Tablet Right Context Drawer */}
        {contextOpen && (
          <div className="xl:hidden fixed inset-0 z-50 flex justify-end animate-fade-in">
            <div
              onClick={() => setContextOpen(false)}
              className="fixed inset-0 bg-black/40"
            />
            <div className="relative z-10 w-[300px] bg-white h-full p-4 shadow-2xl overflow-y-auto animate-slide-left">
              <div className="flex items-center justify-between pb-3 mb-2 border-b border-[#E7EAF0]">
                <span className="font-bold text-[#172033] text-[13px] uppercase tracking-wider">SmartVest Context</span>
                <button onClick={() => setContextOpen(false)} className="text-[#667085] hover:text-[#172033]">
                  ✕
                </button>
              </div>
              <VestiqContextPanel onNavigateToProfile={() => { setActiveView('profile'); setContextOpen(false); }} />
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
