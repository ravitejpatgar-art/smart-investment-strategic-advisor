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
    <div className={`bg-white rounded-xl border border-[#E2E8F0] p-4 sm:p-5 shadow-xs ${className}`}>
      <div className="flex items-center justify-between gap-4 mb-2.5">
        <div className="flex items-center gap-2">
          {isAllCompleted ? (
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          ) : (
            <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          )}
          <div>
            <h4 className="text-xs font-medium text-[#64748B] uppercase tracking-wider">Your Progress</h4>
            <div className="text-sm sm:text-base font-semibold text-[#0F172A]">
              {completedCount} / {totalCount} lessons completed
            </div>
          </div>
        </div>
        <div className="text-right">
          <span className="text-lg sm:text-xl font-bold text-[#0F172A]">{percentage}%</span>
        </div>
      </div>

      {/* Progress Track */}
      <div
        className="w-full bg-[#F1F5F9] rounded-full h-2.5 overflow-hidden"
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
              : 'bg-gradient-to-r from-sky-500 to-teal-500'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {isAllCompleted && (
        <div className="mt-3 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200/60 rounded-md p-2 text-center font-medium">
          🎉 Congratulations! You have completed the entire Beginner Course!
        </div>
      )}
    </div>
  );
};
