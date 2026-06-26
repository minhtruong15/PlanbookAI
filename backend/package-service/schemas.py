from pydantic import BaseModel
from typing import Optional, List
import datetime

class SubscriptionPackageBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: float = 0.0
    duration_days: int = 30
    features: Optional[str] = None
    is_active: bool = True

class SubscriptionPackageCreate(SubscriptionPackageBase):
    pass

class SubscriptionPackageOut(SubscriptionPackageBase):
    id: int
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class UserSubscriptionCreate(BaseModel):
    package_id: int

class UserSubscriptionOut(BaseModel):
    id: int
    user_id: int
    package_id: int
    start_date: datetime.datetime
    end_date: Optional[datetime.datetime]
    status: str
    package: Optional[SubscriptionPackageOut] = None

    class Config:
        from_attributes = True
