from fastapi import APIRouter
import json
import os

router = APIRouter(prefix="/questions", tags=["questions"])

_questions_path = os.path.join(os.path.dirname(__file__), "../data/ds160_questions.json")
with open(_questions_path) as f:
    QUESTIONS = json.load(f)


@router.get("")
def get_all_questions():
    return QUESTIONS
