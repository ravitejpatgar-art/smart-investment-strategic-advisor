import { describe, it, expect } from 'vitest';
import { INVESTMENT_LESSONS } from '../data/investmentAcademyLessons';
import type { SupportedAcademyLanguage } from '../types/investmentAcademy';

describe('SmartVest Academy — Full Catalog Video & Playback Integrity', () => {
  const ALL_LANGUAGES: SupportedAcademyLanguage[] = ['en', 'hi', 'kn', 'te', 'ta', 'ml', 'mr', 'bn'];
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

  const EXPECTED_BASES: Record<string, string> = {
    'what-is-investment': 'investment',
    'what-is-a-stock': 'stock',
    'what-are-shares': 'shares',
    'what-is-an-etf': 'etf',
    'what-is-a-mutual-fund': 'mutual-fund',
    'why-long-term-investing': 'long-term',
    'what-is-compounding': 'compounding',
    'what-is-sip': 'sip',
    'what-is-swp': 'swp',
    'what-is-a-hedge-fund': 'hedge-fund',
    'risk-return-diversification': 'diversification',
    'how-to-start-investing': 'getting-started',
  };

  it('1. contains all 12 lessons with unique IDs and titles', () => {
    expect(INVESTMENT_LESSONS).toHaveLength(12);
    const ids = INVESTMENT_LESSONS.map((l) => l.id);
    expect(new Set(ids).size).toBe(12);

    for (const id of EXPECTED_LESSON_IDS) {
      expect(ids).toContain(id);
    }
  });

  it('2. guarantees every lesson has a distinct, dedicated video source and no shared video URLs', () => {
    const enUrls = INVESTMENT_LESSONS.map((l) => l.videoUrl);
    expect(new Set(enUrls).size).toBe(12);

    for (const lesson of INVESTMENT_LESSONS) {
      const base = EXPECTED_BASES[lesson.id];
      expect(lesson.videoUrl).toBe(`/academy/en/${base}-optimized.mp4`);
    }
  });

  it('3. verifies every lesson has mapped assets for all 8 supported languages', () => {
    for (const lesson of INVESTMENT_LESSONS) {
      const base = EXPECTED_BASES[lesson.id];
      expect(lesson.languages).toBeDefined();

      for (const lang of ALL_LANGUAGES) {
        const langContent = lesson.languages?.[lang];
        expect(langContent).toBeDefined();
        expect(langContent?.videoUrl).toBe(`/academy/${lang}/${base}-optimized.mp4`);
        expect(langContent?.transcript).toBeDefined();
        expect((langContent?.transcript || '').length).toBeGreaterThan(50);
        if (langContent?.keyTakeaway) {
          expect(langContent.keyTakeaway.length).toBeGreaterThan(5);
        }
      }
    }
  });

  it('4. verifies language switching resolves to the correct localized video asset for every lesson', () => {
    for (const lesson of INVESTMENT_LESSONS) {
      const base = EXPECTED_BASES[lesson.id];
      for (const lang of ALL_LANGUAGES) {
        const langUrl = lesson.languages?.[lang]?.videoUrl;
        expect(langUrl).toBe(`/academy/${lang}/${base}-optimized.mp4`);
      }
    }
  });

  it('5. verifies HLS playlists are mapped per-lesson and fallback MP4 matches the exact same lesson', () => {
    for (const lesson of INVESTMENT_LESSONS) {
      const base = EXPECTED_BASES[lesson.id];
      expect(lesson.hlsPlaylistUrl).toBeDefined();
      expect(lesson.hlsPlaylistUrl).toContain('.m3u8');
      expect(lesson.videoUrl).toContain(`${base}-optimized.mp4`);
    }
  });

  it('6. ensures captions and thumbnails exist for all lessons', () => {
    for (const lesson of INVESTMENT_LESSONS) {
      const base = EXPECTED_BASES[lesson.id];
      expect(lesson.thumbnailUrl).toBeDefined();
      expect(lesson.thumbnailUrl).toMatch(new RegExp(`^/academy/(?:en/)?${base}\\.webp$`));

      const enLang = lesson.languages?.en;
      expect(enLang?.captionUrl).toBe(`/academy/en/${base}.vtt`);
      expect(enLang?.thumbnailUrl).toBe(`/academy/en/${base}.webp`);
    }
  });

  it('7. ensures all 12 lessons have complete pedagogical content and quizzes', () => {
    for (const lesson of INVESTMENT_LESSONS) {
      expect(lesson.title).toBeDefined();
      expect(lesson.title.trim().length).toBeGreaterThan(0);
      expect(lesson.category).toBeDefined();
      expect(lesson.durationSeconds).toBeGreaterThanOrEqual(120);
      expect(lesson.quiz).toBeDefined();
      expect(lesson.quiz.length).toBeGreaterThanOrEqual(2);
      expect(lesson.learningPoints.length).toBeGreaterThanOrEqual(3);
    }
  });
});
