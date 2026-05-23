def test_save_answer(client):
    session = client.post("/sessions", json={"parent_openid": "oXXX"}).json()
    sid = session["id"]
    response = client.post(
        f"/sessions/{sid}/answers/p1_surname",
        json={"answer_zh": "王", "answer_en": "WANG"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["question_id"] == "p1_surname"
    assert data["answer_en"] == "WANG"
    assert data["is_skipped"] == False


def test_skip_answer(client):
    session = client.post("/sessions", json={"parent_openid": "oXXX"}).json()
    sid = session["id"]
    response = client.post(
        f"/sessions/{sid}/answers/p8_us_refused/skip",
        json={}
    )
    assert response.status_code == 200
    assert response.json()["is_skipped"] == True


def test_get_session_answers(client):
    session = client.post("/sessions", json={"parent_openid": "oXXX"}).json()
    sid = session["id"]
    client.post(f"/sessions/{sid}/answers/p1_surname", json={"answer_zh": "王", "answer_en": "WANG"})
    client.post(f"/sessions/{sid}/answers/p1_given_name", json={"answer_zh": "建国", "answer_en": "JIANGUO"})
    response = client.get(f"/sessions/{sid}/answers")
    assert response.status_code == 200
    assert len(response.json()) == 2
