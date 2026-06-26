from sqlalchemy import Column, Integer, String, Text, DateTime, JSON
from database import Base
import datetime

class Exam(Base):
    __tablename__ = "exams"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), index=True)
    grade = Column(String(50))
    duration = Column(String(50))
    password = Column(String(100), nullable=True) # Mật khẩu mở đề
    exam_codes = Column(JSON, nullable=True) # Danh sách mã đề (101, 202, ...)
    content = Column(JSON) 
    lesson_id = Column(Integer, nullable=True) 
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    owner_id = Column(Integer, index=True)

class Submission(Base):
    __tablename__ = "submissions"

    id = Column(Integer, primary_key=True, index=True)
    exam_id = Column(Integer, index=True)
    student_name = Column(String(255))
    student_id = Column(String(50))
    exam_code = Column(String(50), nullable=True) # Mã đề học sinh chọn
    answers = Column(JSON) 
    score = Column(Integer, default=0)
    correct_count = Column(Integer, default=0)
    total_questions = Column(Integer, default=0)
    status = Column(String(50), default="submitted")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
