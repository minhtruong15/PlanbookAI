# Hệ thống PlanbookAI - Nền tảng Hỗ trợ Giáo viên Soạn Giáo án, Tạo Đề thi & Chấm điểm Tự động bằng AI

Ứng dụng **Trí tuệ nhân tạo (Generative AI & OCR)** kết hợp **kiến trúc Microservices**, **Nginx API Gateway** và **giao diện đa phân quyền React.js**.

---

## Giới thiệu dự án

**PlanbookAI** là nền tảng công nghệ giáo dục (EdTech) toàn diện giúp tự động hóa quy trình giảng dạy của giáo viên và quản lý vận hành tại nhà trường/trung tâm giáo dục:
- Hỗ trợ giáo viên **khởi tạo giáo án thông minh (Lesson Planner)**, **tạo đề thi tự động (Exam Creator)** từ ngân hàng câu hỏi và **chấm phiếu trả lời bằng nhận diện ảnh (OCR Grading)**.
- Hỗ trợ học sinh **làm bài thi trực tuyến (Student Online Exam)** và thống kê năng lực học tập.
- Cung cấp hệ thống quản trị đa cấp độ cho **5 nhóm người dùng**: **Admin**, **Manager**, **Staff**, **Teacher** và **Student**.

---

## Cấu trúc thư mục tổng thể

| Thư mục / Tệp | Công nghệ | Mô tả chức năng |
|---|---|---|
| `frontend/` | React.js / Vite, CSS3 | Giao diện người dùng đa phân quyền (Admin, Manager, Staff, Teacher, Student), kết nối API qua cổng `5173` |
| `backend/api-gateway/` | Nginx (Reverse Proxy) | Cổng điều phối API tập trung (Port `8000`), định tuyến request từ Frontend tới từng Microservice nội bộ |
| `backend/auth-service/` | Python / FastAPI, JWT | Xác thực người dùng (Đăng ký, Đăng nhập), cấp phát JWT Token và phân quyền truy cập (RBAC) |
| `backend/lesson-service/` | Python / FastAPI, SQLAlchemy | Nghiệp vụ quản lý giáo án, mẫu khung chương trình học (Lesson Template) và hỗ trợ soạn bài bằng AI |
| `backend/exam-service/` | Python / FastAPI, SQLAlchemy | Nghiệp vụ tạo đề thi, quản lý ca thi, nhận bài nộp của học sinh và chấm điểm tự động |
| `backend/question-service/` | Python / FastAPI, SQLAlchemy | Quản lý ngân hàng câu hỏi (Question Bank) phân loại theo môn học, chủ đề và mức độ khó |
| `backend/package-service/` | Python / FastAPI, SQLAlchemy | Quản lý các gói dịch vụ (Subscription Packages), theo dõi đơn hàng và doanh thu hệ thống |
| `backend/ocr-service/` | Python / FastAPI | Dịch vụ xử lý hình ảnh và nhận diện ký tự quang học (OCR) phục vụ chấm bài thi tự động |
| `backend/user-service/` | Python / FastAPI | Quản lý thông tin hồ sơ tài khoản người dùng trên toàn hệ thống |
| `backend/discovery-service/` | Python / FastAPI | Dịch vụ kiểm tra trạng thái hoạt động (Health Check & Service Discovery) của các Microservices |
| `docker-compose.yml` | Docker Compose, MySQL 8.0, RabbitMQ | Đóng gói và khởi chạy đồng bộ toàn bộ 12 containers (Frontend, Gateway, 8 Services, MySQL, RabbitMQ) |

---

## Chi tiết cấu trúc Frontend (`frontend/src/`)

Giao diện Frontend được thiết kế theo kiến trúc phân tách rõ ràng giữa **Layouts** (khung giao diện theo quyền) và **Pages** (trang chức năng):

