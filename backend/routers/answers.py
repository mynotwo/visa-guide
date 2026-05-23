from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas
from typing import List

router = APIRouter(prefix="/sessions", tags=["answers"])


@router.post("/{session_id}/answers/{question_id}", response_model=schemas.AnswerResponse)
def save_answer(
    session_id: str,
    question_id: str,
    body: schemas.AnswerCreate,
    db: Session = Depends(get_db)
):
    session = db.query(models.ApplicationSession).filter_by(id=session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    existing = db.query(models.Answer).filter_by(session_id=session_id, question_id=question_id).first()
    if existing:
        existing.answer_zh = body.answer_zh
        existing.answer_en = body.answer_en
        existing.is_skipped = False
        db.commit()
        db.refresh(existing)
        return existing
    answer = models.Answer(
        session_id=session_id,
        question_id=question_id,
        answer_zh=body.answer_zh,
        answer_en=body.answer_en,
    )
    db.add(answer)
    db.commit()
    db.refresh(answer)
    return answer


@router.post("/{session_id}/answers/{question_id}/skip", response_model=schemas.AnswerResponse)
def skip_answer(session_id: str, question_id: str, db: Session = Depends(get_db)):
    session = db.query(models.ApplicationSession).filter_by(id=session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    existing = db.query(models.Answer).filter_by(session_id=session_id, question_id=question_id).first()
    if existing:
        existing.is_skipped = True
        db.commit()
        db.refresh(existing)
        return existing
    answer = models.Answer(
        session_id=session_id,
        question_id=question_id,
        answer_zh="",
        answer_en="",
        is_skipped=True,
    )
    db.add(answer)
    db.commit()
    db.refresh(answer)
    return answer


@router.get("/{session_id}/answers", response_model=List[schemas.AnswerResponse])
def get_answers(session_id: str, db: Session = Depends(get_db)):
    session = db.query(models.ApplicationSession).filter_by(id=session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return db.query(models.Answer).filter_by(session_id=session_id).all()
