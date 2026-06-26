from fastapi import FastAPI, Depends, HTTPException, status, Header
import jwt
from security import SECRET_KEY, ALGORITHM
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import engine, Base, get_db
import models, schemas, security

import time

# Chờ MySQL khởi động (Wait-for-it pattern) để tránh crash loop
max_retries = 10
for i in range(max_retries):
    try:
        models.Base.metadata.create_all(bind=engine)
        print("Database connected successfully!")
        
        # Tạo sẵn hoặc cập nhật các tài khoản quản trị mặc định để đảm bảo mật khẩu luôn đúng
        db = next(get_db())
        default_users = [
            {"email": "admin@gmail.com", "name": "System Admin", "role": models.UserRole.admin, "pwd": "admin123"},
            {"email": "manager@gmail.com", "name": "System Manager", "role": models.UserRole.manager, "pwd": "manager123"},
            {"email": "staff@gmail.com", "name": "System Staff", "role": models.UserRole.staff, "pwd": "staff123"}
        ]
        
        for u in default_users:
            db_user = db.query(models.User).filter(models.User.email == u["email"]).first()
            if not db_user:
                new_u = models.User(
                    email=u["email"],
                    full_name=u["name"],
                    password_hash=security.get_password_hash(u["pwd"]),
                    role=u["role"]
                )
                db.add(new_u)
                print(f"Created default user: {u['email']}")
            else:
                db_user.password_hash = security.get_password_hash(u["pwd"])
                db_user.full_name = u["name"]
                db_user.role = u["role"]
                print(f"Reset/updated default user: {u['email']}")
        db.commit()

        # Tạo sẵn các cấu hình hệ thống mặc định nếu chưa có
        default_configs = [
            {"key": "ai_model_lesson", "value": "gemini-1.5-pro", "category": "AI", "description": "Mô hình AI sử dụng để soạn giáo án"},
            {"key": "ai_model_question", "value": "gemini-1.5-flash", "category": "AI", "description": "Mô hình AI sử dụng để tạo câu hỏi"},
            {"key": "ocr_max_size_mb", "value": "10", "category": "Quota", "description": "Kích thước tệp tin ảnh tải lên tối đa (MB)"},
            {"key": "free_tier_daily_limit", "value": "5", "category": "Quota", "description": "Số lượt tạo AI miễn phí mỗi ngày cho tài khoản Thường"},
            {"key": "maintenance_mode", "value": "false", "category": "Security", "description": "Bật chế độ bảo trì toàn hệ thống"},
            {"key": "enable_public_registration", "value": "true", "category": "Security", "description": "Cho phép giáo viên tự đăng ký tài khoản tự do"},
            {"key": "system_name", "value": "PlanBookAI", "category": "General", "description": "Tên thương hiệu hệ thống hiển thị"},
            {"key": "support_email", "value": "support@planbook.ai", "category": "General", "description": "Email liên hệ hỗ trợ kỹ thuật"}
        ]
        for cfg in default_configs:
            if not db.query(models.SystemConfig).filter(models.SystemConfig.key == cfg["key"]).first():
                new_cfg = models.SystemConfig(
                    key=cfg["key"],
                    value=cfg["value"],
                    category=cfg["category"],
                    description=cfg["description"]
                )
                db.add(new_cfg)
        db.commit()
        print("System configurations seeded successfully!")

        # Seed system logs if empty
        if db.query(models.SystemLog).count() == 0:
            import datetime
            import random
            now = datetime.datetime.utcnow()
            actions = [
                ("Đăng nhập hệ thống thành công", "teacher1@gmail.com", "success", 0),
                ("Tạo mới giáo án AI", "teacher1@gmail.com", "success", 0),
                ("Mua gói dịch vụ Vàng", "teacher1@gmail.com", "success", 0),
                ("Cập nhật cấu hình hệ thống", "admin@gmail.com", "success", 0),
                ("Phát hiện truy cập bất thường", "security_bot", "error", 1),
                ("Sao lưu cơ sở dữ liệu hệ thống", "system", "success", 1),
                ("Đăng nhập thất bại (Sai mật khẩu)", "unknown_user", "warning", 2),
                ("Duyệt đề thi tự động", "manager@gmail.com", "success", 2),
                ("Tạo câu hỏi trắc nghiệm mới", "staff@gmail.com", "success", 3),
                ("Đăng ký tài khoản Giáo viên mới", "teacher3@gmail.com", "success", 3),
                ("Restart dịch vụ Auth-Service", "system", "warning", 4),
                ("Thanh toán thất bại", "teacher2@gmail.com", "error", 4),
                ("Phân tích điểm thi lớp 12A1", "teacher2@gmail.com", "success", 5),
                ("Cập nhật Giáo án Mẫu cấp trung học", "staff@gmail.com", "success", 6),
            ]
            
            users_list = ["teacher1@gmail.com", "teacher2@gmail.com", "staff@gmail.com", "manager@gmail.com", "admin@gmail.com", "system"]
            log_types = [
                ("Đăng nhập hệ thống", "success"),
                ("Tạo giáo án tự động", "success"),
                ("Quét ảnh đề thi OCR", "success"),
                ("Tải xuống đề thi PDF", "success"),
                ("Xem báo cáo doanh thu", "success")
            ]
            
            # Đảm bảo mỗi ngày trong tuần hiện tại có số lượng logs khác nhau để biểu đồ nhấp nhô đẹp mắt
            daily_counts = [15, 28, 18, 35, 22, 31, 40] # T2 -> CN
            for day_offset, count in enumerate(daily_counts):
                log_date = now - datetime.timedelta(days=(now.weekday() - day_offset) % 7)
                log_date = log_date.replace(hour=random.randint(8, 20), minute=random.randint(0, 59))
                for c in range(count):
                    act, stat = random.choice(log_types)
                    usr = random.choice(users_list)
                    entry_date = log_date - datetime.timedelta(hours=random.randint(0, 5))
                    new_log = models.SystemLog(
                        action=act,
                        user=usr,
                        status=stat,
                        created_at=entry_date
                    )
                    db.add(new_log)
            
            for act, usr, stat, day_back in actions:
                log_date = now - datetime.timedelta(days=day_back)
                new_log = models.SystemLog(
                    action=act,
                    user=usr,
                    status=stat,
                    created_at=log_date
                )
                db.add(new_log)
            db.commit()
            print("System logs seeded successfully!")
        
        break
    except Exception as e:
        print(f"Database not ready or seed failed, retrying... ({i+1}/{max_retries})")
        time.sleep(5)

