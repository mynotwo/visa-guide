def test_create_session(client):
    response = client.post("/sessions", json={"parent_openid": "oXXXtest123"})
    assert response.status_code == 200
    data = response.json()
    assert data["parent_openid"] == "oXXXtest123"
    assert data["current_question_order"] == 1
    assert data["is_complete"] == False
    assert "id" in data


def test_get_session(client):
    create = client.post("/sessions", json={"parent_openid": "oXXXtest123"})
    session_id = create.json()["id"]
    response = client.get(f"/sessions/{session_id}")
    assert response.status_code == 200
    assert response.json()["id"] == session_id


def test_get_nonexistent_session(client):
    response = client.get("/sessions/nonexistent-id")
    assert response.status_code == 404
