import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  AlertTriangle,
  PanelLeft,
  ChevronRight,
  MoreHorizontal
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
  onTogglePinSession?: (id: string, isPinned: boolean) => void;
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
  onDeleteSession,
  onCloseMobile,
  searchQuery = '',
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

  // Filtered sessions based on search
  const filteredSessions = sessions.filter((s) =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Default demonstration items if no sessions yet to match Stoxo layout
  const defaultHistoryToday = [
    { id: 'demo-1', title: 'Upcoming Stock Boom Candl...' }
  ];
  const defaultHistoryLastWeek = [
    { id: 'demo-2', title: 'Lenskart Stake Sale: Buy Or ...' }
  ];
  const defaultHistoryLastMonth = [
    { id: 'demo-3', title: 'Multibagger Stock Suggestions' }
  ];

  const userName = user?.name || 'Ravitej';
  const userInitial = userName.charAt(0).toUpperCase() || 'R';

  return (
    <aside className="w-[260px] min-w-[260px] h-full bg-white dark:bg-[#0B1120] border-r border-slate-200 dark:border-white/[0.08] flex flex-col justify-between shrink-0 font-sans z-20">
      
      {/* Top Header & Start a New Thread Button */}
      <div className="p-4 space-y-4">
        
        {/* Brand Logo and Collapse Button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-xl font-black text-slate-900 dark:text-white tracking-tight font-sans">
              VESTIQ
            </span>
            <span className="text-[10px] text-[#0D9488] font-bold tracking-tight mt-0.5">
              by SmartVest
            </span>
          </div>

          <button
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.04] transition-colors cursor-pointer"
            title="Toggle Sidebar"
          >
            <PanelLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Start a New Thread Button */}
        <button
          type="button"
          onClick={() => {
            onNewAnalysis();
            onCloseMobile?.();
          }}
          disabled={loading}
          className="w-full py-2 px-3 rounded-lg border border-slate-200 dark:border-white/[0.12] bg-white dark:bg-[#0F172A] text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/[0.04] font-medium text-xs flex items-center gap-2 shadow-2xs transition-all cursor-pointer disabled:opacity-60"
        >
          <Plus className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
          <span>Start a New Thread</span>
        </button>

      </div>

      {/* Main Conversation List Grouped by Timeframe */}
      <div className="flex-1 overflow-y-auto px-4 space-y-4 scrollbar-thin">
        
        {filteredSessions.length > 0 ? (
          <div className="space-y-1">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Recent Threads
            </div>
            {filteredSessions.map((sess) => {
              const isActive = activeSessionId === sess.id;
              const isEditing = editingId === sess.id;
              const isDeleting = deleteConfirmId === sess.id;

              if (isDeleting) {
                return (
                  <div
                    key={sess.id}
                    className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 space-y-2"
                  >
                    <div className="flex items-center gap-1.5 font-bold">
                      <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0" />
                      <span>Delete thread?</span>
                    </div>
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={cancelDelete}
                        className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600 text-[11px]"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={(e) => confirmDelete(sess.id, e)}
                        className="px-2 py-0.5 rounded bg-rose-600 text-white text-[11px] font-bold"
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
                    className="p-1 rounded-lg bg-white border border-slate-300 flex items-center gap-1"
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
                      className="flex-1 h-6 px-1.5 text-xs bg-slate-50 border border-slate-200 rounded text-slate-900 focus:outline-none"
                    />
                    <button
                      onClick={(e) => handleSaveRename(sess.id, e)}
                      className="p-0.5 text-emerald-600 hover:text-emerald-700"
                    >
                      <Check className="w-3 h-3" />
                    </button>
                    <button
                      onClick={handleCancelRename}
                      className="p-0.5 text-slate-400 hover:text-slate-600"
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
                  className={`group relative flex items-center justify-between py-1.5 px-2 rounded-md text-xs transition-colors cursor-pointer ${
                    isActive 
                      ? 'bg-slate-100 dark:bg-white/[0.08] text-slate-900 dark:text-white font-semibold' 
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/[0.04]'
                  }`}
                >
                  <span className="truncate text-xs flex-1 pr-1" title={sess.title}>
                    {sess.title}
                  </span>

                  {/* Actions on hover */}
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => startRename(sess, e)}
                      className="p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                      title="Rename"
                    >
                      <Edit3 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => handleDeletePrompt(sess.id, e)}
                      className="p-0.5 text-slate-400 hover:text-rose-500"
                      title="Delete"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Today */}
            <div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Today
              </div>
              {defaultHistoryToday.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onNewAnalysis()}
                  className="py-1.5 px-2 rounded-md text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.04] hover:text-slate-900 cursor-pointer truncate"
                >
                  {item.title}
                </div>
              ))}
            </div>

            {/* Last Week */}
            <div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Last Week
              </div>
              {defaultHistoryLastWeek.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onNewAnalysis()}
                  className="py-1.5 px-2 rounded-md text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.04] hover:text-slate-900 cursor-pointer truncate"
                >
                  {item.title}
                </div>
              ))}
            </div>

            {/* Last Month */}
            <div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Last Month
              </div>
              {defaultHistoryLastMonth.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onNewAnalysis()}
                  className="py-1.5 px-2 rounded-md text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.04] hover:text-slate-900 cursor-pointer truncate"
                >
                  {item.title}
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Bottom Area: Weekly Limit & User Tile */}
      <div className="p-4 border-t border-slate-100 dark:border-white/[0.06] space-y-3 bg-white dark:bg-[#0B1120]">
        
        {/* Weekly Limit Card */}
        <div className="p-2.5 rounded-lg border border-slate-100 dark:border-white/[0.06] bg-slate-50/50 dark:bg-[#0F172A] space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Weekly Limit</span>
            <span className="font-bold text-emerald-600 text-xs">7%</span>
          </div>

          <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full w-[7%]" />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
            <span>Resets at 4 Sept, 12:00 AM</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </div>
        </div>

        {/* User Account Tile */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-[#1E88E5] text-white font-bold text-xs flex items-center justify-center shrink-0">
              {userInitial}
            </div>
            <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs truncate">
              {userName}
            </span>
          </div>

          <button className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>

      </div>

    </aside>
  );
};
