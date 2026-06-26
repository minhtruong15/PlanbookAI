from fastapi import FastAPI, Depends, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import engine, get_db
import models, schemas
from typing import List
import jwt

SECRET_KEY = "supersecretkey"
ALGORITHM = "HS256"

def get_current_user_data(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    token = authorization.split(" ")[1]
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("id")
        role = payload.get("role")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token structure")
        return {"id": user_id, "role": role}
    except:
        raise HTTPException(status_code=401, detail="Invalid token")

import time

# Chờ MySQL khởi động (Wait-for-it pattern) để tránh crash loop
max_retries = 10
for i in range(max_retries):
    try:
        models.Question.__table__.drop(engine, checkfirst=True)
        models.Base.metadata.create_all(bind=engine)
        print("Database connected successfully!")
        break
    except Exception as e:
        print(f"Database not ready, retrying in 5 seconds... ({i+1}/{max_retries})")
        time.sleep(5)

app = FastAPI(title="Question Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check(): 
    return {"status": "healthy", "service": "question-service"}

@app.post("/questions", response_model=schemas.QuestionOut)
def create_question(question: schemas.QuestionCreate, db: Session = Depends(get_db), user: dict = Depends(get_current_user_data)):
    new_q = models.Question(
        content=question.content,
        subject=question.subject,
        grade=question.grade,
        level=question.level,
        options=question.options,
        correct_answer=question.correct_answer,
        explanation=question.explanation,
        owner_id=user["id"]
    )
    db.add(new_q)
    db.commit()
    db.refresh(new_q)
    return new_q

@app.get("/questions", response_model=List[schemas.QuestionOut])
def get_questions(db: Session = Depends(get_db), user: dict = Depends(get_current_user_data)):
    if user["role"] == "staff":
        return db.query(models.Question).filter(models.Question.owner_id == user["id"]).order_by(models.Question.created_at.desc()).all()
    elif user["role"] == "teacher":
        from sqlalchemy import text
        has_sub = db.execute(text("SELECT id FROM user_subscriptions WHERE user_id = :uid AND end_date > NOW() AND status = 'active'"), {"uid": user["id"]}).fetchone()
        if not has_sub:
            raise HTTPException(status_code=403, detail="Vui lòng nâng cấp Gói dịch vụ để sử dụng tính năng này.")
        return db.query(models.Question).filter(models.Question.status == "Đã duyệt").order_by(models.Question.created_at.desc()).all()
    else:
        return db.query(models.Question).order_by(models.Question.created_at.desc()).all()

@app.delete("/questions/{q_id}")
def delete_question(q_id: int, db: Session = Depends(get_db)):
    q = db.query(models.Question).filter(models.Question.id == q_id).first()
    if not q:
        raise HTTPException(status_code=404, detail="Question not found")
    db.delete(q)
    db.commit()
    return {"message": "Deleted"}

@app.put("/questions/{q_id}", response_model=schemas.QuestionOut)
def update_question(q_id: int, updates: dict, db: Session = Depends(get_db)):
    q = db.query(models.Question).filter(models.Question.id == q_id).first()
    if not q:
        raise HTTPException(status_code=404, detail="Question not found")
    
    if "content" in updates: q.content = updates["content"]
    if "subject" in updates: q.subject = updates["subject"]
    if "grade" in updates: q.grade = updates["grade"]
    if "level" in updates: q.level = updates["level"]
    if "options" in updates: q.options = updates["options"]
    if "correct_answer" in updates: q.correct_answer = updates["correct_answer"]
    if "explanation" in updates: q.explanation = updates["explanation"]
    if "status" in updates: q.status = updates["status"]
    
    db.commit()
    db.refresh(q)
    return q
