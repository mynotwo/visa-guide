from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.ai_service import suggest_english_answer
import json
import os

router = APIRouter(prefix="/ai", tags=["ai"])

_questions_path = os.path.join(os.path.dirname(__file__), "../data/ds160_questions.json")

try:
    with open(_questions_path) as f:
        QUESTIONS = {q["id"]: q for q in json.load(f)}
except FileNotFoundError:
    raise RuntimeError(f"DS-160 question library not found at {_questions_path}. Ensure data/ds160_questions.json exists.")


class SuggestRequest(BaseModel):
    question_id: str
    answer_zh: str


class SuggestResponse(BaseModel):
    answer_en: str


@router.post("/suggest", response_model=SuggestResponse)
def suggest(body: SuggestRequest):
    question = QUESTIONS.get(body.question_id)
    if not question:
        raise HTTPException(status_code=404, detail=f"Question {body.question_id} not found")
    try:
        answer_en = suggest_english_answer(question=question, answer_zh=body.answer_zh)
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"AI service error: {str(e)}")
    return {"answer_en": answer_en}
