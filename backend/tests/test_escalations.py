from unittest.mock import patch


def test_create_escalation(client):
    session = client.post("/sessions", json={"parent_openid": "oXXX", "child_openid": "oYYY"}).json()
    sid = session["id"]
    with patch("routers.escalations.send_wechat_notification") as mock_notify:
        mock_notify.return_value = True
        with patch("routers.escalations.suggest_english_answer") as mock_ai:
            mock_ai.return_value = "NO"
            response = client.post("/escalations", json={
                "session_id": sid,
                "question_id": "p8_us_refused",
                "parent_note": "2015年日本护照过期被退回，算吗？"
            })
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "pending"
    assert data["question_id"] == "p8_us_refused"
    assert "ai_suggestion" in data


def test_resolve_escalation(client):
    session = client.post("/sessions", json={"parent_openid": "oXXX", "child_openid": "oYYY"}).json()
    sid = session["id"]
    with patch("routers.escalations.send_wechat_notification"):
        with patch("routers.escalations.suggest_english_answer") as mock_ai:
            mock_ai.return_value = "NO"
            esc = client.post("/escalations", json={
                "session_id": sid,
                "question_id": "p8_us_refused"
            }).json()
    response = client.post(f"/escalations/{esc['id']}/resolve", json={"child_reply": "填 NO，日本不算"})
    assert response.status_code == 200
    assert response.json()["status"] == "resolved"
    assert response.json()["child_reply"] == "填 NO，日本不算"
