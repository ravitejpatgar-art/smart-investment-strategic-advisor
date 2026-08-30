import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_ai_relevance():
    print("=" * 65)
    print("SMARTVEST AI RELEVANCE & INSTRUMENT INTELLIGENCE TEST SUITE")
    print("=" * 65)

    user_ctx = {
        "name": "Ravi Sharma",
        "monthlyIncome": 120000,
        "monthlyExpenses": 45000,
        "investableSurplus": 75000,
        "riskTolerance": "Aggressive",
        "investmentHorizon": "10 years",
        "age": 27
    }

    # 1. Test MON100 query
    print("\n--- TEST 1: Query 'mon100' ---")
    res1 = client.post("/api/v1/ai/chat", json={
        "query": "mon100",
        "userContext": user_ctx,
        "history": []
    })
    assert res1.status_code == 200, f"Got status {res1.status_code}"
    data1 = res1.json()
    ans1 = data1.get("answer", "")
    print("Answer:\n" + ans1[:300] + "...\n")
    
    assert "Motilal Oswal Nasdaq 100 ETF" in ans1, "Missing Motilal Oswal Nasdaq 100 ETF"
    assert "0.58%" in ans1, "Missing expense ratio 0.58%"
    assert "Apple" in ans1 or "Nasdaq-100" in ans1, "Missing benchmark or holdings"
    assert "An Exchange Traded Fund (ETF) is an investment fund traded on stock exchanges" not in ans1, "Leaked generic glossary placeholder!"
    print(">>> [PASS] TEST 1: 'mon100' returned specific, relevant MON100 ETF intelligence!")

    # 2. Test 'should i buy mon100'
    print("\n--- TEST 2: Query 'should i buy mon100' ---")
    res2 = client.post("/api/v1/ai/chat", json={
        "query": "should i buy mon100",
        "userContext": user_ctx,
        "history": []
    })
    assert res2.status_code == 200
    ans2 = res2.json().get("answer", "")
    assert "MON100" in ans2, "Missing MON100 in recommendation"
    assert "Suitability Rating" in ans2 or "Aggressive" in ans2, "Missing profile alignment"
    print(">>> [PASS] TEST 2: 'should i buy mon100' returned personalized suitability analysis!")

    # 3. Test 'goldbees'
    print("\n--- TEST 3: Query 'goldbees' ---")
    res3 = client.post("/api/v1/ai/chat", json={
        "query": "goldbees",
        "userContext": user_ctx,
        "history": []
    })
    assert res3.status_code == 200
    ans3 = res3.json().get("answer", "")
    assert "Gold BeES" in ans3, "Missing Gold BeES"
    assert "99.5%" in ans3 or "Physical Gold" in ans3, "Missing gold backing"
    print(">>> [PASS] TEST 3: 'goldbees' returned accurate Gold ETF metrics!")

    # 4. Test 'niftybees'
    print("\n--- TEST 4: Query 'niftybees' ---")
    res4 = client.post("/api/v1/ai/chat", json={
        "query": "niftybees",
        "userContext": user_ctx,
        "history": []
    })
    assert res4.status_code == 200
    ans4 = res4.json().get("answer", "")
    assert "Nifty BeES" in ans4 or "Nifty 50" in ans4, "Missing Nifty 50 ETF"
    assert "0.04%" in ans4, "Missing 0.04% TER"
    print(">>> [PASS] TEST 4: 'niftybees' returned accurate Nifty ETF metrics!")

    # 5. Test Pure Educational Query 'What is an ETF?'
    print("\n--- TEST 5: Educational Query 'What is an ETF?' ---")
    res5 = client.post("/api/v1/ai/chat", json={
        "query": "What is an ETF?",
        "userContext": user_ctx,
        "history": []
    })
    assert res5.status_code == 200
    ans5 = res5.json().get("answer", "")
    assert "Exchange Traded Fund" in ans5
    print(">>> [PASS] TEST 5: 'What is an ETF?' correctly returned concept explanation!")

    # 6. Test Multi-Turn Pronoun Resolution (Turn 1: 'tell me about nvidia', Turn 2: 'how much should i put in it?')
    print("\n--- TEST 6: Multi-turn Pronoun Resolution ---")
    res6a = client.post("/api/v1/ai/chat", json={
        "query": "tell me about nvidia",
        "userContext": user_ctx,
        "history": []
    })
    assert res6a.status_code == 200
    ans6a = res6a.json().get("answer", "")
    assert "NVIDIA" in ans6a

    res6b = client.post("/api/v1/ai/chat", json={
        "query": "how much should i put in it?",
        "userContext": user_ctx,
        "history": [
            {"role": "user", "content": "tell me about nvidia"},
            {"role": "assistant", "content": ans6a}
        ]
    })
    assert res6b.status_code == 200
    ans6b = res6b.json().get("answer", "")
    assert "NVIDIA" in ans6b, "Failed to resolve 'it' to NVIDIA"
    print(">>> [PASS] TEST 6: Multi-turn pronoun 'it' resolved to NVIDIA successfully!")

    print("\n" + "=" * 65)
    print("ALL AI RELEVANCE & INSTRUMENT INTELLIGENCE TESTS PASSED 100%!")
    print("=" * 65)

if __name__ == "__main__":
    test_ai_relevance()
