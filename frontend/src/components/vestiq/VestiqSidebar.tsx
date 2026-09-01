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

  const handleCancelRename = () => {
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

  // Filtered sessions based on search
  const filteredSessions = sessions.filter((s) =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <aside className="w-[280px] min-w-[280px] h-full bg-[#0A1022] border-r border-white/[0.08] flex flex-col justify-between shrink-0 font-sans z-20">
      
      {/* Top Header & Actions */}
      <div className="p-3 space-y-2.5 border-b border-white/[0.06]">
        {/* New Analysis Trigger */}
        <button
          type="button"
          onClick={() => {
            onNewAnalysis();
            onCloseMobile?.();
          }}
          disabled={loading}
          className="w-full h-[38px] rounded-lg bg-[#00D4AA] text-[#050816] font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-60"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Session</span>
        </button>

        {/* Quick Search */}
        {onSearchChange && (
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#5A667A] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search recent analysis..."
              className="w-full h-[32px] pl-8 pr-3 text-xs bg-[#101827] border border-white/[0.08] rounded-lg text-white placeholder-[#5A667A] focus:outline-none focus:border-[#00D4AA] transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8A94A6] hover:text-white cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        )}

        {/* Section Header */}
        <div className="flex items-center justify-between px-1 text-[10.5px] font-bold text-[#8A94A6] uppercase tracking-wider pt-0.5">
          <span>Recent Sessions</span>
          <span className="font-mono">{filteredSessions.length}</span>
        </div>
      </div>

      {/* Main Conversation List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {filteredSessions.length === 0 ? (
          <div className="p-4 rounded-lg bg-[#101827] border border-white/[0.06] text-center text-xs text-[#8A94A6] space-y-2 mt-2">
            <MessageSquare className="w-5 h-5 text-[#5A667A] mx-auto" />
            <div className="font-bold text-white">No sessions yet</div>
            <p className="text-[11px] text-[#8A94A6] leading-relaxed">
              Start an analysis with VestIQ.
            </p>
            <button
              onClick={() => {
                onNewAnalysis();
                onCloseMobile?.();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#00D4AA]/10 border border-[#00D4AA]/30 text-[#00D4AA] text-xs font-bold cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>+ New Session</span>
            </button>
          </div>
        ) : (
          <div className="space-y-1">
            {filteredSessions.map((sess) => {
              const isActive = activeSessionId === sess.id;
              const isEditing = editingId === sess.id;
              const isDeleting = deleteConfirmId === sess.id;

              if (isDeleting) {
                return (
                  <div
                    key={sess.id}
                    className="p-2.5 rounded-lg bg-[#FF5252]/10 border border-[#FF5252]/30 text-xs text-[#FF5252] space-y-2"
                  >
                    <div className="flex items-center gap-1.5 font-bold">
                      <AlertTriangle className="w-3.5 h-3.5 text-[#FF5252] shrink-0" />
                      <span>Delete conversation?</span>
                    </div>
                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        onClick={cancelDelete}
                        className="px-2 py-0.5 rounded bg-[#101827] border border-white/[0.08] text-[#8A94A6] text-xs hover:text-white cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={(e) => confirmDelete(sess.id, e)}
                        className="px-2 py-0.5 rounded bg-[#FF5252] text-white text-xs font-bold cursor-pointer"
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
                    className="p-1.5 rounded-lg bg-[#101827] border border-[#00D4AA] flex items-center gap-1.5"
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
                      className="flex-1 h-6 px-2 text-xs bg-[#0A1022] border border-white/[0.08] rounded text-white focus:outline-none"
                    />
                    <button
                      onClick={(e) => handleSaveRename(sess.id, e)}
                      className="p-1 text-[#00D4AA] hover:text-white cursor-pointer"
                      title="Save"
                    >
                      <Check className="w-3 h-3" />
                    </button>
                    <button
                      onClick={handleCancelRename}
                      className="p-1 text-[#8A94A6] hover:text-white cursor-pointer"
                      title="Cancel"
                    >
                      <X className="w-3 h-3" />
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
                  className={`group relative flex items-center justify-between p-2 rounded-lg text-xs transition-all cursor-pointer border ${
                    isActive 
                      ? 'bg-[#101827] text-[#00D4AA] font-bold border-white/[0.08] shadow-xs' 
                      : 'border-transparent text-[#8A94A6] hover:text-white hover:bg-[#101827]/60'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate flex-1 min-w-0 pr-1">
                    <span className="text-[#5A667A] shrink-0 text-xs">
                      {sess.is_pinned ? '📌' : '💬'}
                    </span>
                    <span className="truncate text-xs" title={sess.title}>
                      {sess.title}
                    </span>
                  </div>

                  {/* Actions on hover */}
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onTogglePinSession(sess.id, !sess.is_pinned);
                      }}
                      className="p-1 rounded text-[#8A94A6] hover:text-white"
                      title={sess.is_pinned ? 'Unpin' : 'Pin'}
                    >
                      <Pin className={`w-3 h-3 ${sess.is_pinned ? 'text-amber-400' : ''}`} />
                    </button>

                    <button
                      onClick={(e) => startRename(sess, e)}
                      className="p-1 rounded text-[#8A94A6] hover:text-white"
                      title="Rename"
                    >
                      <Edit3 className="w-3 h-3" />
                    </button>

                    <button
                      onClick={(e) => handleDeletePrompt(sess.id, e)}
                      className="p-1 rounded text-[#8A94A6] hover:text-[#FF5252]"
                      title="Delete"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-white/[0.06] bg-[#0A1022] text-[11px] text-[#8A94A6] space-y-0.5">
        <div className="font-bold text-white flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00D4AA] animate-pulse" />
          <span>VestIQ Quantitative Intelligence</span>
        </div>
        <div className="text-[10px] text-[#5A667A]">
          SmartVest Fiduciary Algorithms
        </div>
      </div>

    </aside>
  );
};
