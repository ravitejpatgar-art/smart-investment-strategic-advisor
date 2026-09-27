import type { CandidateInstrumentRecord, PortfolioHolding } from './types';

export interface OverlapAnalysisResult {
  diversificationScore: number; // 0 - 100
  evidence: string;
  duplicateExposure: boolean;
  benchmarkOverlapPct: number;
  sectorOverlapPct: number;
  portfolioStatus: 'VERIFIED_HOLDINGS_ANALYZED' | 'NO_EXISTING_PORTFOLIO' | 'PORTFOLIO_DATA_UNAVAILABLE';
}

/**
 * Calculates portfolio awareness and overlap factors against existing holdings.
 * Enforces diversification rules without arbitrary random penalties.
 * Strictly differentiates between verified empty portfolio vs unavailable portfolio data.
 */
export function analyzePortfolioOverlap(
  candidate: CandidateInstrumentRecord,
  portfolio?: PortfolioHolding[] | null
): OverlapAnalysisResult {
  // Case A: Portfolio data retrieval failed or was not provided
  if (portfolio === undefined || portfolio === null) {
    return {
      diversificationScore: 70,
      evidence: 'Portfolio holdings data currently unavailable; neutral diversification contribution applied without assuming zero holdings.',
      duplicateExposure: false,
      benchmarkOverlapPct: 0,
      sectorOverlapPct: 0,
      portfolioStatus: 'PORTFOLIO_DATA_UNAVAILABLE'
    };
  }

  // Case B: Verified new/empty portfolio
  if (portfolio.length === 0) {
    return {
      diversificationScore: 95,
      evidence: 'User has no existing portfolio holdings; adds pure greenfield diversification benefit.',
      duplicateExposure: false,
      benchmarkOverlapPct: 0,
      sectorOverlapPct: 0,
      portfolioStatus: 'NO_EXISTING_PORTFOLIO'
    };
  }

  let benchmarkOverlapPct = 0;
  let sectorOverlapPct = 0;
  let duplicateExposure = false;

  const candidateBenchmark = (candidate.benchmark || '').toLowerCase();
  const candidateSymbol = candidate.symbol.toLowerCase();

  for (const holding of portfolio) {
    const hSym = holding.symbol.toLowerCase();
    const hName = holding.name.toLowerCase();
    const hBench = (holding.benchmark || '').toLowerCase();
    const hAlloc = holding.allocationPct || 0;

    // Exact or duplicate symbol check
    if (hSym === candidateSymbol || hName === candidate.name.toLowerCase()) {
      duplicateExposure = true;
      benchmarkOverlapPct = 100;
      break;
    }

    // Benchmark comparison (e.g. Nifty 50 vs Nifty 50)
    if (
      candidateBenchmark &&
      hBench &&
      (candidateBenchmark.includes(hBench) || hBench.includes(candidateBenchmark))
    ) {
      benchmarkOverlapPct = Math.max(benchmarkOverlapPct, hAlloc > 0 ? hAlloc * 2 : 75);
    } else if (
      (candidateBenchmark.includes('nifty 50') && (hSym.includes('nifty') || hName.includes('nifty 50'))) ||
      (candidateBenchmark.includes('nasdaq') && (hSym.includes('mon100') || hName.includes('nasdaq') || hSym.includes('qqq'))) ||
      (candidateBenchmark.includes('gold') && (hSym.includes('gold') || hName.includes('gold')))
    ) {
      benchmarkOverlapPct = Math.max(benchmarkOverlapPct, 80);
    }

    // Category / Sector concentration check
    if (
      holding.sector &&
      candidate.subCategory &&
      holding.sector.toLowerCase().includes(candidate.subCategory.toLowerCase())
    ) {
      sectorOverlapPct += (hAlloc > 0 ? hAlloc : 25);
    }
  }

  // Calculate normalized diversification score (0-100)
  let score = 95;
  let evidence = 'Provides strong non-correlated portfolio diversification.';

  if (duplicateExposure) {
    score = 15;
    evidence = `Existing portfolio already contains substantial direct holding of ${candidate.name}.`;
  } else if (benchmarkOverlapPct >= 70) {
    score = 30;
    evidence = `Existing portfolio already contains substantial exposure (${benchmarkOverlapPct}%) to the same benchmark (${candidate.benchmark}).`;
  } else if (benchmarkOverlapPct >= 40) {
    score = 55;
    evidence = `Moderate overlap with existing holdings tracking similar market index.`;
  } else if (sectorOverlapPct >= 40) {
    score = 60;
    evidence = `Existing portfolio already has concentrated exposure to similar sector holdings.`;
  } else {
    // Check asset class balance
    const existingEquityPct = portfolio
      .filter(p => p.assetClass === 'MUTUAL_FUND' || p.assetClass === 'ETF' || p.assetClass === 'STOCK')
      .reduce((sum, p) => sum + (p.allocationPct || 0), 0);

    if (existingEquityPct >= 75 && candidate.assetClass === 'BOND') {
      score = 100;
      evidence = 'High diversification value: adds defensive debt cushion to an equity-heavy portfolio.';
    } else if (existingEquityPct >= 75 && candidate.category.includes('Gold')) {
      score = 98;
      evidence = 'High diversification value: provides non-equity crisis alpha and inflation hedging.';
    } else {
      score = 88;
      evidence = 'Complements existing portfolio allocation across uncorrelated market segments.';
    }
  }

  return {
    diversificationScore: Math.max(10, Math.min(100, score)),
    evidence,
    duplicateExposure,
    benchmarkOverlapPct,
    sectorOverlapPct,
    portfolioStatus: 'VERIFIED_HOLDINGS_ANALYZED'
  };
}
