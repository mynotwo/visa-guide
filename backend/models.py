from sqlalchemy import Column, String, Integer, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import uuid


class ApplicationSession(Base):
    __tablename__ = "application_sessions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    parent_openid = Column(String, nullable=False, index=True)
    child_openid = Column(String, nullable=True)
    child_phone = Column(String, nullable=True)
    current_question_order = Column(Integer, default=1)
    is_complete = Column(Boolean, default=False)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    answers = relationship("Answer", back_populates="session")
    escalations = relationship("Escalation", back_populates="session")


class Answer(Base):
    __tablename__ = "answers"

    id = Column(Integer, primary_key=True, autoincrement=True)
    session_id = Column(String, ForeignKey("application_sessions.id"), nullable=False)
    question_id = Column(String, nullable=False)
    answer_zh = Column(Text, nullable=False)
    answer_en = Column(Text, nullable=False)
    is_skipped = Column(Boolean, default=False)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    session = relationship("ApplicationSession", back_populates="answers")


class Escalation(Base):
    __tablename__ = "escalations"

    id = Column(Integer, primary_key=True, autoincrement=True)
    session_id = Column(String, ForeignKey("application_sessions.id"), nullable=False)
    question_id = Column(String, nullable=False)
    parent_note = Column(Text, nullable=True)
    ai_suggestion = Column(Text, nullable=True)
    child_reply = Column(Text, nullable=True)
    status = Column(String, default="pending")
    created_at = Column(DateTime, server_default=func.now())
    resolved_at = Column(DateTime, nullable=True)

    session = relationship("ApplicationSession", back_populates="escalations")
