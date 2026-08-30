import React, { useState } from 'react';
import { 
  Plus, 
  MessageSquare, 
  Pin, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  Search,
  AlertTriangle
} from 'lucide-react';


export interface VestiqSession {
  id: string;
  user_id?: number;
  title: string;
  is_pinned: boolean;
  message_count: number;
  last_message_at: string;
  created_at: string;
  updated_at: string;
}

interface VestiqSidebarProps {
  sessions: VestiqSession[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewAnalysis: () => void;
  onRenameSession: (id: string, newTitle: string) => void;
  onTogglePinSession: (id: string, isPinned: boolean) => void;
  onDeleteSession: (id: string) => void;
  onCloseMobile?: () => void;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  loading?: boolean;
}

export const VestiqSidebar: React.FC<VestiqSidebarProps> = ({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewAnalysis,
  onRenameSession,
  onTogglePinSession,
  onDeleteSession,
  onCloseMobile,
  searchQuery = '',
  onSearchChange,
  loading = false,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const startRename = (sess: VestiqSession, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(sess.id);
    setEditTitle(sess.title);
  };

  const handleSaveRename = (id: string, e?: React.MouseEvent | React.FormEvent) => {
    if (e) e.stopPropagation();
    const trimmed = editTitle.trim();
    if (trimmed && trimmed.length <= 60) {
      onRenameSession(id, trimmed);
    }
    setEditingId(null);
    setEditTitle('');
  };

  const handleCancelRename = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingId(null);
    setEditTitle('');
  };

  const handleDeletePrompt = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteConfirmId(id);
  };

