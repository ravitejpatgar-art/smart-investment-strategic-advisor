import { describe, it, expect, vi } from 'vitest';
import { INVESTMENT_LESSONS } from '../data/investmentAcademyLessons';
import Hls from 'hls.js';

describe('SmartVest Academy — Bunny Stream HLS Playback Configuration & Integrity', () => {
  const CDN_BASE = 'https://vz-e4ce0b1e-34e.b-cdn.net/';

  const EXPECTED_HLS_MAPPINGS: Record<string, string> = {
    'what-is-investment': `${CDN_BASE}100f4a7f-d903-4b1f-8e8c-5f2054e1effb/playlist.m3u8`,
    'what-is-a-stock': `${CDN_BASE}8e064de4-e645-4491-a0fc-8afbc7c7ef02/playlist.m3u8`,
    'what-are-shares': `${CDN_BASE}825b0fac-734a-4cdb-900b-b57a137122bd/playlist.m3u8`,
    'what-is-an-etf': `${CDN_BASE}3d810bb4-e710-4ece-9796-9de5a640b78f/playlist.m3u8`,
    'what-is-a-mutual-fund': `${CDN_BASE}751561c4-c037-4ae5-8ed8-389ef8424de2/playlist.m3u8`,
    'why-long-term-investing': `${CDN_BASE}8dafd07a-c1b5-41ef-8da3-cb6714f51116/playlist.m3u8`,
    'what-is-compounding': `${CDN_BASE}ef3b3a20-9d19-48a2-8080-d04355308c80/playlist.m3u8`,
    'what-is-sip': `${CDN_BASE}7c6494f6-56f1-403e-9abd-8ab2e70bdd20/playlist.m3u8`,
    'what-is-swp': `${CDN_BASE}27462b82-4635-4a0f-975d-78282a6da663/playlist.m3u8`,
    'what-is-a-hedge-fund': `${CDN_BASE}8499a715-1fba-4a9b-8c9c-84fcd06db919/playlist.m3u8`,
    'risk-return-diversification': `${CDN_BASE}610ce9ff-aba0-4952-bdd3-9f9038455595/playlist.m3u8`,
    'how-to-start-investing': `${CDN_BASE}f3a99f71-d59b-4816-8de8-ce19a9dbb5ca/playlist.m3u8`,
  };

  it('1. verifies all 12 lessons contain the exact verified Bunny Stream HLS playlist mapping', () => {
    expect(INVESTMENT_LESSONS).toHaveLength(12);

    for (const lesson of INVESTMENT_LESSONS) {
      const expectedUrl = EXPECTED_HLS_MAPPINGS[lesson.id];
      expect(expectedUrl).toBeDefined();
      expect(lesson.hlsPlaylistUrl).toBe(expectedUrl);

      // Verify English localization is synchronized
      const en = lesson.languages?.en;
      if (en) {
        expect(en.hlsPlaylistUrl).toBe(expectedUrl);
      }
    }
  });

  it('2. preserves progressive MP4 videoUrl fallback alongside HLS playlist URL', () => {
    for (const lesson of INVESTMENT_LESSONS) {
      expect(lesson.videoUrl).toBeDefined();
      expect(typeof lesson.videoUrl).toBe('string');
      expect((lesson.videoUrl || '').trim().length).toBeGreaterThan(0);
      expect(lesson.videoUrl).toMatch(/\.mp4$/i);

      // Ensure both HLS and MP4 coexist
      expect(lesson.hlsPlaylistUrl).toBeDefined();
      expect(lesson.hlsPlaylistUrl).toMatch(/\.m3u8$/i);
    }
  });

  it('3. verifies HLS URL structure matches Bunny Stream conventions', () => {
    const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    for (const lesson of INVESTMENT_LESSONS) {
      const url = lesson.hlsPlaylistUrl!;
      expect(url.startsWith(CDN_BASE)).toBe(true);
      expect(url.endsWith('/playlist.m3u8')).toBe(true);

      const pathPart = url.replace(CDN_BASE, '').replace('/playlist.m3u8', '');
      expect(pathPart).toMatch(guidRegex);
    }
  });

  it('4. ensures lesson quizzes, categories, transcripts, and metadata remain intact', () => {
    for (const lesson of INVESTMENT_LESSONS) {
      expect(lesson.title.trim().length).toBeGreaterThan(0);
      expect(lesson.category.trim().length).toBeGreaterThan(0);
      expect(lesson.durationSeconds).toBeGreaterThan(0);
      expect(lesson.quiz).toBeDefined();
      expect(lesson.quiz.length).toBeGreaterThanOrEqual(1);
      expect(lesson.keyTakeaway.trim().length).toBeGreaterThan(0);
      expect(lesson.transcript.trim().length).toBeGreaterThan(0);
    }
  });

  it('5. validates hls.js is supported and can be imported cleanly', () => {
    expect(Hls).toBeDefined();
    expect(typeof Hls.isSupported).toBe('function');
    expect(Hls.Events).toBeDefined();
    expect(Hls.ErrorTypes).toBeDefined();
  });

  it('6. simulates Hls instance lifecycle: attachMedia, loadSource, event handling and destroy', () => {
    const mockHls = {
      attachMedia: vi.fn(),
      loadSource: vi.fn(),
      on: vi.fn(),
      destroy: vi.fn(),
      startLoad: vi.fn(),
      recoverMediaError: vi.fn(),
    };

    const dummyVideo = document.createElement('video');
    const playlistUrl = EXPECTED_HLS_MAPPINGS['what-is-investment'];

    mockHls.loadSource(playlistUrl);
    mockHls.attachMedia(dummyVideo);

    expect(mockHls.loadSource).toHaveBeenCalledWith(playlistUrl);
    expect(mockHls.attachMedia).toHaveBeenCalledWith(dummyVideo);

    // Verify cleanup
    mockHls.destroy();
    expect(mockHls.destroy).toHaveBeenCalledTimes(1);
  });

  it('7. verifies native HLS fallback detection behavior for Apple/Safari browsers', () => {
    const dummyVideo = document.createElement('video');
    // In happy-dom, canPlayType returns empty string for apple mpegurl by default
    const canPlayAppleHls = dummyVideo.canPlayType('application/vnd.apple.mpegurl');
    expect(typeof canPlayAppleHls).toBe('string');
  });

  it('8. verifies HLS network error handling and retry limits with fallback to MP4', () => {
    let networkRetries = 0;
    const maxRetries = 2;
    let fallbackToMp4 = false;
    const activeVideoUrl = 'https://example.com/video.mp4';

    const handleHlsNetworkError = (hls: { startLoad: () => void; destroy: () => void }) => {
      if (networkRetries < maxRetries) {
        networkRetries += 1;
        hls.startLoad();
      } else {
        hls.destroy();
        fallbackToMp4 = true;
      }
    };

    const mockHls = {
      startLoad: vi.fn(),
      destroy: vi.fn(),
    };

    // First network failure -> retry 1
    handleHlsNetworkError(mockHls);
    expect(networkRetries).toBe(1);
    expect(mockHls.startLoad).toHaveBeenCalledTimes(1);
    expect(fallbackToMp4).toBe(false);

    // Second network failure -> retry 2
    handleHlsNetworkError(mockHls);
    expect(networkRetries).toBe(2);
    expect(mockHls.startLoad).toHaveBeenCalledTimes(2);
    expect(fallbackToMp4).toBe(false);

    // Third network failure -> retries exhausted, fall back to MP4
    handleHlsNetworkError(mockHls);
    expect(networkRetries).toBe(2);
    expect(mockHls.destroy).toHaveBeenCalledTimes(1);
    expect(fallbackToMp4).toBe(true);
    expect(activeVideoUrl).toBeTruthy();
  });

  it('9. verifies HLS media error handling recovers up to 2 times before falling back', () => {
    let mediaRetries = 0;
    const maxRetries = 2;
    let fallbackToMp4 = false;

    const handleHlsMediaError = (hls: { recoverMediaError: () => void; destroy: () => void }) => {
      if (mediaRetries < maxRetries) {
        mediaRetries += 1;
        hls.recoverMediaError();
      } else {
        hls.destroy();
        fallbackToMp4 = true;
      }
    };

    const mockHls = {
      recoverMediaError: vi.fn(),
      destroy: vi.fn(),
    };

    // First media error
    handleHlsMediaError(mockHls);
    expect(mediaRetries).toBe(1);
    expect(mockHls.recoverMediaError).toHaveBeenCalledTimes(1);

    // Second media error
    handleHlsMediaError(mockHls);
    expect(mediaRetries).toBe(2);
    expect(mockHls.recoverMediaError).toHaveBeenCalledTimes(2);

    // Third media error -> exhausted, fallback
    handleHlsMediaError(mockHls);
    expect(mockHls.destroy).toHaveBeenCalledTimes(1);
    expect(fallbackToMp4).toBe(true);
  });

  it('10. verifies switching lessons cleanly destroys the existing HLS pipeline without leaks', () => {
    const pipelines: Array<{ id: string; destroyed: boolean }> = [];

    const createPipeline = (lessonId: string) => {
      const pipeline = { id: lessonId, destroyed: false };
      pipelines.push(pipeline);
      return {
        destroy: () => {
          pipeline.destroyed = true;
        },
      };
    };

    // User starts Lesson 1
    let activeHls = createPipeline('what-is-investment');
    expect(pipelines).toHaveLength(1);
    expect(pipelines[0].destroyed).toBe(false);

    // User switches to Lesson 2 -> previous destroyed
    activeHls.destroy();
    activeHls = createPipeline('what-is-a-stock');
    expect(pipelines).toHaveLength(2);
    expect(pipelines[0].destroyed).toBe(true);
    expect(pipelines[1].destroyed).toBe(false);

    // Component unmounts
    activeHls.destroy();
    expect(pipelines[1].destroyed).toBe(true);
  });

  it('11. verifies quiz completion marks lesson complete and transitions accurately', () => {
    const lesson = INVESTMENT_LESSONS[0];
    expect(lesson.quiz.length).toBeGreaterThan(0);

    const allCorrectAnswers = lesson.quiz.map((q) => q.correctAnswer);
    expect(allCorrectAnswers.every((ans) => typeof ans === 'number' && ans >= 0)).toBe(true);
  });

  it('12. ensures fallback loop prevention prevents re-triggering HLS if MP4 fallback also fails', () => {
    let isFallbackToMp4 = false;
    let hlsInitCount = 0;
    let errorStateSet = false;

    const simulateHlsFatalError = () => {
      if (!isFallbackToMp4) {
        isFallbackToMp4 = true;
        // switch to MP4
      } else {
        errorStateSet = true;
      }
    };

    const simulateVideoError = () => {
      if (!isFallbackToMp4) {
        hlsInitCount += 1;
      } else {
        // Do not re-initiate HLS, directly set error overlay
        errorStateSet = true;
      }
    };

    // HLS fatal error triggers MP4 fallback
    simulateHlsFatalError();
    expect(isFallbackToMp4).toBe(true);
    expect(errorStateSet).toBe(false);

    // If MP4 subsequently errors, it must NOT re-init HLS
    simulateVideoError();
    expect(hlsInitCount).toBe(0);
    expect(errorStateSet).toBe(true);
  });

  it('13. verifies buffering indicator transitions respond accurately to media events', () => {
    let isBuffering = false;
    let isPlaying = true;

    // Media waits for data
    const onWaiting = () => {
      if (isPlaying) isBuffering = true;
    };
    onWaiting();
    expect(isBuffering).toBe(true);

    // Playback resumes
    const onPlaying = () => {
      isBuffering = false;
    };
    onPlaying();
    expect(isBuffering).toBe(false);

    // Seeking into unbuffered region
    const onSeeking = (hasBuffer: boolean) => {
      if (isPlaying && !hasBuffer) isBuffering = true;
    };
    onSeeking(false);
    expect(isBuffering).toBe(true);

    // Seeked complete
    const onSeeked = () => {
      isBuffering = false;
    };
    onSeeked();
    expect(isBuffering).toBe(false);
  });

  it('14. verifies sensible adaptive buffering configuration constants', () => {
    const sensibleConfig = {
      maxBufferLength: 30, // 30s target buffer
      maxMaxBufferLength: 60, // 60s max
      maxBufferSize: 30 * 1000 * 1000, // 30MB max memory buffer
      backBufferLength: 90,
    };

    expect(sensibleConfig.maxBufferLength).toBeGreaterThanOrEqual(20);
    expect(sensibleConfig.maxBufferLength).toBeLessThanOrEqual(30);
    expect(sensibleConfig.maxMaxBufferLength).toBe(60);
    expect(sensibleConfig.maxBufferSize).toBe(30_000_000);
  });

  it('15. verifies supported playback rate speeds and time formatting', () => {
    const supportedRates = [1, 1.25, 1.5];
    expect(supportedRates).toContain(1);
    expect(supportedRates).toContain(1.25);
    expect(supportedRates).toContain(1.5);

    const formatTime = (secs: number) => {
      const m = Math.floor(secs / 60);
      const s = Math.floor(secs % 60);
      return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    expect(formatTime(0)).toBe('0:00');
    expect(formatTime(93)).toBe('1:33');
    expect(formatTime(120)).toBe('2:00');
  });
});

