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
    <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs p-5 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-5 pb-4 border-b border-[#F1F5F9]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
            <HelpCircle className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#0F172A]">Quick Check</h3>
            <p className="text-xs text-[#64748B]">Test your understanding with {quiz.length} simple questions.</p>
          </div>
        </div>

        {submitted && (
          <div className="flex items-center gap-3">
            <div className="px-3 py-1 rounded-full bg-slate-100 text-xs font-semibold text-[#0F172A]">
              Quiz Score: <span className="text-teal-600 font-bold">{correctCount}</span> / {quiz.length}
            </div>
            <button
              type="button"
              onClick={handleRetry}
              className="inline-flex items-center gap-1 text-xs text-[#64748B] hover:text-[#0F172A] font-medium p-1 hover:bg-slate-100 rounded transition-colors"
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
                <span className="text-xs font-bold text-slate-400 mt-0.5">Q{qIndex + 1}.</span>
                <p className="text-sm font-semibold text-[#1E293B] leading-snug">{q.question}</p>
              </div>

              {/* Options */}
              <div className="grid grid-cols-1 gap-2 pl-4">
                {q.options.map((option, optIdx) => {
                  const isSelected = selectedOption === optIdx;
                  let optionStyle = 'border-[#E2E8F0] bg-white hover:bg-[#F8FAFC] text-[#334155]';

                  if (submitted) {
                    if (optIdx === q.correctAnswer) {
                      optionStyle = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-medium';
                    } else if (isSelected && !isCorrect) {
                      optionStyle = 'border-rose-400 bg-rose-50 text-rose-900 line-through';
                    } else {
                      optionStyle = 'border-[#E2E8F0] bg-slate-50/60 text-slate-400 opacity-80';
                    }
                  } else if (isSelected) {
                    optionStyle = 'border-teal-500 bg-teal-50/50 text-[#0F172A] font-medium ring-1 ring-teal-500';
                  }

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      disabled={submitted}
                      onClick={() => handleSelectOption(q.id, optIdx)}
                      className={`w-full text-left p-3 rounded-lg border text-xs sm:text-sm transition-all flex items-start gap-2.5 ${optionStyle}`}
                      aria-pressed={isSelected}
                    >
                      <span className="w-5 h-5 rounded-full border border-current shrink-0 flex items-center justify-center text-[10px] font-semibold">
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
                  className={`ml-4 p-3 rounded-lg border text-xs leading-relaxed ${
                    isCorrect
                      ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                      : 'bg-amber-50/80 border-amber-200 text-amber-900'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold mb-1">
                    {isCorrect ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>✓ Correct</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3.5 h-3.5 text-amber-600" />
                        <span>Not quite.</span>
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
        <div className="mt-6 pt-4 border-t border-[#F1F5F9] flex items-center justify-between">
          <span className="text-xs text-[#64748B]">
            {answeredCount} of {quiz.length} answered
          </span>
          <button
            type="button"
            disabled={!isAllAnswered}
            onClick={handleCheckAnswers}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              isAllAnswered
                ? 'bg-[#0EA5E9] hover:bg-[#0284C7] text-white shadow-xs cursor-pointer'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            Check Answers
          </button>
        </div>
      )}
    </div>
  );
};
