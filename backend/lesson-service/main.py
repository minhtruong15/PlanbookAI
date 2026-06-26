from fastapi import FastAPI, Depends, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import engine, Base, get_db
import models, schemas
import jwt

import time

# Chờ MySQL khởi động (Wait-for-it pattern) để tránh crash loop
max_retries = 10
for i in range(max_retries):
    try:
        models.Base.metadata.create_all(bind=engine)
        print("Database connected successfully!")
        break
    except Exception as e:
        print(f"Database not ready, retrying in 5 seconds... ({i+1}/{max_retries})")
        time.sleep(5)

app = FastAPI(title="Lesson Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SECRET_KEY = "supersecretkey" # Nên lấy từ ENV, nhưng hardcode tạm giống auth-service
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

def get_current_user_id(user_data: dict = Depends(get_current_user_data)):
    return user_data["id"]

@app.get("/health")
def health_check(): 
    return {"status": "healthy", "service": "lesson-service"}

@app.post("/lessons", response_model=schemas.LessonOut)
def create_lesson(lesson: schemas.LessonCreate, db: Session = Depends(get_db), owner_id: int = Depends(get_current_user_id)):
    new_lesson = models.Lesson(
        title=lesson.title,
        subject=lesson.subject,
        grade=lesson.grade,
        content=lesson.content,
        owner_id=owner_id
    )
    db.add(new_lesson)
    db.commit()
    db.refresh(new_lesson)
    return new_lesson

@app.get("/lessons", response_model=list[schemas.LessonOut])
def get_lessons(db: Session = Depends(get_db), owner_id: int = Depends(get_current_user_id)):
    lessons = db.query(models.Lesson).filter(models.Lesson.owner_id == owner_id).all()
    return lessons

@app.delete("/lessons/{lesson_id}")
def delete_lesson(lesson_id: int, db: Session = Depends(get_db), owner_id: int = Depends(get_current_user_id)):
    lesson = db.query(models.Lesson).filter(models.Lesson.id == lesson_id, models.Lesson.owner_id == owner_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    db.delete(lesson)
    db.commit()
    return {"message": "Deleted successfully"}

# --- LESSON TEMPLATES (STAFF) ---
@app.post("/templates", response_model=schemas.LessonTemplateOut)
def create_template(template: schemas.LessonTemplateCreate, db: Session = Depends(get_db), user: dict = Depends(get_current_user_data)):
    new_template = models.LessonTemplate(
        title=template.title,
        subject=template.subject,
        grade=template.grade,
        content=template.content,
        owner_id=user["id"]
    )
    db.add(new_template)
    db.commit()
    db.refresh(new_template)
    return new_template

@app.get("/templates", response_model=list[schemas.LessonTemplateOut])
def get_templates(db: Session = Depends(get_db), user: dict = Depends(get_current_user_data)):
    if user["role"] == "staff":
        templates = db.query(models.LessonTemplate).filter(models.LessonTemplate.owner_id == user["id"]).order_by(models.LessonTemplate.created_at.desc()).all()
    elif user["role"] == "teacher":
        from sqlalchemy import text
        has_sub = db.execute(text("SELECT id FROM user_subscriptions WHERE user_id = :uid AND end_date > NOW() AND status = 'active'"), {"uid": user["id"]}).fetchone()
        if not has_sub:
            raise HTTPException(status_code=403, detail="Vui lòng nâng cấp Gói dịch vụ để sử dụng tính năng này.")
        templates = db.query(models.LessonTemplate).filter(models.LessonTemplate.status == "Đã duyệt").order_by(models.LessonTemplate.created_at.desc()).all()
    else:
        # manager/admin thấy tất cả (để duyệt)
        templates = db.query(models.LessonTemplate).order_by(models.LessonTemplate.created_at.desc()).all()
    return templates

@app.put("/templates/{template_id}")
def update_template(template_id: int, updates: dict, db: Session = Depends(get_db)):
    template = db.query(models.LessonTemplate).filter(models.LessonTemplate.id == template_id).first()
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    
    if "title" in updates: template.title = updates["title"]
    if "subject" in updates: template.subject = updates["subject"]
    if "grade" in updates: template.grade = updates["grade"]
    if "content" in updates: template.content = updates["content"]
    if "status" in updates: template.status = updates["status"]
    
    db.commit()
    db.refresh(template)
    return template

@app.delete("/templates/{template_id}")
def delete_template(template_id: int, db: Session = Depends(get_db)):
    template = db.query(models.LessonTemplate).filter(models.LessonTemplate.id == template_id).first()
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    db.delete(template)
    db.commit()
    return {"message": "Deleted successfully"}
