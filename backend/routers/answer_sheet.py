from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models
from services.answer_sheet import generate_answer_sheet

router = APIRouter(prefix="/sessions", tags=["sessions"])


@router.get("/{session_id}/answer-sheet")
def get_answer_sheet(session_id: str, db: Session = Depends(get_db)):
    session = db.query(models.ApplicationSession).filter_by(id=session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    answers = db.query(models.Answer).filter_by(session_id=session_id).all()
    answer_dicts = [
        {
            "question_id": a.question_id,
            "answer_zh": a.answer_zh,
            "answer_en": a.answer_en,
            "is_skipped": a.is_skipped,
        }
        for a in answers
    ]
    return generate_answer_sheet(answer_dicts)
