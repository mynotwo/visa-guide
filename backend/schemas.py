from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class SessionCreate(BaseModel):
    parent_openid: str
    child_openid: Optional[str] = None
    child_phone: Optional[str] = None


class SessionResponse(BaseModel):
    id: str
    parent_openid: str
    current_question_order: int
    is_complete: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class AnswerCreate(BaseModel):
    answer_zh: str
    answer_en: str


class AnswerResponse(BaseModel):
    id: int
    question_id: str
    answer_zh: str
    answer_en: str
    is_skipped: bool

    model_config = {"from_attributes": True}


class EscalationCreate(BaseModel):
    session_id: str
    question_id: str
    parent_note: Optional[str] = None


class EscalationResolve(BaseModel):
    child_reply: str


class EscalationResponse(BaseModel):
    id: int
    question_id: str
    parent_note: Optional[str]
    ai_suggestion: Optional[str]
    child_reply: Optional[str]
    status: str

    model_config = {"from_attributes": True}
