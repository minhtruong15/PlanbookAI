from pydantic import BaseModel, EmailStr
from models import UserRole
import datetime

class UserCreate(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    role: UserRole = UserRole.teacher

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    full_name: str
    email: str
    id: int

class UserOut(BaseModel):
    id: int
    full_name: str
    email: str
    role: str
    
    class Config:
        from_attributes = True

class SystemConfigOut(BaseModel):
    id: int
    key: str
    value: str
    description: str | None = None
    category: str | None = None

    class Config:
        from_attributes = True

class SystemConfigUpdate(BaseModel):
    key: str
    value: str

class SystemLogOut(BaseModel):
    id: int
    action: str
    user: str
    status: str
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class SystemStatsOut(BaseModel):
    total_users: int
    role_counts: dict
    cpu_usage: int
    database_size: str
    uptime: str
    daily_activity_counts: list[int]
    labels: list[str]
    dates: list[str]
    logs: list[SystemLogOut]



