/**
 * VestIQ Deterministic Finance Advisor Engine — Phase 2
 * Strictly frontend-only, typed TypeScript reasoning, calculation, and retrieval engine.
 * ZERO LLM calls, zero generative AI, zero fabricated numbers.
 */

// Re-export Knowledge Base, Dictionaries & Entity Aliases
export * from './vestiqKnowledgeBase';

// Re-export Question Parser & Context Resolution
export * from './vestiqQuestionParser';

// Re-export Calculations & Reasoning
export * from './vestiqReasoning';

// Re-export Answer Composer & Markdown Formatter
export * from './vestiqAnswerComposer';

// Re-export Finance Knowledge Library
export * from './vestiqFinanceKnowledge';

import type { ParsedFinanceQuery } from './vestiqQuestionParser';
import {
  planDataRequirements,
  gatherEvidence,
  resolveDynamicEntities,
} from './vestiqReasoning';
import type { ReasoningResult, GatheredEvidence } from './vestiqReasoning';
import { composeAnswer } from './vestiqAnswerComposer';

// Alias ReasoningResult to VestiqRuleResult for full backwards compatibility
export type VestiqRuleResult = ReasoningResult;

/**
 * Executes the multi-stage deterministic finance reasoning pipeline:
 * PARSED QUERY -> PLAN DATA REQUIREMENTS -> (IF noApi: COMPOSE LOCAL ANSWER IMMEDIATELY)
 * ELSE -> DYNAMIC ENTITY RESOLUTION WHEN APPLICABLE -> GATHER EVIDENCE -> DYNAMIC ANSWER COMPOSITION
 *
 * For STATIC finance questions (noApi === true), returns immediately without hitting any network/API endpoint.
 */
export async function executeDeterministicAdvisor(
  parsed: ParsedFinanceQuery,
  userContext?: any
): Promise<VestiqRuleResult> {
  const emptyEvidence: GatheredEvidence = {
    quotes: {},
    research: {},
    candles: {},
    portfolio: null,
  };

  // 1. Initial Plan Check: If static / educational / noApi, compose local answer immediately
  const initialPlan = planDataRequirements(parsed);
  if (initialPlan.noApi) {
    return composeAnswer(parsed, emptyEvidence, userContext);
  }

  // 2. Dynamic Entity Resolution when applicable (only if symbols are empty)
  let resolved = parsed;
  if (parsed.symbols.length === 0) {
    try {
      resolved = await resolveDynamicEntities(parsed);
    } catch {
      resolved = parsed;
    }
  }

  // 3. Post-resolution Plan Check
  const plan = planDataRequirements(resolved);
  if (plan.noApi) {
    return composeAnswer(resolved, emptyEvidence, userContext);
  }

  // 4. Gather live market / portfolio evidence using existing APIs
  try {
    const evidence = await gatherEvidence(plan, userContext);
    return composeAnswer(resolved, evidence, userContext);
  } catch {
    return composeAnswer(resolved, emptyEvidence, userContext);
  }
}
