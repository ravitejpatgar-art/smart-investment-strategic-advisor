import React, { useState, useEffect } from 'react';
import { useFintechStore } from '../../store/useFintechStore';
import { 
  recommendationEngine,
  type RecommendationResponse,
  type RequestedAssetClass
} from '../../services/recommendation';
import { 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle, 
  X, 
  Info, 
  Sparkles, 
  RefreshCw 
} from 'lucide-react';

interface RecommendationCardProps {
  initialAssetClass?: RequestedAssetClass;
  onSelectInstrument?: (canonicalId: string) => void;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  initialAssetClass = 'ANY',
  onSelectInstrument
}) => {
  const { user, strategy } = useFintechStore();

  const [assetClass, setAssetClass] = useState<RequestedAssetClass>(initialAssetClass);
  const [investableAmount, setInvestableAmount] = useState<number>(strategy?.recommendedMonthlyInvestment || 20000);
  const [loading, setLoading] = useState<boolean>(true);
  const [recommendation, setRecommendation] = useState<RecommendationResponse | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Synchronize when user or parameters change
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    recommendationEngine.recommend({
      userProfile: user,
      preferredAssetClass: assetClass,
      monthlyInvestableAmount: investableAmount,
      financialGoal: user?.financialGoal,
      investmentHorizon: user?.investmentHorizon,
      existingPortfolio: strategy?.allocations?.map(a => ({
        symbol: a.ticker || a.name,
        name: a.name,
        assetClass: (a.assetType === 'DEBT' ? 'BOND' : (a.category.includes('ETF') ? 'ETF' : 'MUTUAL_FUND')) as any,
        allocationPct: a.percentage,
        amount: a.monthlyAmount,
        benchmark: a.benchmark
      }))
    }).then(res => {
      if (isMounted) {
        setRecommendation(res);
        setLoading(false);
      }
    }).catch(() => {
      if (isMounted) {
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [user, assetClass, investableAmount, strategy?.allocations]);

  if (!user?.onboardingCompleted || recommendation?.status === 'INSUFFICIENT_PROFILE') {
    return (
      <div className="financial-section-card p-6 sm:p-8 space-y-4 border border-[var(--color-border)] rounded-xl bg-[var(--color-card)]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-500">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[var(--color-text-primary)]">
              Suitability Profile Incomplete
            </h3>
            <p className="text-xs text-[var(--color-text-secondary)]">
              The deterministic recommendation engine requires verified investor suitability inputs.
            </p>
          </div>
        </div>

        {recommendation?.missingProfileFields && recommendation.missingProfileFields.length > 0 && (
          <div className="p-3 rounded-lg bg-[var(--color-surface-2)] text-xs text-[var(--color-text-muted)] space-y-1">
            <span className="font-semibold text-[var(--color-text-secondary)]">Missing mandatory fields:</span>
            <ul className="list-disc list-inside">
              {recommendation.missingProfileFields.map(f => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </div>
        )}

        <p className="text-xs text-[var(--color-text-muted)]">
          Complete your risk tolerance, investment horizon, and primary goal to generate verified recommendations.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="financial-section-card p-8 text-center space-y-4 rounded-xl border border-[var(--color-border)]">
        <RefreshCw className="w-6 h-6 mx-auto text-[var(--color-accent-strong)] animate-spin" />
        <p className="text-xs font-semibold text-[var(--color-text-secondary)]">
          Evaluating candidate universe against verified suitability constraints...
        </p>
      </div>
    );
  }

  if (recommendation?.status === 'INSUFFICIENT_DATA' || !recommendation?.recommendedInstrument) {
    return (
      <div className="financial-section-card p-6 sm:p-8 space-y-4 rounded-xl border border-[var(--color-border)]">
        <div className="flex items-center gap-3">
          <Info className="w-5 h-5 text-[var(--color-accent-strong)]" />
          <h3 className="text-base font-bold text-[var(--color-text-primary)]">
            Verified Data Notice
          </h3>
        </div>
        <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
          {recommendation?.message || 'I do not have enough verified data to make a reliable recommendation.'}
        </p>
      </div>
    );
  }

  const inst = recommendation.recommendedInstrument;

  return (
    <div className="space-y-6">
      {/* 1. Asset Class Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)]">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] mr-1 shrink-0">
            Target Asset:
          </span>
          {(['ANY', 'MUTUAL_FUND', 'ETF', 'BOND'] as RequestedAssetClass[]).map(ac => (
            <button
              key={ac}
              onClick={() => setAssetClass(ac)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                assetClass === ac
                  ? 'bg-[var(--color-accent)] text-[var(--color-accent-text)] shadow-xs'
                  : 'bg-[var(--color-surface-1)] hover:bg-[var(--color-surface-3)] text-[var(--color-text-secondary)] border border-[var(--color-border-subtle)]'
              }`}
            >
              {ac === 'ANY' ? 'All Asset Classes' : ac === 'MUTUAL_FUND' ? 'Mutual Funds' : ac === 'ETF' ? 'ETFs' : 'Bonds'}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-[var(--color-text-muted)] font-medium">Deployment:</span>
          <div className="flex items-center gap-1 px-2.5 py-1 rounded bg-[var(--color-surface-1)] border border-[var(--color-border-subtle)]">
            <span className="font-bold text-[var(--color-accent-strong)] font-mono">₹</span>
            <input
              type="number"
              value={investableAmount}
              onChange={e => setInvestableAmount(Math.max(1000, Number(e.target.value) || 0))}
              className="w-20 bg-transparent font-mono font-bold text-xs text-[var(--color-text-primary)] outline-none"
              step={5000}
            />
          </div>
        </div>
      </div>

      {/* 2. Professional Recommendation Card */}
      <div className="financial-section-card p-6 sm:p-8 space-y-6 rounded-2xl border border-[var(--color-border)] shadow-md bg-[var(--color-card)] relative overflow-hidden">
        {/* Subtle Ambient Accent Glow */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-[var(--color-accent)]/5 rounded-full blur-3xl pointer-events-none" />

        {/* Card Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-5 border-b border-[var(--color-border-subtle)]">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[var(--color-accent)]/15 text-[var(--color-accent-strong)] border border-[var(--color-accent)]/30">
                <Sparkles className="w-3 h-3" />
                Recommended for you
              </span>
              <span className="text-xs text-[var(--color-text-muted)]">·</span>
              <span className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
                {inst.assetClass.replace('_', ' ')}
              </span>
              <span className="text-xs text-[var(--color-text-muted)]">·</span>
              <span className="text-[11px] text-[var(--color-text-muted)] italic">
                Selected based on SmartVest's deterministic recommendation methodology.
              </span>
            </div>

            <h2 
              className={`text-xl sm:text-2xl font-black text-[var(--color-text-primary)] tracking-tight ${onSelectInstrument ? 'cursor-pointer hover:text-[var(--color-accent-strong)] transition-colors' : ''}`}
              onClick={() => onSelectInstrument?.(inst.canonicalId)}
            >
              {inst.name}
            </h2>

            <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--color-text-muted)] pt-0.5">
              <span>Category: <strong className="text-[var(--color-text-secondary)]">{inst.category}</strong></span>
              <span>·</span>
              <span>Benchmark: <strong className="text-[var(--color-text-secondary)]">{inst.benchmark}</strong></span>
              {inst.expenseRatio && (
                <>
                  <span>·</span>
                  <span>TER: <strong className="text-emerald-600 font-mono">{inst.expenseRatio}</strong></span>
                </>
              )}
              {inst.creditRating && (
                <>
                  <span>·</span>
                  <span>Rating: <strong className="text-blue-600 font-mono">{inst.creditRating}</strong></span>
                </>
              )}
              {inst.ytm && (
                <>
                  <span>·</span>
                  <span>YTM: <strong className="text-emerald-600 font-mono">{inst.ytm}%</strong></span>
                </>
              )}
            </div>
          </div>

          {/* Score & Freshness Badge */}
          <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 shrink-0">
            <div className="flex items-center gap-2 bg-[var(--color-surface-2)] p-2.5 rounded-xl border border-[var(--color-border)]">
              <div className="text-right">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] block">Suitability Score</span>
                <span className="text-xl sm:text-2xl font-black text-[var(--color-accent-strong)] font-mono">{inst.score}</span>
                <span className="text-xs text-[var(--color-text-muted)] font-mono">/100</span>
              </div>
            </div>

            <div className="text-right">
              <span className="inline-flex items-center gap-1 text-[10.5px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/30 text-blue-600">
                {inst.freshness === 'END_OF_DAY' ? 'LATEST NAV' : inst.freshness}
              </span>
              <span className="text-[10.5px] text-[var(--color-text-muted)] block mt-0.5">
                As of: {inst.asOfDate}
              </span>
            </div>
          </div>
        </div>

        {/* 3. Section: WHY THIS WAS SELECTED */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-primary)] flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Why This Was Selected</span>
            </h3>

            <button
              onClick={() => setIsModalOpen(true)}
              className="text-xs font-bold text-[var(--color-accent-strong)] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>How was this selected?</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {recommendation.whyChosen.map((w, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-[var(--color-surface-1)] border border-[var(--color-border-subtle)] space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[var(--color-text-primary)]">{w.factor}</span>
                  <span className="font-mono text-[11px] font-semibold text-emerald-600">+{w.contribution.toFixed(1)} pts</span>
                </div>
                <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">{w.evidence}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Section: NEGATIVE FACTORS (If any) */}
        {recommendation.negativeFactors.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-[var(--color-border-subtle)]">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Considerations & Trade-Offs</span>
            </span>
            <ul className="space-y-1 text-xs text-[var(--color-text-secondary)] pl-5 list-disc">
              {recommendation.negativeFactors.map((neg, i) => (
                <li key={i}>{neg}</li>
              ))}
            </ul>
          </div>
        )}

        {/* 5. Section: RISKS */}
        {recommendation.risks.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-[var(--color-border-subtle)]">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] block">
              Key Risk Disclosures
            </span>
            <ul className="space-y-1 text-xs text-[var(--color-text-secondary)] pl-5 list-disc">
              {recommendation.risks.map((risk, i) => (
                <li key={i}>{risk}</li>
              ))}
            </ul>
          </div>
        )}

        {/* 6. Section: ALTERNATIVES CONSIDERED */}
        {recommendation.whyAlternativesScoredLower.length > 0 && (
          <div className="space-y-3 pt-4 border-t border-[var(--color-border-subtle)]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-primary)]">
                Alternatives Considered & Why They Scored Lower
              </span>
              <span className="text-[10.5px] text-[var(--color-text-muted)] font-mono">
                {recommendation.eligibleCandidatesCount} Eligible Candidates Evaluated
              </span>
            </div>

            <div className="space-y-2">
              {recommendation.whyAlternativesScoredLower.map((alt, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border-subtle)] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[var(--color-text-muted)]">{idx + 1}.</span>
                      <span className="text-xs font-bold text-[var(--color-text-primary)]">{alt.instrument}</span>
                      <span className="text-[10px] uppercase font-bold text-[var(--color-text-muted)] px-1.5 py-0.5 rounded bg-[var(--color-surface-1)]">
                        {alt.assetClass}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--color-text-secondary)] pl-5">
                      <strong className="text-[var(--color-text-primary)]">Why ranked lower:</strong> {alt.reason}
                    </p>
                    {alt.missingDataLimitations && (
                      <p className="text-[11px] text-amber-600 pl-5 italic">{alt.missingDataLimitations}</p>
                    )}
                  </div>
                  <div className="text-right shrink-0 pl-5 sm:pl-0">
                    <span className="font-mono text-xs font-bold text-[var(--color-text-secondary)]">Score: {alt.score}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 7. Section: METHODOLOGY & AUDIT */}
        <div className="p-4 rounded-xl bg-[var(--color-surface-1)] border border-[var(--color-border-subtle)] space-y-2 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[var(--color-text-muted)]">
            <span>
              Methodology: <strong className="text-[var(--color-text-secondary)] font-mono">{recommendation.methodology.version}</strong> ({recommendation.methodology.assetClass})
            </span>
            <span>
              Timestamp: <strong className="text-[var(--color-text-secondary)] font-mono">{recommendation.dataQuality.timestamp}</strong>
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[var(--color-border-subtle)] text-[11px] text-[var(--color-text-muted)]">
            <span className="font-semibold text-[var(--color-text-secondary)]">Data Sources:</span>
            {recommendation.dataQuality.sources.map((src, idx) => (
              <span key={idx} className="px-2 py-0.5 rounded bg-[var(--color-surface-2)] border border-[var(--color-border-subtle)]">
                {src}
              </span>
            ))}
          </div>

          <p className="text-[10.5px] text-[var(--color-text-muted)] italic pt-1">
            {recommendation.disclaimer}
          </p>

          {/* Development-only debug audit information */}
          {import.meta.env.DEV && recommendation.audit && (
            <details className="mt-3 p-2.5 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border-subtle)] text-[11px] font-mono text-[var(--color-text-muted)]">
              <summary className="cursor-pointer font-bold text-[var(--color-text-secondary)] select-none">
                Deterministic Engine Audit (Dev Only)
              </summary>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2 pt-2 border-t border-[var(--color-border-subtle)] text-[10.5px]">
                <div>Pool: <span className="text-[var(--color-text-primary)] font-bold">{recommendation.audit.candidateCount}</span></div>
                <div>Eligible: <span className="text-[var(--color-text-primary)] font-bold">{recommendation.audit.eligibleCount}</span></div>
                <div>Scored: <span className="text-[var(--color-text-primary)] font-bold">{recommendation.audit.scoredCount}</span></div>
                <div>Excluded: <span className="text-[var(--color-text-primary)] font-bold">{recommendation.audit.excludedCount}</span></div>
                <div>Coverage: <span className="text-[var(--color-text-primary)] font-bold">{recommendation.audit.dataCoveragePct}%</span></div>
                <div>Freshness: <span className="text-[var(--color-text-primary)] font-bold">{recommendation.audit.freshness}</span></div>
                <div className="col-span-2 sm:col-span-3 truncate">Source: <span className="text-[var(--color-text-primary)] font-bold">{recommendation.audit.source}</span></div>
              </div>
            </details>
          )}
        </div>
      </div>

      {/* 8. Detailed Selection Breakdown Modal ("How was this selected?") */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border-subtle)]">
              <div>
                <h3 className="text-base font-bold text-[var(--color-text-primary)]">
                  Selection Evidence Breakdown
                </h3>
                <p className="text-xs text-[var(--color-text-secondary)]">
                  Deterministic multi-factor evaluation for {inst.name}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-[var(--color-surface-2)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Methodology weights explanation */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] block">
                Factor Weight Allocation Matrix
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                {Object.entries(recommendation.methodology.weights).map(([k, w]) => (
                  <div key={k} className="p-2 rounded bg-[var(--color-surface-2)] border border-[var(--color-border-subtle)]">
                    <span className="text-[10.5px] text-[var(--color-text-muted)] block truncate">{k}</span>
                    <span className="font-mono font-bold text-[var(--color-accent-strong)]">{(w * 100).toFixed(0)}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Factor detail table */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] block">
                Factor Evidence & Scores
              </span>
              <div className="space-y-2">
                {recommendation.whyChosen.map((w, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-[var(--color-surface-1)] border border-[var(--color-border-subtle)] space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[var(--color-text-primary)]">{w.factor}</span>
                      <span className="font-mono text-emerald-600 font-bold">Contribution: +{w.contribution.toFixed(1)}</span>
                    </div>
                    <p className="text-[var(--color-text-secondary)]">{w.evidence}</p>
                    {w.dataSource && (
                      <span className="text-[10.5px] text-[var(--color-text-muted)] block italic">
                        Verified Source: {w.dataSource}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Deterministic Invariants Statement */}
            <div className="p-3.5 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border-subtle)] text-xs text-[var(--color-text-secondary)] space-y-1">
              <strong className="text-[var(--color-text-primary)] block">Zero AI Hallucination Guarantee:</strong>
              <p>
                This selection was calculated by SmartVest's deterministic ranking engine using mathematical factor weights. No language model selected this instrument, altered weights, or guessed missing numbers.
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-[var(--color-accent)] text-[var(--color-accent-text)] text-xs font-bold hover:brightness-105 cursor-pointer shadow-xs"
              >
                Close Breakdown
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
