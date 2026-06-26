from sqlalchemy import Column, Integer, String, Text, DateTime, JSON
from database import Base
import datetime

class Question(Base):
    __tablename__ = "system_questions"

    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text)
    subject = Column(String(100))
    grade = Column(String(50))
    level = Column(String(50))
    options = Column(Text, nullable=True) # JSON string: ["A", "B", "C", "D"]
    correct_answer = Column(String(50), nullable=True)
    explanation = Column(Text, nullable=True)
    author = Column(String(100), default="Hệ thống")
    status = Column(String(50), default="Bản nháp") # Bản nháp, Chờ duyệt, Đã duyệt
    owner_id = Column(Integer, index=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
