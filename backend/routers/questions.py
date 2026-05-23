from fastapi import APIRouter
import json
import os

router = APIRouter(prefix="/questions", tags=["questions"])

_questions_path = os.path.join(os.path.dirname(__file__), "../data/ds160_questions.json")

try:
    with open(_questions_path) as f:
        QUESTIONS = json.load(f)
except FileNotFoundError:
    raise RuntimeError(f"DS-160 question library not found at {_questions_path}. Ensure data/ds160_questions.json exists.")


@router.get("")
def get_all_questions():
    return QUESTIONS
