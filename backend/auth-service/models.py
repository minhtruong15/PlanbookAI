from sqlalchemy import Column, Integer, String, Enum, Text, DateTime
from database import Base
import enum
import datetime

class UserRole(str, enum.Enum):
    admin = "admin"
    manager = "manager"
    staff = "staff"
    teacher = "teacher"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(100))
    email = Column(String(100), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), default=UserRole.teacher)

class SystemConfig(Base):
    __tablename__ = "system_configs"

    id = Column(Integer, primary_key=True, index=True)
    key = Column(String(100), unique=True, index=True, nullable=False)
    value = Column(Text, nullable=False)
    description = Column(String(255), nullable=True)
    category = Column(String(50), nullable=True)

class SystemLog(Base):
    __tablename__ = "system_logs"

    id = Column(Integer, primary_key=True, index=True)
    action = Column(String(255), nullable=False)
    user = Column(String(100), nullable=False)
    status = Column(String(50), default="success") # 'success' | 'warning' | 'error'
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


