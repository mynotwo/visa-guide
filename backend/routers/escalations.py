from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas
from services.wechat_service import send_wechat_notification
from services.ai_service import suggest_english_answer
from services.answer_sheet import QUESTIONS

router = APIRouter(prefix="/escalations", tags=["escalations"])


@router.post("", response_model=schemas.EscalationResponse)
def create_escalation(body: schemas.EscalationCreate, db: Session = Depends(get_db)):
    session = db.query(models.ApplicationSession).filter_by(id=body.session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    question = QUESTIONS.get(body.question_id)
    ai_suggestion = None
    if question:
        try:
            hint = f"父母留言：{body.parent_note}" if body.parent_note else "无留言"
            ai_suggestion = suggest_english_answer(
                question=question,
                answer_zh=f"[敏感题，需孩子确认] {hint}"
            )
        except Exception:
            ai_suggestion = "AI 无法自动建议，请孩子人工判断。"

    escalation = models.Escalation(
        session_id=body.session_id,
        question_id=body.question_id,
        parent_note=body.parent_note,
        ai_suggestion=ai_suggestion,
    )
    db.add(escalation)
    db.commit()
    db.refresh(escalation)

    if session.child_openid and question:
        send_wechat_notification(
            to_openid=session.child_openid,
            question_zh=question["question_zh"],
            session_id=body.session_id,
        )

    return escalation


@router.post("/{escalation_id}/resolve", response_model=schemas.EscalationResponse)
def resolve_escalation(
    escalation_id: int,
    body: schemas.EscalationResolve,
    db: Session = Depends(get_db)
):
    esc = db.query(models.Escalation).filter_by(id=escalation_id).first()
    if not esc:
        raise HTTPException(status_code=404, detail="Escalation not found")
    esc.child_reply = body.child_reply
    esc.status = "resolved"
    esc.resolved_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(esc)
    return esc
