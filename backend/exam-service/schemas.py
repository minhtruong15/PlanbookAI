from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Any, Dict, List

class ExamBase(BaseModel):
    title: str
    grade: str
    duration: str
    password: Optional[str] = None
    exam_codes: Optional[List[str]] = None
    content: Any
    lesson_id: Optional[int] = None

class ExamCreate(ExamBase):
    pass

class ExamOut(ExamBase):
    id: int
    owner_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class SubmissionBase(BaseModel):
    exam_id: int
    student_name: str
    student_id: str
    exam_code: Optional[str] = None
    answers: Dict[str, int]
    score: Optional[float] = 0
    correct_count: Optional[int] = 0
    total_questions: Optional[int] = 0
    status: Optional[str] = "submitted"

class SubmissionCreate(SubmissionBase):
    pass

class SubmissionOut(SubmissionBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
