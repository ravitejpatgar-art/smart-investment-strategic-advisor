import React from 'react';
import type { InvestmentLesson } from '../../types/investmentAcademy';
import { Play, CheckCircle2, Clock, BookOpen } from 'lucide-react';

interface LessonCardProps {
  lesson: InvestmentLesson;
  isCompleted: boolean;
  isInProgress?: boolean;
  onSelectLesson: (lesson: InvestmentLesson) => void;
}

export const LessonCard: React.FC<LessonCardProps> = ({
  lesson,
  isCompleted,
  isInProgress = false,
  onSelectLesson,
}) => {
  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const formattedNumber = lesson.number < 10 ? `0${lesson.number}` : `${lesson.number}`;

  return (
    <div
      onClick={() => onSelectLesson(lesson)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelectLesson(lesson);
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={`Lesson ${lesson.number}: ${lesson.title}. Status: ${isCompleted ? 'Completed' : isInProgress ? 'In Progress' : 'Not Started'}`}
      className={`group relative bg-white rounded-xl border transition-all duration-200 text-left cursor-pointer overflow-hidden flex flex-col justify-between p-4 sm:p-5 hover:shadow-md hover:border-[#CBD5E1] focus:outline-none focus:ring-2 focus:ring-[#0EA5E9] ${
        isCompleted
          ? 'border-emerald-200 bg-gradient-to-b from-white to-emerald-50/20'
          : isInProgress
          ? 'border-sky-300 ring-1 ring-sky-200 shadow-xs'
          : 'border-[#E2E8F0]'
      }`}
    >
      <div>
        {/* Top bar: Number & Status Badge */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-[#64748B] bg-[#F1F5F9] px-2 py-0.5 rounded-md">
              {formattedNumber}
            </span>
            <span className="text-[11px] font-medium text-[#475569] bg-slate-100 px-2 py-0.5 rounded-md">
              {lesson.category}
            </span>
          </div>

          {/* Completion status */}
          {isCompleted ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              Completed
            </span>
          ) : isInProgress ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-700 bg-sky-100/80 px-2 py-0.5 rounded-full">
              In Progress
            </span>
          ) : (
            <span className="text-[11px] font-medium text-slate-400">
              Not Started
            </span>
          )}
        </div>

        {/* Thumbnail / Header graphic */}
        <div className="relative w-full h-24 sm:h-28 rounded-lg bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900 flex items-center justify-center overflow-hidden mb-3.5 group-hover:scale-[1.01] transition-transform">
          {/* Subtle background decoration */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:12px_12px]" />

          {/* Central Play Badge */}
          <div className="relative w-10 h-10 rounded-full bg-white/95 text-slate-900 flex items-center justify-center shadow-lg group-hover:bg-[#0EA5E9] group-hover:text-white transition-all transform group-hover:scale-110">
            <Play className="w-4 h-4 ml-0.5 fill-current" />
          </div>

          <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-xs text-[10px] font-mono text-white flex items-center gap-1">
            <Clock className="w-2.5 h-2.5" />
            {formatDuration(lesson.durationSeconds)}
          </div>
        </div>

        {/* Title & 1-line Description */}
        <h3 className="text-sm sm:text-base font-bold text-[#0F172A] group-hover:text-[#0EA5E9] transition-colors line-clamp-1 mb-1.5">
          {lesson.title}
        </h3>
        <p className="text-xs text-[#64748B] line-clamp-2 leading-relaxed mb-4">
          {lesson.description}
        </p>
      </div>

      {/* Footer Meta */}
      <div className="pt-3 border-t border-[#F1F5F9] flex items-center justify-between text-xs text-[#64748B]">
        <span className="flex items-center gap-1 font-medium">
          <BookOpen className="w-3.5 h-3.5 text-slate-400" />
          {lesson.level}
        </span>
        <span className="text-[#0EA5E9] font-semibold group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1">
          {isCompleted ? 'Replay' : isInProgress ? 'Continue' : 'Start'} →
        </span>
      </div>
    </div>
  );
};
