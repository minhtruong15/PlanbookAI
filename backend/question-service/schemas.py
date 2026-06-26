from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class QuestionBase(BaseModel):
    content: str
    subject: str
    grade: str
    level: str
    options: Optional[str] = None
    correct_answer: Optional[str] = None
    explanation: Optional[str] = None

class QuestionCreate(QuestionBase):
    pass

class QuestionOut(QuestionBase):
    id: int
    author: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
