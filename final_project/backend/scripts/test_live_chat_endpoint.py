import os
import sys

# Ensure UTF-8 output on Windows console
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

from fastapi.testclient import TestClient

# Ensure app path is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.main import app

def test_live_chat_pipeline():
    client = TestClient(app)
    
    user_c = {
        "name": "Vikram",
        "age": 35,
        "monthlyIncome": 320000,
        "monthlyExpenses": 110000,
        "investableSurplus": 210000,
        "riskTolerance": "Conservative"
    }

    # =========================================================================
    # SECTION 17: NON-NEGOTIABLE TESTS 1 THROUGH 9
    # =========================================================================

    # TEST 1: "What is an ETF?" -> topic = ETF, intent = GENERAL_FINANCIAL_EDUCATION
    resp_1 = client.post("/api/v1/ai/chat", json={"question": "What is an ETF?", "requestId": "req_test_1", "user_context": user_c})
    assert resp_1.status_code == 200
    data_1 = resp_1.json()
    assert data_1["intent"] == "GENERAL_FINANCIAL_EDUCATION"
    assert data_1["topic"] == "ETF"
    assert data_1["contextMode"] == "EDUCATIONAL"
    assert "Exchange Traded Fund" in data_1["answer"] or "ETF" in data_1["answer"]
    assert "hedge fund" not in data_1["answer"].lower()
    assert "320,000" not in data_1["answer"]
    print(">>> TEST 1 PASSED: 'What is an ETF?' -> topic=ETF")

    # TEST 2: "What is a hedge fund?" -> topic = HEDGE_FUND, intent = GENERAL_FINANCIAL_EDUCATION
    resp_2 = client.post("/api/v1/ai/chat", json={"question": "What is a hedge fund?", "requestId": "req_test_2", "user_context": user_c})
    assert resp_2.status_code == 200
    data_2 = resp_2.json()
    assert data_2["intent"] == "GENERAL_FINANCIAL_EDUCATION"
    assert data_2["topic"] == "HEDGE_FUND"
    assert data_2["contextMode"] == "EDUCATIONAL"
    assert "Hedge Fund" in data_2["answer"]
    assert "Exchange Traded Fund" not in data_2["answer"]
    assert "320,000" not in data_2["answer"]
    print(">>> TEST 2 PASSED: 'What is a hedge fund?' -> topic=HEDGE_FUND (NOT ETF!)")

    # Also test "what is hedge fund" (without 'a')
    resp_2b = client.post("/api/v1/ai/chat", json={"question": "what is hedge fund", "requestId": "req_test_2b", "user_context": user_c})
    assert resp_2b.status_code == 200
    data_2b = resp_2b.json()
    assert data_2b["topic"] == "HEDGE_FUND"
    assert "Hedge Fund" in data_2b["answer"]
    assert "Exchange Traded Fund" not in data_2b["answer"]
    print(">>> TEST 2b PASSED: 'what is hedge fund' -> topic=HEDGE_FUND")

    # TEST 3: "What is a mutual fund?" -> topic = MUTUAL_FUND
    resp_3 = client.post("/api/v1/ai/chat", json={"question": "What is a mutual fund?", "requestId": "req_test_3", "user_context": user_c})
    assert resp_3.status_code == 200
    data_3 = resp_3.json()
    assert data_3["intent"] == "GENERAL_FINANCIAL_EDUCATION"
    assert data_3["topic"] == "MUTUAL_FUND"
    assert "Mutual Fund" in data_3["answer"]
    assert "Exchange Traded Fund" not in data_3["answer"]
    print(">>> TEST 3 PASSED: 'What is a mutual fund?' -> topic=MUTUAL_FUND")

    # TEST 4: "What is an index fund?" -> topic = INDEX_FUND
    resp_4 = client.post("/api/v1/ai/chat", json={"question": "What is an index fund?", "requestId": "req_test_4", "user_context": user_c})
    assert resp_4.status_code == 200
    data_4 = resp_4.json()
    assert data_4["intent"] == "GENERAL_FINANCIAL_EDUCATION"
    assert data_4["topic"] == "INDEX_FUND"
    assert "Index Fund" in data_4["answer"]
    print(">>> TEST 4 PASSED: 'What is an index fund?' -> topic=INDEX_FUND")

    # TEST 5: "What is a liquid fund?" -> topic = LIQUID_FUND
    resp_5 = client.post("/api/v1/ai/chat", json={"question": "What is a liquid fund?", "requestId": "req_test_5", "user_context": user_c})
    assert resp_5.status_code == 200
    data_5 = resp_5.json()
    assert data_5["intent"] == "GENERAL_FINANCIAL_EDUCATION"
    assert data_5["topic"] == "LIQUID_FUND"
    assert "Liquid Fund" in data_5["answer"]
    print(">>> TEST 5 PASSED: 'What is a liquid fund?' -> topic=LIQUID_FUND")

    # TEST 6: "What is a debt fund?" -> topic = DEBT_FUND
    resp_6 = client.post("/api/v1/ai/chat", json={"question": "What is a debt fund?", "requestId": "req_test_6", "user_context": user_c})
    assert resp_6.status_code == 200
    data_6 = resp_6.json()
    assert data_6["intent"] == "GENERAL_FINANCIAL_EDUCATION"
    assert data_6["topic"] == "DEBT_FUND"
    assert "Debt" in data_6["answer"]
    print(">>> TEST 6 PASSED: 'What is a debt fund?' -> topic=DEBT_FUND")

    # TEST 7: "Is MON100 an ETF?" -> topic = ETF
    resp_7 = client.post("/api/v1/ai/chat", json={"question": "Is MON100 an ETF?", "requestId": "req_test_7", "user_context": user_c})
    assert resp_7.status_code == 200
    data_7 = resp_7.json()
    assert data_7["intent"] == "GENERAL_FINANCIAL_EDUCATION"
    assert data_7["topic"] == "ETF"
    assert "MON100 is an ETF" in data_7["answer"]
    print(">>> TEST 7 PASSED: 'Is MON100 an ETF?' -> topic=ETF")

    # TEST 8: "What is the difference between an ETF and a hedge fund?" -> topic = ETF_COMPARISON
    resp_8 = client.post("/api/v1/ai/chat", json={"question": "What is the difference between an ETF and a hedge fund?", "requestId": "req_test_8", "user_context": user_c})
    assert resp_8.status_code == 200
    data_8 = resp_8.json()
    assert data_8["intent"] == "ETF_COMPARISON"
    assert data_8["topic"] == "ETF_COMPARISON"
    assert "Exchange Traded Fund" in data_8["answer"]
    assert "Hedge Fund" in data_8["answer"]
    print(">>> TEST 8 PASSED: 'What is the difference between an ETF and a hedge fund?' -> explains BOTH concepts")

    # TEST 9: "Should I invest in a hedge fund?" -> intent = INVESTMENT_RECOMMENDATION, topic = HEDGE_FUND
    resp_9 = client.post("/api/v1/ai/chat", json={"question": "Should I invest in a hedge fund?", "requestId": "req_test_9", "user_context": user_c})
    assert resp_9.status_code == 200
    data_9 = resp_9.json()
    assert data_9["intent"] == "INVESTMENT_RECOMMENDATION"
    assert data_9["topic"] == "HEDGE_FUND"
    assert data_9["contextMode"] == "PERSONALIZED"
    assert "1 Crore" in data_9["answer"] or "AIF" in data_9["answer"] or "not recommend" in data_9["answer"].lower()
    print(">>> TEST 9 PASSED: 'Should I invest in a hedge fund?' -> personalized suitability check")

    # =========================================================================
    # SECTION 18: TOPIC SEPARATION TEST (CONSECUTIVE EXECUTION)
    # =========================================================================
    queries = [
        ("What is an ETF?", "ETF", "Exchange Traded Fund"),
        ("What is a hedge fund?", "HEDGE_FUND", "Hedge Fund"),
        ("What is a mutual fund?", "MUTUAL_FUND", "Mutual Fund"),
        ("What is an index fund?", "INDEX_FUND", "Index Fund"),
        ("What is a liquid fund?", "LIQUID_FUND", "Liquid Fund"),
        ("What is an SGB?", "SGB", "Sovereign Gold Bond"),
    ]

    answers = []
    for q, expected_topic, expected_keyword in queries:
        r = client.post("/api/v1/ai/chat", json={"question": q, "user_context": user_c})
        assert r.status_code == 200
        d = r.json()
        assert d["topic"] == expected_topic, f"Query '{q}' mapped to '{d['topic']}', expected '{expected_topic}'"
        assert expected_keyword.lower() in d["answer"].lower()
        answers.append(d["answer"])
    
    # Assert every answer is completely distinct (no identical concepts returned)
    assert len(set(answers)) == len(queries), "Topic separation failed: Two different queries produced identical responses!"
    print(">>> SECTION 18 TOPIC SEPARATION PASSED: All 6 concepts produced unique, accurate definitions!")

    print("\n============================================================")
    print("ALL TESTS (SECTION 17 & 18) PASSED WITH 100% SUCCESS!")
    print("============================================================")

if __name__ == "__main__":
    test_live_chat_pipeline()

