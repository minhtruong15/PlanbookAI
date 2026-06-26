from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text
from database import Base
import datetime

class SubscriptionPackage(Base):
    __tablename__ = "subscription_packages"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), index=True)
    description = Column(Text, nullable=True)
    price = Column(Float, default=0.0)
    duration_days = Column(Integer, default=30)
    features = Column(Text, nullable=True) # JSON array of strings
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class UserSubscription(Base):
    __tablename__ = "user_subscriptions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    package_id = Column(Integer, index=True)
    start_date = Column(DateTime, default=datetime.datetime.utcnow)
    end_date = Column(DateTime, nullable=True)
    status = Column(String(50), default="active") # active, expired
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
