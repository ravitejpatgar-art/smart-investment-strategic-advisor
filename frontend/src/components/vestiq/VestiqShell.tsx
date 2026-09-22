import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useFintechStore } from '../../store/useFintechStore';
import { authApi } from '../../services/api';
import { auditLogger } from '../../services/auditLogger';
import { buildUserContext } from '../../services/userProfileRepository';
import {
  buildGroundedContext,
  generateGroundedOfflineResponse,
  parseAssistantApiResponse,
  isGenericOnboardingText,
  isGreetingOrHelpQuery
} from '../../services/vestiqGrounding';
import { VestiqHeader } from './VestiqHeader';
import { VestiqSidebar, type VestiqSession } from './VestiqSidebar';
import { VestiqContextPanel } from './VestiqContextPanel';
import { VestiqEmptyState } from './VestiqEmptyState';
import { VestiqConversation } from './VestiqConversation';
import type { VestiqChatMessage } from './VestiqMessage';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { 
  formatConversationAsPlainText, 
  generateVestiqPdf 
} from '../../services/vestiqPdfGenerator';

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
  const [copiedChat, setCopiedChat] = useState<boolean>(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState<boolean>(false);

  // Responsive drawer states
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [contextOpen, setContextOpen] = useState(false);

  const latestRequestIdRef = useRef<string>('');
  const isCreatingRef = useRef<boolean>(false);
  const isRequestInProgressRef = useRef<boolean>(false);

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
          let calcData = m.calculations || m.metadata?.calculations || undefined;
          let followUps = m.followUps || m.follow_ups || m.metadata?.followUps || undefined;
          let intent = m.intent || m.metadata?.intent || undefined;
          let entities = m.entities || m.metadata?.entities || undefined;

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
  const handleSendMessage = async (
    userText: string, 
    isRetry: boolean = false, 
    baseMessages?: VestiqChatMessage[]
  ) => {
    const trimmedText = userText.trim();
    if (!trimmedText || loading || isRequestInProgressRef.current) return;
    isRequestInProgressRef.current = true;

    setError(null);
    setLastQuery(trimmedText);
    const reqId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    latestRequestIdRef.current = reqId;

    auditLogger.ai('VESTIQ_REQUEST_INITIATED', 'info', { requestId: reqId, isRetry });

    const tempUserMsgId = `usr_${Date.now()}`;
    const userMsg: VestiqChatMessage = {
      id: tempUserMsgId,
      sender: 'user',
      text: trimmedText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const sourceMessages = baseMessages !== undefined ? baseMessages : messages;

    // If retrying, check if user message is already the last message to avoid duplicates
    let updatedMessages: VestiqChatMessage[];
    if (isRetry && sourceMessages.length > 0 && sourceMessages[sourceMessages.length - 1].sender === 'user') {
      updatedMessages = [...sourceMessages];
    } else {
      updatedMessages = [...sourceMessages, userMsg];
      setMessages(updatedMessages);
    }
    setLoading(true);

    const currentConvId = activeSessionId;

    // Background persistence task: create conversation & persist user message asynchronously
    // MUST NOT block the AI assistant request
    const convPersistencePromise = (async (): Promise<string | null> => {
      let validConvId = currentConvId || '';
      try {
        if (!validConvId) {
          const newConv = await authApi.createConversation();
          if (newConv && newConv.id) {
            validConvId = newConv.id;
            setActiveSessionId(validConvId);
            updateUrlForConversation(validConvId);
          }
        }
        if (validConvId && !isRetry) {
          await authApi.addConversationMessage(validConvId, 'user', trimmedText, tempUserMsgId);
        }
        return validConvId;
      } catch (convErr) {
        console.warn('[VestIQ] Background conversation/user message persist notice:', convErr);
        return validConvId || null;
      }
    })();

    try {
      // Build context & dispatch existing AI Reasoning Engine IMMEDIATELY
      const userContext = buildUserContext(user, expenses, goals, strategy);
      const chatHistory = updatedMessages.slice(-8).map((m) => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text,
      }));

      const res = await authApi.askAssistant({
        question: trimmedText,
        message: trimmedText,
        query: trimmedText,
        requestId: reqId,
        user_context: userContext,
        history: chatHistory,
        conversation_id: currentConvId || undefined,
      });

      // Reject stale responses: if a newer request was dispatched, drop this older response
      if (latestRequestIdRef.current !== reqId) {
        return;
      }
      if (res?.requestId && res.requestId !== reqId) {
        return;
      }

      // Step 6 & 7: Parse once, display real response immediately, stop loading immediately
      const parsed = parseAssistantApiResponse(res, trimmedText);
      let answerText = parsed.text;

      // Step 8: Validate displayed response is not an unrelated generic onboarding message unless user explicitly asked for onboarding/help
      if (isGenericOnboardingText(answerText) && !isGreetingOrHelpQuery(trimmedText)) {
        answerText = "I can't verify the current market information needed to answer this question right now.";
      }

      const calcData = parsed.calculations;
      const followUps = parsed.followUps;

      const tempAiMsgId = `ai_${Date.now()}`;
      const assistantMsg: VestiqChatMessage = {
        id: tempAiMsgId,
        sender: 'assistant',
        text: answerText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        calculations: calcData,
        followUps: followUps && followUps.length > 0 ? followUps : undefined,
        intent: parsed.intent || res?.intent,
        entities: parsed.entities || res?.entities,
      };

      // IMMEDIATELY render assistant message and unblock UI
      setMessages((prev) => [...prev, assistantMsg]);
      setLoading(false);

      auditLogger.ai('VESTIQ_REQUEST_COMPLETED', 'success', { requestId: reqId, hasCalculations: !!calcData });

      // Background persistence: persist assistant response and refresh sessions without blocking UI
      convPersistencePromise.then(async (validConvId) => {
        if (validConvId) {
          try {
            await authApi.addConversationMessage(validConvId, 'assistant', answerText, tempAiMsgId);
          } catch (aiMsgErr) {
            console.warn('[VestIQ] Background assistant message persist notice:', aiMsgErr);
          }
        }
        try {
          await fetchConversations();
        } catch (fetchErr) {
          console.warn('[VestIQ] Background fetch conversations notice:', fetchErr);
        }
      }).catch((bgErr) => {
        console.warn('[VestIQ] Background persistence notice:', bgErr);
      });

    } catch (err: any) {
      console.error('[VestIQ] Error during message exchange:', err);
      auditLogger.ai('VESTIQ_REQUEST_FAILED', 'warning', { requestId: reqId, status: err?.response?.status || 'OFFLINE' });
      const status = err?.response?.status;
      const detail = err?.response?.data?.detail || err?.response?.data?.message || err?.message;

      // Stale check in catch block: if a newer request was dispatched, ignore older failure
      if (latestRequestIdRef.current !== reqId) {
        return;
      }

      // Timeout detection (Step 4 & Step 8): Must display honest message without fake fallback
      const isTimeout =
        err?.code === 'ECONNABORTED' ||
        err?.code === 'ETIMEDOUT' ||
        (typeof err?.message === 'string' && err.message.toLowerCase().includes('timeout'));

      if (isTimeout) {
        const timeoutNotice = "VestIQ couldn't receive a response in time. Please try again.";
        setError(timeoutNotice);
        const timeoutMsg: VestiqChatMessage = {
          id: `ai_timeout_${Date.now()}`,
          sender: 'assistant',
          text: timeoutNotice,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, timeoutMsg]);
        return;
      }
      
      if (status === 401 || status === 403) {
        setError("Session expired or authentication required. Please sign in.");
        const authMsg: VestiqChatMessage = {
          id: `ai_auth_${Date.now()}`,
          sender: 'assistant',
          text: "⚠️ **Authentication Required:** Your session has expired or authentication is required. Please sign in to access personalized advisory and saved conversation history.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, authMsg]);
      } else if (status && status >= 500) {
        const errorText = typeof detail === 'string' && detail.trim()
          ? detail
          : "The advisory service encountered an error and could not process this request right now. Please try again.";
        setError(errorText);
        const errorMsg: VestiqChatMessage = {
          id: `ai_err_${Date.now()}`,
          sender: 'assistant',
          text: `⚠️ **Advisory Service Notice:** ${errorText}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, errorMsg]);
      } else {
        if (status === 429) {
          setError("Rate limit reached. Operating under local grounded advisory.");
        }
        
        // Grounded offline reasoning fallback using authoritative profile
        const groundedCtx = buildGroundedContext(user, expenses, goals, strategy);
        const offlineRes = generateGroundedOfflineResponse(trimmedText, groundedCtx);
        let offlineText = offlineRes.text;

        // Step 8: Never show generic onboarding text for a specific question
        if (isGenericOnboardingText(offlineText) && !isGreetingOrHelpQuery(trimmedText)) {
          offlineText = "I can't verify the current market information needed to answer this question right now.";
        }

        const tempAiMsgId = `ai_offline_${Date.now()}`;
        const assistantMsg: VestiqChatMessage = {
          id: tempAiMsgId,
          sender: 'assistant',
          text: offlineText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          calculations: offlineRes.calculations || null,
          followUps: offlineRes.followUps && offlineRes.followUps.length > 0 ? offlineRes.followUps : undefined,
          intent: offlineRes.intent
        };
        setMessages((prev) => [...prev, assistantMsg]);
      }
    } finally {
      isRequestInProgressRef.current = false;
      isCreatingRef.current = false;
      setLoading(false);
    }
  };

  // 9. Edit user message with conversational truncation (ChatGPT behavior)
  const handleEditMessage = async (messageId: string, newText: string) => {
    const trimmed = newText.trim();
    if (!trimmed || loading) return;

    const targetIdx = messages.findIndex((m) => m.id === messageId);
    if (targetIdx === -1) return;

    // Truncate everything from targetIdx onwards
    const preservedBefore = messages.slice(0, targetIdx);
    
    // Set state immediately to branch from target position
    setMessages(preservedBefore);
    
    // Submit updated turn using preserved history
    await handleSendMessage(trimmed, false, preservedBefore);
  };

  // 10. Delete user message with conversational truncation
  const handleDeleteMessage = (messageId: string) => {
    if (loading) return;

    const targetIdx = messages.findIndex((m) => m.id === messageId);
    if (targetIdx === -1) return;

    // Remove that message AND everything after it
    const truncated = messages.slice(0, targetIdx);
    setMessages(truncated);
  };

  // 11. Copy entire conversation as readable plain text
  const handleCopyChat = async () => {
    if (messages.length === 0) return;
    const plainText = formatConversationAsPlainText(messages);
    try {
      await navigator.clipboard.writeText(plainText);
      setCopiedChat(true);
      setTimeout(() => setCopiedChat(false), 2000);
    } catch {
      setCopiedChat(false);
    }
  };

  // 12. Download conversation as styled PDF report
  const handleDownloadPdf = () => {
    if (messages.length === 0 || isDownloadingPdf) return;
    setIsDownloadingPdf(true);
    try {
      generateVestiqPdf({ messages, user });
    } finally {
      setTimeout(() => setIsDownloadingPdf(false), 800);
    }
  };

  const handleRetry = () => {
    if (lastQuery) {
      handleSendMessage(lastQuery, true);
    }
  };

  return (
    <div className="h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)] flex flex-col overflow-hidden font-sans selection:bg-teal-500/20 selection:text-teal-900">
      
      {/* Top Header */}
      <VestiqHeader
        onNewAnalysis={handleNewAnalysis}
        onBackToSmartVest={() => setActiveView('dashboard')}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onToggleContext={() => setContextOpen(!contextOpen)}
        onCopyChat={handleCopyChat}
        onDownloadPdf={handleDownloadPdf}
        hasMessages={messages.length > 0}
        copiedChat={copiedChat}
        isDownloadingPdf={isDownloadingPdf}
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
        <main className={`flex-1 min-h-0 p-3 sm:p-6 flex flex-col justify-between ${messages.length === 0 ? 'overflow-y-auto' : 'overflow-hidden'}`}>
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
              onEditMessage={handleEditMessage}
              onDeleteMessage={handleDeleteMessage}
            />
          )}
        </main>

        {/* Right: Personal SmartVest Context Panel (Desktop >= 1280px) */}
        <div className="hidden xl:flex p-4 border-l border-[var(--color-border)] bg-[var(--color-surface)] h-full overflow-y-auto">
          <VestiqContextPanel onNavigateToProfile={() => setActiveView('profile')} />
        </div>

        {/* Mobile / Tablet Right Context Drawer */}
        {contextOpen && (
          <div className="xl:hidden fixed inset-0 z-50 flex justify-end animate-fade-in">
            <div
              onClick={() => setContextOpen(false)}
              className="fixed inset-0 bg-black/40"
            />
            <div className="relative z-10 w-[300px] bg-[var(--color-surface)] border-l border-[var(--color-border)] h-full p-4 shadow-2xl overflow-y-auto animate-slide-left">
              <div className="flex items-center justify-between pb-3 mb-2 border-b border-[var(--color-border-subtle)]">
                <span className="font-bold text-[var(--color-text-primary)] text-[13px] uppercase tracking-wider">SmartVest Context</span>
                <button onClick={() => setContextOpen(false)} className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">
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