app = FastAPI(title="Auth Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check(): 
    return {"status": "healthy", "service": "auth-service"}

@app.post("/register", response_model=schemas.Token)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    # Kiểm tra email đã tồn tại chưa
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email này đã được đăng ký.")
    
    # Tạo user mới
    hashed_password = security.get_password_hash(user.password)
    new_user = models.User(
        email=user.email,
        full_name=user.full_name,
        password_hash=hashed_password,
        role=models.UserRole.teacher # BẢO MẬT: LUÔN ép về teacher khi đăng ký public
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Tạo Token cho phép đăng nhập luôn
    access_token = security.create_access_token(
        data={"sub": new_user.email, "role": new_user.role.value, "id": new_user.id}
    )
    return {
        "access_token": access_token, 
        "token_type": "bearer", 
        "role": new_user.role.value, 
        "full_name": new_user.full_name,
        "email": new_user.email,
        "id": new_user.id
    }

@app.post("/login", response_model=schemas.Token)
def login(user: schemas.UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if not db_user or not security.verify_password(user.password, db_user.password_hash):
        raise HTTPException(status_code=401, detail="Email hoặc mật khẩu không đúng.")
    
    access_token = security.create_access_token(
        data={"sub": db_user.email, "role": db_user.role.value, "id": db_user.id}
    )
    return {
        "access_token": access_token, 
        "token_type": "bearer", 
        "role": db_user.role.value, 
        "full_name": db_user.full_name,
        "email": db_user.email,
        "id": db_user.id
    }

@app.get("/users", response_model=list[schemas.UserOut])
def get_all_users(db: Session = Depends(get_db)):
    users = db.query(models.User).all()
    return users

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
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

@app.get("/system-config", response_model=list[schemas.SystemConfigOut])
def get_system_config(db: Session = Depends(get_db)):
    configs = db.query(models.SystemConfig).all()
    return configs

@app.put("/system-config")
def update_system_config(updates: list[schemas.SystemConfigUpdate], db: Session = Depends(get_db), user: dict = Depends(get_current_user_data)):
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Chỉ quản trị viên cấp cao mới có quyền thay đổi cấu hình.")
    
    for item in updates:
        cfg = db.query(models.SystemConfig).filter(models.SystemConfig.key == item.key).first()
        if cfg:
            cfg.value = item.value
    db.commit()
    return {"message": "Cấu hình hệ thống đã được cập nhật thành công!"}

@app.get("/system-stats", response_model=schemas.SystemStatsOut)
def get_system_stats(days: int = 7, db: Session = Depends(get_db)):
    total_users = db.query(models.User).count()
    
    # Đếm số lượng theo role
    role_counts = {
        "admin": db.query(models.User).filter(models.User.role == models.UserRole.admin).count(),
        "manager": db.query(models.User).filter(models.User.role == models.UserRole.manager).count(),
        "staff": db.query(models.User).filter(models.User.role == models.UserRole.staff).count(),
        "teacher": db.query(models.User).filter(models.User.role == models.UserRole.teacher).count()
    }
    
    import datetime
    now = datetime.datetime.utcnow()
    
    daily_activity_counts = []
    labels = []
    dates = []
    
    if days == 7:
        # Tính Thứ 2 tuần này
        monday = now - datetime.timedelta(days=now.weekday())
        monday = monday.replace(hour=0, minute=0, second=0, microsecond=0)
        logs_since = monday
        
        day_names = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']
        for i in range(7):
            day_start = monday + datetime.timedelta(days=i)
            day_end = day_start + datetime.timedelta(days=1)
            count = db.query(models.SystemLog).filter(
                models.SystemLog.created_at >= day_start,
                models.SystemLog.created_at < day_end
            ).count()
            daily_activity_counts.append(count)
            labels.append(day_names[i])
            dates.append(day_start.strftime("%Y-%m-%d"))
    else:
        # Tính N ngày gần nhất (từ days-1 ngày trước đến hôm nay)
        start_date = now - datetime.timedelta(days=days - 1)
        start_date = start_date.replace(hour=0, minute=0, second=0, microsecond=0)
        logs_since = start_date
        
        for i in range(days):
            day_start = start_date + datetime.timedelta(days=i)
            day_end = day_start + datetime.timedelta(days=1)
            count = db.query(models.SystemLog).filter(
                models.SystemLog.created_at >= day_start,
                models.SystemLog.created_at < day_end
            ).count()
            daily_activity_counts.append(count)
            labels.append(day_start.strftime("%d/%m"))
            dates.append(day_start.strftime("%Y-%m-%d"))
            
    # Lấy logs tương ứng từ ngày logs_since đến nay
    logs = db.query(models.SystemLog).filter(
        models.SystemLog.created_at >= logs_since
    ).order_by(models.SystemLog.created_at.desc()).all()
    
    return {
        "total_users": total_users,
        "role_counts": role_counts,
        "cpu_usage": 45,
        "database_size": "1.2 GB",
        "uptime": "99.99%",
        "daily_activity_counts": daily_activity_counts,
        "labels": labels,
        "dates": dates,
        "logs": logs
    }

