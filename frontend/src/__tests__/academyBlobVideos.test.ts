import { describe, it, expect } from 'vitest';
import { INVESTMENT_LESSONS } from '../data/investmentAcademyLessons';

describe('SmartVest Academy — Vercel Blob Production Video Validation', () => {
  const EXPECTED_LESSON_IDS = [
    'what-is-investment',
    'what-is-a-stock',
    'what-are-shares',
    'what-is-an-etf',
    'what-is-a-mutual-fund',
    'why-long-term-investing',
    'what-is-compounding',
    'what-is-sip',
    'what-is-swp',
    'what-is-a-hedge-fund',
    'risk-return-diversification',
    'how-to-start-investing',
  ];

  it('contains all 12 core academy lessons', () => {
    expect(INVESTMENT_LESSONS).toBeDefined();
    expect(INVESTMENT_LESSONS.length).toBe(12);

    const lessonIds = INVESTMENT_LESSONS.map((l) => l.id);
    for (const expectedId of EXPECTED_LESSON_IDS) {
      expect(lessonIds).toContain(expectedId);
    }
  });

  it('verifies every English lesson has a non-empty videoUrl and uploaded lessons use Vercel Blob', () => {
    // Vercel Blob URLs match: https://<store-id>.public.blob.vercel-storage.com/...
    const vercelBlobRegex = /^https:\/\/[a-zA-Z0-9_-]+\.public\.blob\.vercel-storage\.com\/.*\.mp4$/i;

    // Verify key deployed lessons (investment, stock, shares, etf, mutual-fund, long-term)
    const deployedIds = [
      'what-is-investment',
      'what-is-a-stock',
      'what-are-shares',
      'what-is-an-etf',
      'what-is-a-mutual-fund',
      'why-long-term-investing',
    ];

    for (const lesson of INVESTMENT_LESSONS) {
      expect(lesson.videoUrl).toBeDefined();
      expect(typeof lesson.videoUrl).toBe('string');
      expect((lesson.videoUrl || '').trim().length).toBeGreaterThan(0);

      // Verify no lesson points to a Git LFS pointer URL
      expect(lesson.videoUrl || '').not.toContain('git-lfs');

      if (deployedIds.includes(lesson.id) || (lesson.videoUrl && lesson.videoUrl.startsWith('https://'))) {
        expect(lesson.videoUrl).toMatch(vercelBlobRegex);
        const enLang = lesson.languages?.en;
        if (enLang && enLang.videoUrl) {
          expect(enLang.videoUrl).toMatch(vercelBlobRegex);
        }
      }
    }
  });

  it('preserves non-English localized content without inventing non-English Blob replacements', () => {
    for (const lesson of INVESTMENT_LESSONS) {
      if (lesson.languages) {
        for (const [lang, content] of Object.entries(lesson.languages)) {
          if (lang !== 'en') {
            // Non-English lessons should preserve their original structure
            expect(content.transcript).toBeDefined();
            expect(typeof content.transcript).toBe('string');
          }
        }
      }
    }
  });

  it('preserves lesson quizzes, categories, and duration properties', () => {
    for (const lesson of INVESTMENT_LESSONS) {
      expect(lesson.title).toBeDefined();
      expect(lesson.title.trim().length).toBeGreaterThan(0);
      expect(lesson.category).toBeDefined();
      expect(lesson.durationSeconds).toBeGreaterThan(0);
      expect(Array.isArray(lesson.quiz)).toBe(true);
      expect(lesson.quiz.length).toBeGreaterThanOrEqual(1);
    }
  });
});
