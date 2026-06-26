from fastapi import FastAPI, Depends, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import engine, Base, get_db
import models, schemas
import jwt
import datetime
from typing import List

import time

# Chờ MySQL khởi động (Wait-for-it pattern)
max_retries = 10
for i in range(max_retries):
    try:
        models.Base.metadata.create_all(bind=engine)
        print("Database connected successfully!")
        break
    except Exception as e:
        print(f"Database not ready, retrying in 5 seconds... ({i+1}/{max_retries})")
        time.sleep(5)

app = FastAPI(title="Package Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

@app.get("/health")
def health_check(): 
    return {"status": "healthy", "service": "package-service"}

# --- PACKAGES (Quản lý bởi Manager) ---
@app.post("/packages", response_model=schemas.SubscriptionPackageOut)
def create_package(package: schemas.SubscriptionPackageCreate, db: Session = Depends(get_db), user: dict = Depends(get_current_user_data)):
    if user["role"] != "manager" and user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    new_pkg = models.SubscriptionPackage(
        name=package.name,
        description=package.description,
        price=package.price,
        duration_days=package.duration_days,
        features=package.features,
        is_active=package.is_active
    )
    db.add(new_pkg)
    db.commit()
    db.refresh(new_pkg)
    return new_pkg

@app.get("/packages", response_model=List[schemas.SubscriptionPackageOut])
def get_packages(db: Session = Depends(get_db)):
    # Ai cũng xem được gói
    return db.query(models.SubscriptionPackage).filter(models.SubscriptionPackage.is_active == True).all()

@app.put("/packages/{pkg_id}", response_model=schemas.SubscriptionPackageOut)
def update_package(pkg_id: int, updates: dict, db: Session = Depends(get_db), user: dict = Depends(get_current_user_data)):
    if user["role"] != "manager" and user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    pkg = db.query(models.SubscriptionPackage).filter(models.SubscriptionPackage.id == pkg_id).first()
    if not pkg:
        raise HTTPException(status_code=404, detail="Package not found")
        
    for key, value in updates.items():
        setattr(pkg, key, value)
        
    db.commit()
    db.refresh(pkg)
    return pkg

@app.delete("/packages/{pkg_id}")
def delete_package(pkg_id: int, db: Session = Depends(get_db), user: dict = Depends(get_current_user_data)):
    if user["role"] != "manager" and user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    pkg = db.query(models.SubscriptionPackage).filter(models.SubscriptionPackage.id == pkg_id).first()
    if not pkg:
        raise HTTPException(status_code=404, detail="Package not found")
        
    pkg.is_active = False # Soft delete
    db.commit()
    return {"message": "Package deleted (deactivated)"}

# --- SUBSCRIPTIONS (Teacher Mua gói) ---
@app.post("/subscriptions/buy")
def buy_subscription(req: schemas.UserSubscriptionCreate, db: Session = Depends(get_db), user: dict = Depends(get_current_user_data)):
    pkg = db.query(models.SubscriptionPackage).filter(models.SubscriptionPackage.id == req.package_id, models.SubscriptionPackage.is_active == True).first()
    if not pkg:
        raise HTTPException(status_code=404, detail="Package not found")
        
    # Mô phỏng thanh toán thành công
    # Lấy gói đang hoạt động CÙNG LOẠI (same package_id) của người dùng mà có ngày hết hạn muộn nhất (LATEST end_date)
    existing_sub = db.query(models.UserSubscription).filter(
        models.UserSubscription.user_id == user["id"],
        models.UserSubscription.package_id == req.package_id,
        models.UserSubscription.end_date > datetime.datetime.utcnow(),
        models.UserSubscription.status == "active"
    ).order_by(models.UserSubscription.end_date.desc()).first()
    
    start_time = datetime.datetime.utcnow()
    # Nếu đang có gói, ngày bắt đầu của gói mới sẽ nối tiếp ngày hết hạn muộn nhất hiện tại
    if existing_sub:
        start_time = existing_sub.end_date
        
    duration = pkg.duration_days if pkg.duration_days else 30
    end_time = start_time + datetime.timedelta(days=duration)
    
    new_sub = models.UserSubscription(
        user_id=user["id"],
        package_id=pkg.id,
        start_date=start_time,
        end_date=end_time,
        status="active"
    )
    db.add(new_sub)
    db.commit()
    db.refresh(new_sub)
    return {"message": "Mua gói thành công", "subscription_id": new_sub.id, "end_date": new_sub.end_date}

@app.get("/subscriptions/my")
def get_my_subscription(db: Session = Depends(get_db), user: dict = Depends(get_current_user_data)):
    # Trả về tất cả các gói ĐANG ACTIVE
    subs = db.query(models.UserSubscription).filter(
        models.UserSubscription.user_id == user["id"],
        models.UserSubscription.end_date > datetime.datetime.utcnow(),
        models.UserSubscription.status == "active"
    ).all()
    
    if not subs:
        return {"has_subscription": False, "packages": []}
        
    # Gộp các subscription trùng package_id lại thành 1 dòng hiển thị cộng dồn thời gian để tinh giản UI
    package_subs = {}
    for sub in subs:
        pkg = db.query(models.SubscriptionPackage).filter(models.SubscriptionPackage.id == sub.package_id).first()
        if pkg:
            pkg_id = sub.package_id
            if pkg_id not in package_subs:
                package_subs[pkg_id] = {
                    "subscription_id": sub.id,
                    "start_date": sub.start_date,
                    "end_date": sub.end_date,
                    "package_name": pkg.name,
                    "features": pkg.features if pkg.features else "",
                    "description": pkg.description if pkg.description else ""
                }
            else:
                # Gộp lại: Lấy ngày bắt đầu sớm nhất và ngày kết thúc muộn nhất
                if sub.start_date < package_subs[pkg_id]["start_date"]:
                    package_subs[pkg_id]["start_date"] = sub.start_date
                if sub.end_date > package_subs[pkg_id]["end_date"]:
                    package_subs[pkg_id]["end_date"] = sub.end_date
                    
    packages_info = list(package_subs.values())
    
    return {
        "has_subscription": len(packages_info) > 0,
        "packages": packages_info
    }

@app.get("/subscriptions/all")
def get_all_subscriptions(db: Session = Depends(get_db), user: dict = Depends(get_current_user_data)):
    if user["role"] not in ["manager", "admin"]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
        
    subs = db.query(models.UserSubscription).order_by(models.UserSubscription.start_date.desc()).all()
    
    result = []
    for sub in subs:
        pkg = db.query(models.SubscriptionPackage).filter(models.SubscriptionPackage.id == sub.package_id).first()
        result.append({
            "id": sub.id,
            "user_id": sub.user_id,
            "package_name": pkg.name if pkg else "Gói đã xóa",
            "price": pkg.price if pkg else 0,
            "start_date": sub.start_date,
            "end_date": sub.end_date,
            "status": sub.status,
            "created_at": sub.start_date
        })
        
    return result

@app.put("/subscriptions/{sub_id}")
def update_subscription(sub_id: int, updates: dict, db: Session = Depends(get_db), user: dict = Depends(get_current_user_data)):
    if user["role"] not in ["manager", "admin"]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
        
    sub = db.query(models.UserSubscription).filter(models.UserSubscription.id == sub_id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Subscription not found")
        
    if "status" in updates:
        sub.status = updates["status"]
    if "end_date" in updates:
        try:
            # Chấp nhận định dạng YYYY-MM-DD hoặc ISO
            date_str = updates["end_date"].split("T")[0]
            sub.end_date = datetime.datetime.strptime(date_str, "%Y-%m-%d")
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
            
    db.commit()
    db.refresh(sub)
    return {"message": "Cập nhật đơn hàng thành công!", "id": sub.id}
