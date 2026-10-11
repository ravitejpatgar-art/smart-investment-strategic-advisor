import React, { useState, useEffect } from 'react';
import type { QuizQuestion } from '../../types/investmentAcademy';
import { academyProgress } from '../../services/academyProgress';
import { CheckCircle2, XCircle, HelpCircle, RotateCcw } from 'lucide-react';

interface LessonQuizProps {
  lessonId: string;
  quiz: QuizQuestion[];
  onQuizComplete?: (score: number, total: number) => void;
}

export const LessonQuiz: React.FC<LessonQuizProps> = ({
  lessonId,
  quiz,
  onQuizComplete,
}) => {
  // Store selected option index per question: { [questionId]: optionIndex }
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState<boolean>(false);

  // Restore existing score if previously taken
  useEffect(() => {
    const existingScore = academyProgress.getQuizScore(lessonId);
    if (existingScore !== undefined) {
      // Keep quiz ready
    }
  }, [lessonId]);

  const handleSelectOption = (questionId: string, optionIdx: number) => {
    if (submitted) return; // locked once checked, or allow re-answering
    const updated = { ...answers, [questionId]: optionIdx };
    setAnswers(updated);
  };

  const answeredCount = Object.keys(answers).length;
  const isAllAnswered = answeredCount === quiz.length;

  const handleCheckAnswers = () => {
    setSubmitted(true);
    let correctCount = 0;
    quiz.forEach((q) => {
      if (answers[q.id] === q.correctAnswer) {
        correctCount += 1;
      }
    });
    academyProgress.saveQuizScore(lessonId, correctCount);
    if (onQuizComplete) {
      onQuizComplete(correctCount, quiz.length);
    }
  };

  const handleRetry = () => {
    setAnswers({});
    setSubmitted(false);
  };

  const correctCount = quiz.filter((q) => answers[q.id] === q.correctAnswer).length;

  return (
    <div className="financial-section-card p-5 sm:p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-[var(--color-border-subtle)]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[var(--color-accent)]/10 text-[var(--color-accent)] flex items-center justify-center shrink-0">
            <HelpCircle className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[var(--color-text-primary)]">Knowledge Verification</h3>
            <p className="text-xs text-[var(--color-text-muted)]">Test your understanding with {quiz.length} focused concept questions.</p>
          </div>
        </div>

        {submitted && (
          <div className="flex items-center gap-3">
            <div className="px-3 py-1 rounded-full bg-[var(--color-surface-soft)] text-xs font-semibold text-[var(--color-text-primary)] border border-[var(--color-border)]">
              Score: <span className="text-[var(--color-accent)] font-bold">{correctCount}</span> / {quiz.length}
            </div>
            <button
              type="button"
              onClick={handleRetry}
              className="inline-flex items-center gap-1 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] font-medium p-1 hover:bg-[var(--color-surface-soft)] rounded transition-colors cursor-pointer"
              title="Retry Quiz"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          </div>
        )}
      </div>

      {/* Questions List */}
      <div className="space-y-6">
        {quiz.map((q, qIndex) => {
          const selectedOption = answers[q.id];
          const isAnswered = selectedOption !== undefined;
          const isCorrect = isAnswered && selectedOption === q.correctAnswer;

          return (
            <div key={q.id} className="space-y-3">
              <div className="flex items-start gap-2">
                <span className="text-xs font-mono font-bold text-[var(--color-accent)] mt-0.5">Q{qIndex + 1}.</span>
                <p className="text-sm font-semibold text-[var(--color-text-primary)] leading-snug">{q.question}</p>
              </div>

              {/* Options */}
              <div className="grid grid-cols-1 gap-2.5 pl-4">
                {q.options.map((option, optIdx) => {
                  const isSelected = selectedOption === optIdx;
                  let optionStyle = 'border-[var(--color-border)] bg-[var(--color-surface-soft)]/40 hover:bg-[var(--color-surface-soft)] text-[var(--color-text-secondary)]';

                  if (submitted) {
                    if (optIdx === q.correctAnswer) {
                      optionStyle = 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-medium';
                    } else if (isSelected && !isCorrect) {
                      optionStyle = 'border-rose-400 bg-rose-500/10 text-rose-700 dark:text-rose-300 line-through';
                    } else {
                      optionStyle = 'border-[var(--color-border-subtle)] bg-[var(--color-surface-soft)]/20 text-[var(--color-text-muted)] opacity-70';
                    }
                  } else if (isSelected) {
                    optionStyle = 'border-[var(--color-accent)] bg-[var(--color-accent)]/10 text-[var(--color-text-primary)] font-medium ring-1 ring-[var(--color-accent)]';
                  }

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      disabled={submitted}
                      onClick={() => handleSelectOption(q.id, optIdx)}
                      className={`w-full text-left p-3 rounded-lg border text-xs sm:text-sm transition-all flex items-start gap-2.5 cursor-pointer ${optionStyle}`}
                      aria-pressed={isSelected}
                    >
                      <span className="w-5 h-5 rounded-full border border-current shrink-0 flex items-center justify-center text-[10px] font-mono font-bold">
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <span className="leading-snug">{option}</span>
                    </button>
                  );
                })}
              </div>

              {/* Instant Explanation Callout after Submit */}
              {submitted && (
                <div
                  className={`ml-4 p-3.5 rounded-lg border text-xs leading-relaxed ${
                    isCorrect
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-800 dark:text-emerald-200'
                      : 'bg-amber-500/10 border-amber-500/20 text-amber-800 dark:text-amber-200'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold mb-1">
                    {isCorrect ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>✓ Correct Answer</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                        <span>Incorrect Concept Check</span>
                      </>
                    )}
                  </div>
                  <p>{q.explanation}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Action Footer */}
      {!submitted && (
        <div className="mt-6 pt-4 border-t border-[var(--color-border-subtle)] flex items-center justify-between">
          <span className="text-xs text-[var(--color-text-muted)] font-mono">
            {answeredCount} of {quiz.length} answered
          </span>
          <button
            type="button"
            disabled={!isAllAnswered}
            onClick={handleCheckAnswers}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              isAllAnswered
                ? 'bg-[var(--color-accent)] hover:brightness-105 text-[var(--color-accent-text)] shadow-xs cursor-pointer'
                : 'bg-[var(--color-surface-soft)] text-[var(--color-text-muted)] cursor-not-allowed border border-[var(--color-border)]'
            }`}
          >
            Check Answers
          </button>
        </div>
      )}
    </div>
  );
};