  const confirmDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteSession(id);
    setDeleteConfirmId(null);
  };

  const cancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteConfirmId(null);
  };

  // Filter sessions if search query is provided
  const filteredSessions = sessions.filter((s) => {
    if (!searchQuery.trim()) return true;
    return s.title.toLowerCase().includes(searchQuery.toLowerCase().trim());
  });

  return (
    <aside className="w-[280px] flex flex-col shrink-0 bg-white border-r border-[#E7EAF0] h-full select-none justify-between font-sans shadow-xs">
      
      {/* Top Header & Search Area */}
      <div className="p-3.5 space-y-3 pb-2">
        
        {/* Mobile Header with close button */}
        {onCloseMobile && (
          <div className="lg:hidden flex items-center justify-between pb-2 border-b border-[#E7EAF0]">
            <span className="font-bold text-[#172033] text-[13px] uppercase tracking-wider">VestIQ Navigation</span>
            <button onClick={onCloseMobile} className="p-1 text-[#667085] hover:text-[#172033]">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Primary CTA: + New Analysis */}
        <button
          onClick={() => {
            onNewAnalysis();
            onCloseMobile?.();
          }}
          disabled={loading}
          className="w-full h-[42px] rounded-xl glow-btn-primary text-white font-bold text-[13.5px] flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer hover:shadow-teal-500/20 active:scale-[0.98] disabled:opacity-60"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Analysis</span>
        </button>

        {/* Quick Search */}
        {onSearchChange && (
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#98A2B3] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search recent chats..."
              className="w-full h-[34px] pl-8 pr-3 text-[12.5px] bg-[#F8FAFC] border border-[#E7EAF0] rounded-lg text-[#172033] placeholder-[#98A2B3] focus:outline-none focus:border-teal-500 focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#98A2B3] hover:text-[#172033]"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        )}

        {/* Section Header */}
        <div className="flex items-center justify-between px-1 text-[11px] font-bold text-[#98A2B3] uppercase tracking-wider pt-1">
          <span>Recent Chats</span>
          <span>{filteredSessions.length}</span>
        </div>
      </div>

      {/* Main Conversation List (ChatGPT-Style) */}
      <div className="flex-1 overflow-y-auto px-3 space-y-1">
        {filteredSessions.length === 0 ? (
          <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E7EAF0] text-center text-[12.5px] text-[#667085] space-y-2 mt-2">
            <MessageSquare className="w-5 h-5 text-slate-400 mx-auto" />
            <div className="font-semibold text-[#172033]">No conversations yet</div>
            <p className="text-[11.5px] text-[#98A2B3] leading-relaxed">
              Start a new financial analysis with VestIQ.
            </p>
            <button
              onClick={() => {
                onNewAnalysis();
                onCloseMobile?.();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-50 border border-teal-200 text-teal-800 text-[12px] font-bold hover:bg-teal-100 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ New Analysis</span>
            </button>
          </div>
        ) : (
          <div className="space-y-1 pb-2">
            {filteredSessions.map((sess) => {
              const isActive = activeSessionId === sess.id;
              const isEditing = editingId === sess.id;
              const isDeleting = deleteConfirmId === sess.id;

              if (isDeleting) {
                return (
                  <div
                    key={sess.id}
                    className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-[12px] text-rose-900 space-y-2 animate-fade-in"
                  >
                    <div className="flex items-center gap-1.5 font-bold">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                      <span>Delete this conversation?</span>
                    </div>
                    <p className="text-[11px] text-rose-700 leading-snug">
                      Messages will be removed. Your profile & financial records remain untouched.
                    </p>
                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        onClick={cancelDelete}
                        className="px-2 py-1 rounded bg-white border border-rose-200 text-rose-800 text-[11px] font-semibold hover:bg-rose-100 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={(e) => confirmDelete(sess.id, e)}
                        className="px-2 py-1 rounded bg-rose-600 text-white text-[11px] font-bold hover:bg-rose-700 cursor-pointer shadow-xs"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              }

              if (isEditing) {
                return (
                  <div
                    key={sess.id}
                    className="p-1.5 rounded-xl bg-teal-50/70 border border-teal-300 flex items-center gap-1.5 animate-fade-in"
                  >
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveRename(sess.id, e);
                        if (e.key === 'Escape') handleCancelRename();
                      }}
                      autoFocus
                      maxLength={60}
                      className="flex-1 h-7 px-2 text-[12.5px] bg-white border border-teal-300 rounded text-[#172033] focus:outline-none"
                    />
                    <button
                      onClick={(e) => handleSaveRename(sess.id, e)}
                      className="p-1 text-teal-700 hover:text-teal-900 hover:bg-teal-100 rounded cursor-pointer"
                      title="Save"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={handleCancelRename}
                      className="p-1 text-[#667085] hover:text-[#172033] hover:bg-slate-100 rounded cursor-pointer"
                      title="Cancel"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              }

              return (
                <div
                  key={sess.id}
                  onClick={() => {
                    onSelectSession(sess.id);
                    onCloseMobile?.();
                  }}
                  className={`group relative flex items-center justify-between p-2.5 rounded-xl text-[13px] transition-all cursor-pointer border ${
                    isActive 
                      ? 'bg-gradient-to-r from-teal-50/90 to-emerald-50/40 text-teal-950 font-semibold border-teal-300 shadow-xs' 
                      : 'border-transparent text-[#172033] hover:bg-[#F8FAFC] hover:border-[#E7EAF0]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate flex-1 min-w-0 pr-1">
                    {sess.is_pinned ? (
                      <span title="Pinned Chat" className="text-amber-500 shrink-0 text-[13px]">
                        📌
                      </span>
                    ) : (
                      <span className="text-[#667085] shrink-0 text-[13px]">
                        💬
                      </span>
                    )}
                    <span className="truncate text-[12.8px]" title={sess.title}>
                      {sess.title}
                    </span>
                  </div>

                  {/* Actions (Pin, Rename, Delete) - Reveal on hover or when active */}
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onTogglePinSession(sess.id, !sess.is_pinned);
                      }}
                      className={`p-1 rounded transition-colors ${
                        sess.is_pinned 
                          ? 'text-amber-600 hover:bg-amber-100/60' 
                          : 'text-[#667085] hover:text-[#172033] hover:bg-slate-200/60'
                      }`}
                      title={sess.is_pinned ? 'Unpin Chat' : 'Pin Chat'}
                    >
                      <Pin className={`w-3.5 h-3.5 ${sess.is_pinned ? 'fill-amber-500 text-amber-500' : ''}`} />
                    </button>

                    <button
                      onClick={(e) => startRename(sess, e)}
                      className="p-1 rounded text-[#667085] hover:text-[#172033] hover:bg-slate-200/60 transition-colors"
                      title="Rename Chat"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={(e) => handleDeletePrompt(sess.id, e)}
                      className="p-1 rounded text-[#667085] hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Delete Chat"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-[#E7EAF0] bg-[#F8FAFC] text-[11.5px] text-[#667085] space-y-1">
        <div className="font-bold text-[#172033] flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
          <span>VestIQ Intelligence Engine</span>
        </div>
        <div className="text-[10.5px] text-[#98A2B3]">
          Powered by SmartVest Algorithms
        </div>
      </div>

    </aside>
  );
};
