from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean
from database import Base
import datetime

class Lesson(Base):
    __tablename__ = "lessons"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), index=True)
    subject = Column(String(100))
    grade = Column(String(50))
    content = Column(Text)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    owner_id = Column(Integer, index=True)

class LessonTemplate(Base):
    __tablename__ = "lesson_templates"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), index=True)
    subject = Column(String(100))
    grade = Column(String(50))
    content = Column(Text)
    author = Column(String(100), default="Staff Admin")
    status = Column(String(50), default="Bản nháp") # Bản nháp, Chờ duyệt, Đã duyệt
    owner_id = Column(Integer, index=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
