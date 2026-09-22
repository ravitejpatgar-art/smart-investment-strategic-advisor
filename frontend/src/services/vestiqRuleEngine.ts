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
import type { ReasoningResult } from './vestiqReasoning';
import { composeAnswer } from './vestiqAnswerComposer';

// Alias ReasoningResult to VestiqRuleResult for full backwards compatibility
export type VestiqRuleResult = ReasoningResult;

/**
 * Executes the multi-stage deterministic finance reasoning pipeline:
 * PARSED QUERY -> DYNAMIC ENTITY RESOLUTION -> DATA REQUIREMENTS PLAN -> PARALLEL API GATHERING -> RULE EVALUATION -> DYNAMIC ANSWER COMPOSITION
 */
export async function executeDeterministicAdvisor(
  parsed: ParsedFinanceQuery,
  userContext?: any
): Promise<VestiqRuleResult> {
  const resolved = await resolveDynamicEntities(parsed);
  const plan = planDataRequirements(resolved);
  const evidence = await gatherEvidence(plan, userContext);
  return composeAnswer(resolved, evidence, userContext);
}
