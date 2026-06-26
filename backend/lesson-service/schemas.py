from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class LessonCreate(BaseModel):
    title: str
    subject: str
    grade: str
    content: str

class LessonOut(BaseModel):
    id: int
    title: str
    subject: str
    grade: str
    content: str
    created_at: datetime
    owner_id: int

    class Config:
        from_attributes = True

class LessonTemplateCreate(BaseModel):
    title: str
    subject: str
    grade: str
    content: str

class LessonTemplateOut(BaseModel):
    id: int
    title: str
    subject: str
    grade: str
    content: str
    author: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
