from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas

router = APIRouter(prefix="/sessions", tags=["sessions"])


@router.post("", response_model=schemas.SessionResponse)
def create_session(body: schemas.SessionCreate, db: Session = Depends(get_db)):
    session = models.ApplicationSession(
        parent_openid=body.parent_openid,
        child_openid=body.child_openid,
        child_phone=body.child_phone,
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return session


@router.get("/{session_id}", response_model=schemas.SessionResponse)
def get_session(session_id: str, db: Session = Depends(get_db)):
    session = db.query(models.ApplicationSession).filter_by(id=session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session
