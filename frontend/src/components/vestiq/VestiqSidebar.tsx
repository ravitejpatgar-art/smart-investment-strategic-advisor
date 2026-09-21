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
  AlertTriangle,
  ShieldCheck
} from 'lucide-react';
import { useFintechStore } from '../../store/useFintechStore';

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
  const { user } = useFintechStore();
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

  const filteredSessions = sessions.filter((s) =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'R';

  return (
    <aside className="w-[280px] min-w-[280px] h-full bg-[var(--color-surface)] border-r border-[var(--color-border)] flex flex-col justify-between shrink-0 font-sans z-20 shadow-xs">
      
      {/* Top Header & Actions (StockGro Inspiration) */}
      <div className="p-3.5 space-y-3 border-b border-[var(--color-border-subtle)]">
        
        {/* Start a New Thread Trigger */}
        <button
          type="button"
          onClick={() => {
            onNewAnalysis();
            onCloseMobile?.();
          }}
          disabled={loading}
          className="w-full h-[40px] rounded-xl bg-[var(--color-surface-3)] hover:bg-[var(--color-border-strong)] border border-[var(--color-border)] text-[var(--color-text-primary)] font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs disabled:opacity-60"
        >
          <Plus className="w-4 h-4 text-[var(--color-accent-strong)] stroke-[2.5]" />
          <span>Start a New Thread</span>
        </button>

        {/* Quick Search */}
        {onSearchChange && (
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[var(--color-text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search conversations..."
              className="w-full h-[34px] pl-8 pr-3 text-xs bg-[var(--color-surface-3)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-accent)] focus:bg-[var(--color-surface)] transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        )}

        {/* Section Header */}
        <div className="flex items-center justify-between px-1 text-[10.5px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
          <span>Recent Threads</span>
          <span className="font-mono bg-[var(--color-surface-3)] px-1.5 py-0.5 rounded text-[10px] text-[var(--color-text-secondary)]">{filteredSessions.length}</span>
        </div>
      </div>

      {/* Main Conversation List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {filteredSessions.length === 0 ? (
          <div className="p-4 rounded-xl bg-slate-50 border border-[#E2E8F0] text-center text-xs text-[#64748B] space-y-2 mt-2">
            <MessageSquare className="w-5 h-5 text-[#94A3B8] mx-auto" />
            <div className="font-bold text-[#0F172A]">No threads yet</div>
            <p className="text-[11px] text-[#64748B] leading-relaxed">
              Ask anything about markets, funds, or wealth strategies.
            </p>
            <button
              onClick={() => {
                onNewAnalysis();
                onCloseMobile?.();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[var(--color-accent-soft)] border border-[var(--color-border-accent)] text-[var(--color-text-accent)] text-xs font-bold cursor-pointer hover:brightness-105"
            >
              <Plus className="w-3 h-3" />
              <span>+ New Thread</span>
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
                    className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-800 space-y-2"
                  >
                    <div className="flex items-center gap-1.5 font-bold">
                      <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                      <span>Delete thread?</span>
                    </div>
                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        onClick={cancelDelete}
                        className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700 text-xs hover:bg-slate-50 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={(e) => confirmDelete(sess.id, e)}
                        className="px-2 py-0.5 rounded bg-red-600 text-white text-xs font-bold cursor-pointer"
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
                    className="p-1.5 rounded-lg bg-white border border-teal-500 shadow-xs flex items-center gap-1.5"
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
                      className="flex-1 h-6 px-2 text-xs bg-slate-50 border border-slate-200 rounded text-[#0F172A] focus:outline-none"
                    />
                    <button
                      onClick={(e) => handleSaveRename(sess.id, e)}
                      className="p-1 text-teal-600 hover:text-teal-700 cursor-pointer"
                      title="Save"
                    >
                      <Check className="w-3 h-3" />
                    </button>
                    <button
                      onClick={handleCancelRename}
                      className="p-1 text-slate-500 hover:text-slate-700 cursor-pointer"
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
                      ? 'bg-[var(--accent-teal-dim)] text-[var(--color-text-accent)] font-bold border-[var(--border-accent)] shadow-2xs' 
                      : 'border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)]'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate flex-1 min-w-0 pr-1">
                    <span className="text-[var(--color-text-muted)] shrink-0 text-xs">
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
                      className="p-1 rounded text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                      title={sess.is_pinned ? 'Unpin' : 'Pin'}
                    >
                      <Pin className={`w-3 h-3 ${sess.is_pinned ? 'text-amber-500' : ''}`} />
                    </button>

                    <button
                      onClick={(e) => startRename(sess, e)}
                      className="p-1 rounded text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                      title="Rename"
                    >
                      <Edit3 className="w-3 h-3" />
                    </button>

                    <button
                      onClick={(e) => handleDeletePrompt(sess.id, e)}
                      className="p-1 rounded text-[var(--color-text-muted)] hover:text-red-500"
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

      {/* Bottom Area: Quota & User Profile Widget (StockGro Inspiration) */}
      <div className="p-3 border-t border-[var(--color-border-subtle)] bg-[var(--color-surface-3)] space-y-2.5">
        {/* Intelligence Status Pill */}
        <div className="p-2.5 rounded-xl bg-[var(--color-card)] border border-[var(--color-border)] space-y-1.5 shadow-2xs">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-bold text-[var(--color-text-primary)] flex items-center gap-1.5">
              <ShieldCheck className="w-3 h-3 text-[var(--color-accent-strong)]" />
              <span>Advisory Engine</span>
            </span>
            <span className="font-bold text-[var(--color-accent-strong)] font-mono text-[10px]">ACTIVE</span>
          </div>
          <div className="w-full bg-[var(--color-surface-3)] h-1 rounded-full overflow-hidden">
            <div className="h-full bg-[var(--color-accent)] rounded-full w-full" />
          </div>
          <div className="text-[10px] text-[var(--color-text-muted)] flex justify-between">
            <span>Fiduciary Mandate</span>
            <span>Real-time</span>
          </div>
        </div>

        {/* User Profile Pill */}
        <div className="flex items-center justify-between px-2 py-1.5 rounded-xl bg-[var(--color-card)] border border-[var(--color-border)] shadow-2xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-full bg-[var(--color-accent)] text-[var(--color-accent-text)] font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
              {userInitial}
            </div>
            <div className="min-w-0 truncate">
              <div className="text-xs font-bold text-[var(--color-text-primary)] truncate">
                {user?.name || 'Investor'}
              </div>
              <div className="text-[10px] text-[var(--color-text-secondary)] truncate">
                {user?.riskTolerance || 'Moderate'} Investor
              </div>
            </div>
          </div>
        </div>
      </div>

    </aside>
  );
};
