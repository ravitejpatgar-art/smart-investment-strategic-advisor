import React from 'react';
import type { InvestmentLesson } from '../../types/investmentAcademy';
import { Play, CheckCircle2, Clock } from 'lucide-react';

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
      className="group py-4 px-3 sm:px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--color-border-subtle)] hover:bg-[var(--color-surface-soft)]/60 transition-colors text-left cursor-pointer focus:outline-none"
    >
      {/* Left: Number, Title, Description */}
      <div className="flex items-start gap-3.5 min-w-0 flex-1">
        <span className="text-sm font-mono font-bold text-[var(--color-accent)] pt-0.5 shrink-0">
          {formattedNumber}
        </span>
        <div className="min-w-0 space-y-0.5">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm sm:text-base font-bold text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] transition-colors truncate">
              {lesson.title}
            </h3>
            <span className="text-[11px] font-mono text-[var(--color-text-muted)] uppercase">
              • {lesson.category}
            </span>
          </div>
          <p className="text-xs text-[var(--color-text-secondary)] line-clamp-1 leading-relaxed">
            {lesson.description}
          </p>
        </div>
      </div>

      {/* Right: Meta (Duration, Level) & Status Action */}
      <div className="flex items-center justify-between sm:justify-end gap-5 shrink-0 text-xs">
        <div className="flex items-center gap-3 text-[var(--color-text-muted)] font-mono text-xs">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
            {formatDuration(lesson.durationSeconds)}
          </span>
          <span>•</span>
          <span>{lesson.level}</span>
        </div>

        {/* Status Indicator */}
        <div className="flex items-center gap-2">
          {isCompleted ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Done</span>
            </span>
          ) : isInProgress ? (
            <span className="text-[11px] font-bold text-[var(--color-accent)]">
              In Progress
            </span>
          ) : null}

          <span className="text-xs font-bold text-[var(--color-accent)] group-hover:translate-x-0.5 transition-transform flex items-center gap-1 pl-2">
            <span>{isCompleted ? 'Replay' : isInProgress ? 'Resume' : 'Start'}</span>
            <Play className="w-3 h-3 fill-current" />
          </span>
        </div>
      </div>
    </div>
  );
};
