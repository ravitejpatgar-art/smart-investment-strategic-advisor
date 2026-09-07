import { describe, it, expect, beforeEach } from 'vitest';
import {
  INVESTMENT_LESSONS,
  ACADEMY_CATEGORIES,
  getLessonById,
  getLessonByNumber,
  getNextLesson,
  getPreviousLesson,
  getRelatedLessons,
} from '../data/investmentAcademyLessons';
import { academyProgress } from '../services/academyProgress';

describe('SmartVest Academy — Investing for Beginners', () => {
  beforeEach(() => {
    // Reset local progress before each test
    academyProgress.resetProgress();
  });

  // 1. All 12 lessons exist
  it('1. contains exactly 12 structured beginner lessons', () => {
    expect(INVESTMENT_LESSONS).toHaveLength(12);
  });

  // 2. Lessons appear in the exact required sequence (1 to 12)
  it('2. orders lessons sequentially from 1 to 12 with exact required titles', () => {
    const expectedTitles = [
      'What is Investment?',
      'What is a Stock?',
      'What are Shares?',
      'What is an ETF?',
      'What is a Mutual Fund?',
      'Why Long-Term Investing?',
      'What is Compounding?',
      'What is SIP?',
      'What is SWP?',
      'What is a Hedge Fund?',
      'Risk, Return & Diversification',
      'How to Start Investing',
    ];

    INVESTMENT_LESSONS.forEach((lesson, index) => {
      expect(lesson.number).toBe(index + 1);
      expect(lesson.title).toBe(expectedTitles[index]);
    });
  });

  // 3. Category assignment integrity
  it('3. assigns each lesson to the correct educational category', () => {
    const expectedCategories: Record<string, string> = {
      'what-is-investment': 'Fundamentals',
      'what-is-a-stock': 'Fundamentals',
      'what-are-shares': 'Fundamentals',
      'what-is-an-etf': 'Investment Products',
      'what-is-a-mutual-fund': 'Investment Products',
      'why-long-term-investing': 'Investing Strategy',
      'what-is-compounding': 'Investing Strategy',
      'what-is-sip': 'India Investing',
      'what-is-swp': 'India Investing',
      'what-is-a-hedge-fund': 'Investment Products',
      'risk-return-diversification': 'Core Principles',
      'how-to-start-investing': 'Core Principles',
    };

    INVESTMENT_LESSONS.forEach((lesson) => {
      expect(lesson.category).toBe(expectedCategories[lesson.id]);
    });

    expect(ACADEMY_CATEGORIES).toHaveLength(5);
  });

  // 4. Durations are valid (60–120 seconds for bite-sized learning)
  it('4. ensures lesson duration is between 60 and 120 seconds', () => {
    INVESTMENT_LESSONS.forEach((lesson) => {
      expect(lesson.durationSeconds).toBeGreaterThanOrEqual(60);
      expect(lesson.durationSeconds).toBeLessThanOrEqual(120);
    });
  });

  // 5. Each lesson includes comprehensive transcripts and takeaways
  it('5. includes full transcripts, key takeaways, and learning points for every lesson', () => {
    INVESTMENT_LESSONS.forEach((lesson) => {
      expect(lesson.transcript.length).toBeGreaterThan(100);
      expect(lesson.keyTakeaway.length).toBeGreaterThan(10);
      expect(lesson.learningPoints.length).toBeGreaterThanOrEqual(3);
      expect(lesson.level).toBe('Beginner');
    });
  });

  // 6. Video placeholder support when videoUrl is missing
  it('6. safely handles lessons awaiting AI video rendering without crashing', () => {
    const lesson = getLessonById('what-is-investment');
    expect(lesson).toBeDefined();
    expect(lesson?.videoUrl).toBeUndefined(); // clean placeholder state
    expect(lesson?.aiVideoPrompt).toBeDefined();
    expect(lesson?.aiVideoPrompt?.length).toBeGreaterThan(20);
  });

  // 7. Quiz questions integrity (2–3 multiple-choice questions per lesson)
  it('7. provides 2–3 multiple choice quiz questions per lesson with explanations', () => {
    INVESTMENT_LESSONS.forEach((lesson) => {
      expect(lesson.quiz.length).toBeGreaterThanOrEqual(2);
      expect(lesson.quiz.length).toBeLessThanOrEqual(3);

      lesson.quiz.forEach((q) => {
        expect(q.id).toBeDefined();
        expect(q.question.length).toBeGreaterThan(5);
        expect(q.options.length).toBeGreaterThanOrEqual(3);
        expect(q.correctAnswer).toBeGreaterThanOrEqual(0);
        expect(q.correctAnswer).toBeLessThan(q.options.length);
        expect(q.explanation.length).toBeGreaterThan(10);
      });
    });
  });

  // 8. Progress service: initial zero state
  it('8. initializes with 0 completed lessons and 0% progress', () => {
    expect(academyProgress.getCompletedCount()).toBe(0);
    expect(academyProgress.getTotalCount()).toBe(12);
    expect(academyProgress.getProgressPercentage()).toBe(0);
    expect(academyProgress.getNextUnfinishedLessonId()).toBe('what-is-investment');
  });

  // 9. Progress service: completion toggle and persistence
  it('9. marks lessons complete and computes dynamic percentage accurately', () => {
    academyProgress.markLessonComplete('what-is-investment');
    academyProgress.markLessonComplete('what-is-a-stock');
    academyProgress.markLessonComplete('what-are-shares');

    expect(academyProgress.getCompletedCount()).toBe(3);
    expect(academyProgress.isLessonCompleted('what-is-investment')).toBe(true);
    expect(academyProgress.isLessonCompleted('what-is-a-stock')).toBe(true);
    expect(academyProgress.isLessonCompleted('what-is-an-etf')).toBe(false);
    expect(academyProgress.getProgressPercentage()).toBe(25); // 3 / 12 = 25%
    expect(academyProgress.getNextUnfinishedLessonId()).toBe('what-is-an-etf');

    // Unmarking
    academyProgress.unmarkLessonComplete('what-are-shares');
    expect(academyProgress.getCompletedCount()).toBe(2);
    expect(academyProgress.getProgressPercentage()).toBe(17); // 2 / 12 = 17%
  });

  // 10. Quiz scoring persistence
  it('10. records and retrieves quiz scores accurately', () => {
    academyProgress.saveQuizScore('what-is-investment', 2);
    expect(academyProgress.getQuizScore('what-is-investment')).toBe(2);
    expect(academyProgress.getQuizScore('what-is-a-stock')).toBeUndefined();
  });

  // 11. Next and Previous lesson navigation
  it('11. provides reliable next and previous lesson lookups', () => {
    const first = INVESTMENT_LESSONS[0];
    const second = getNextLesson(first.id);
    expect(second?.id).toBe('what-is-a-stock');

    const prevOfSecond = getPreviousLesson(second!.id);
    expect(prevOfSecond?.id).toBe('what-is-investment');

    const last = INVESTMENT_LESSONS[11];
    const afterLast = getNextLesson(last.id);
    expect(afterLast).toBeUndefined();
  });

  // 12. Related lesson resolution
  it('12. resolves related lessons cleanly by ID', () => {
    const stockLesson = getLessonById('what-is-a-stock');
    expect(stockLesson).toBeDefined();

    const related = getRelatedLessons(stockLesson!);
    expect(related.length).toBeGreaterThan(0);
    expect(related.map((r) => r.id)).toContain('what-are-shares');
  });

  // 13. VestIQ educational prompt integration
  it('13. provides tailored, non-grounding-breaking VestIQ educational prompts', () => {
    INVESTMENT_LESSONS.forEach((lesson) => {
      expect(lesson.vestiqPrompt).toBeDefined();
      expect(lesson.vestiqPrompt.length).toBeGreaterThan(10);
    });

    const sipLesson = getLessonById('what-is-sip');
    expect(sipLesson?.vestiqPrompt).toContain('SIP');
  });

  // 14. Course full completion state
  it('14. correctly identifies 100% course completion when all 12 lessons are done', () => {
    INVESTMENT_LESSONS.forEach((lesson) => {
      academyProgress.markLessonComplete(lesson.id);
    });

    expect(academyProgress.getCompletedCount()).toBe(12);
    expect(academyProgress.getProgressPercentage()).toBe(100);
    expect(academyProgress.getNextUnfinishedLessonId()).toBeNull();
  });

  // 15. Helper getLessonByNumber
  it('15. looks up lessons accurately by ordinal number', () => {
    const lesson7 = getLessonByNumber(7);
    expect(lesson7?.title).toBe('What is Compounding?');
  });

  // 16. Educational disclaimer text validation
  it('16. ensures educational disclaimers and safety boundaries are maintained', () => {
    INVESTMENT_LESSONS.forEach((lesson) => {
      // Transcript must not contain fabricated guarantees
      expect(lesson.transcript).not.toContain('guaranteed profit');
      expect(lesson.transcript).not.toContain('buy signal');
      expect(lesson.transcript).not.toContain('sell signal');
    });
  });
});