### 1. Khung bố cục (`src/layouts/` & `src/components/`)
- `Header.jsx` & `UserProfileModal.jsx`: Thanh điều hướng chung và cửa sổ cập nhật hồ sơ cá nhân.
- `AdminLayout.jsx`, `ManagerLayout.jsx`, `StaffLayout.jsx`, `TeacherLayout.jsx`: Bố cục thanh điều hướng riêng biệt cho từng vai trò.

### 2. Các phân hệ chức năng theo vai trò (`src/pages/`)

| Phân hệ | Các file Component chính | Chức năng nghiệp vụ |
|---|---|---|
| **Auth** (`pages/auth/`) | `Login.jsx`, `Register.jsx` | Đăng nhập, đăng ký tài khoản và lưu trữ trạng thái xác thực JWT |
| **Admin** (`pages/admin/`) | `AdminDashboard.jsx`, `UserManagement.jsx`, `RevenueTracking.jsx`, `SystemConfig.jsx` | Thống kê toàn hệ thống, quản lý tài khoản người dùng, theo dõi doanh thu và cấu hình tham số hệ thống |
| **Manager** (`pages/manager/`) | `ManagerDashboard.jsx`, `ContentApproval.jsx`, `PackageManagement.jsx`, `OrderTracking.jsx` | Phê duyệt nội dung học liệu/câu hỏi, thiết lập các gói cước dịch vụ và quản lý đơn đăng ký của giáo viên |
| **Staff** (`pages/staff/`) | `StaffDashboard.jsx`, `LessonTemplate.jsx`, `PromptManager.jsx`, `QuestionBankStaff.jsx` | Xây dựng khung giáo án mẫu, quản lý kịch bản câu lệnh AI (Prompt Manager) và biên tập ngân hàng câu hỏi gốc |
| **Teacher** (`pages/teacher/`) | `TeacherDashboard.jsx`, `LessonPlanner.jsx`, `ExamCreator.jsx`, `OcrGrading.jsx`, `QuestionBank.jsx`, `SubmissionManager.jsx`, `SubscriptionManager.jsx`, `StudentAnalytics.jsx` | Soạn giáo án AI, trộn đề thi, chấm bài bằng OCR, quản lý bài nộp, thống kê điểm số học sinh và mua gói dịch vụ |
| **Student** (`pages/student/`) | `StudentExam.jsx` | Giao diện làm bài kiểm tra trực tuyến, đếm ngược thời gian và nộp bài tự động |

---

## Hạ tầng Cơ sở dữ liệu & Message Broker

- **Cơ sở dữ liệu (`MySQL 8.0`):** Chạy trên container `planbookai_db` (ánh xạ cổng `3307:3306`), lưu trữ dữ liệu người dùng, ngân hàng câu hỏi, đề thi, giáo án và đơn hàng thông qua ORM **SQLAlchemy**.
- **Hàng đợi tin nhắn (`RabbitMQ 3`):** Chạy trên container `planbookai_rabbitmq` (cổng `5672` và giao diện quản trị `15672`), hỗ trợ giao tiếp bất đồng bộ giữa các dịch vụ.
- **Cổng giao tiếp (`Nginx API Gateway`):** Lắng nghe tại `http://localhost:8000`, tự động chuyển tiếp các đường dẫn `/api/...` từ React Frontend tới đúng service phụ trách.

---

## Hướng dẫn khởi chạy dự án bằng Docker

### Bước 1: Clone kho mã nguồn về máy
```bash
git clone https://github.com/minhtruong15/PlanbookAI.git
cd PlanbookAI
```

### Bước 2: Khởi tạo file cấu hình môi trường
```bash
cp .env.example .env
```

### Bước 3: Khởi chạy toàn bộ hệ thống bằng Docker Compose
```bash
docker compose up -d --build
```

### Bước 4: Truy cập các cổng dịch vụ
- **Giao diện Frontend (React/Vite):** `http://localhost:5173`
- **Cổng API Gateway (Nginx):** `http://localhost:8000`
- **RabbitMQ Management UI:** `http://localhost:15672`
- **MySQL Database:** `localhost:3307`
