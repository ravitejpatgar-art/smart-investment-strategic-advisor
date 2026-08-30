"""
SmartVest Master Regression & Full Phase Validation Runner (Phase 44 & 46)
Executes all unit, integration, conversational AI, and data isolation test suites.
Exits with non-zero exit code if any test fails.
"""

import sys
import os
import subprocess

# Ensure UTF-8 output on Windows console
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

scripts = [
    "test_user_context.py",
    "test_recommendation_engine.py",
    "test_portfolio_engine.py",
    "test_goal_engine.py",
    "test_ai_assistant.py",
    "test_chatgpt_style_assistant.py",
    "test_vestiq_chat_persistence.py",
    "test_vestiq_universal_accuracy.py",
    "test_ai_evaluation.py",
    "test_market_data.py",
    "test_universal_ai_engine.py",
    "test_active_user_data.py",
    "test_risk_allocation_matrix.py",
    "test_risk_candidate_differentiation.py",
    "test_personalized_basket.py",
    "test_risk_recommendation_integrity.py"
]


print("=" * 70)
print("RUNNING MASTER FULL REGRESSION TEST SUITE (PHASES 1 TO 47)")
print("=" * 70)

failed = []
passed = []

for s in scripts:
    path = os.path.join(os.path.dirname(__file__), s)
    print(f"\n>>> Running {s}...")
    res = subprocess.run([sys.executable, path], capture_output=True, text=True, encoding='utf-8', errors='replace')
    if res.returncode != 0:
        print(f"FAILED {s}:\nSTDOUT:\n{res.stdout}\nSTDERR:\n{res.stderr}")
        failed.append(s)
    else:
        print(f"PASSED {s}")
        passed.append(s)

print("\n" + "=" * 70)
print(f"REGRESSION SUITE SUMMARY: {len(passed)}/{len(scripts)} TEST SUITES PASSED")
if failed:
    print(f"FAILED SUITES: {', '.join(failed)}")
    print("=" * 70)
    sys.exit(1)
else:
    print("ALL 10 TEST SUITES VERIFIED & PASSED FULL BACKEND REGRESSION SUITE 100%!")
    print("=" * 70)
