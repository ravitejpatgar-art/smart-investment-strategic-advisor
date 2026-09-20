import React from 'react';
import { Award, CheckCircle2 } from 'lucide-react';

interface LessonProgressProps {
  completedCount: number;
  totalCount: number;
  className?: string;
}

export const LessonProgress: React.FC<LessonProgressProps> = ({
  completedCount,
  totalCount,
  className = '',
}) => {
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const isAllCompleted = completedCount === totalCount && totalCount > 0;

  return (
    <div className={`space-y-2 py-1 ${className}`}>
      <div className="flex items-center justify-between gap-4 mb-2">
        <div className="flex items-center gap-2">
          {isAllCompleted ? (
            <div className="w-7 h-7 rounded bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          ) : (
            <div className="w-7 h-7 rounded bg-[var(--color-accent)]/10 text-[var(--color-accent)] flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          )}
          <div>
            <h4 className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">Your Progress</h4>
            <div className="text-sm sm:text-base font-semibold text-[var(--color-text-primary)]">
              {completedCount} / {totalCount} lessons completed
            </div>
          </div>
        </div>
        <div className="text-right">
          <span className="text-lg sm:text-xl font-bold font-mono text-[var(--color-text-primary)]">{percentage}%</span>
        </div>
      </div>

      {/* Progress Track */}
      <div
        className="w-full bg-[var(--color-surface-soft)] rounded-full h-2 overflow-hidden"
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Course completion progress"
      >
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${
            isAllCompleted
              ? 'bg-emerald-500'
              : 'bg-[var(--color-accent)]'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {isAllCompleted && (
        <div className="mt-3 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded p-2 text-center font-medium">
          🎉 Congratulations! You have completed the entire Beginner Course!
        </div>
      )}
    </div>
  );
};
