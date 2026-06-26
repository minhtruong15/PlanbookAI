import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';

// Layouts
import AdminLayout from './layouts/AdminLayout';
import ManagerLayout from './layouts/ManagerLayout';
import StaffLayout from './layouts/StaffLayout';
import TeacherLayout from './layouts/TeacherLayout';

// Auth
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import SystemConfig from './pages/admin/SystemConfig';
import RevenueTracking from './pages/admin/RevenueTracking';

// Manager Pages
import ManagerDashboard from './pages/manager/ManagerDashboard';
import PackageManagement from './pages/manager/PackageManagement';
import OrderTracking from './pages/manager/OrderTracking';
import ContentApproval from './pages/manager/ContentApproval';

// Staff Pages
import StaffDashboard from './pages/staff/StaffDashboard';
import LessonTemplate from './pages/staff/LessonTemplate';
import QuestionBankStaff from './pages/staff/QuestionBankStaff';
import PromptManager from './pages/staff/PromptManager';

// Teacher Pages
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import LessonPlanner from './pages/teacher/LessonPlanner';
import ExamCreator from './pages/teacher/ExamCreator';
import SubmissionManager from './pages/teacher/SubmissionManager';
import OcrGrading from './pages/teacher/OcrGrading';
import StudentAnalytics from './pages/teacher/StudentAnalytics';
import SubscriptionManager from './pages/teacher/SubscriptionManager';
import QuestionBank from './pages/teacher/QuestionBank';
import StudentExam from './pages/student/StudentExam';

// Component Bảo vệ đường dẫn (Protected Route)
const ProtectedRoute = ({ children, allowedRole }) => {
  const role = sessionStorage.getItem('userRole');
  const token = sessionStorage.getItem('accessToken');
  
  // Nếu không có token hoặc role, bắt buộc về trang login
  if (!token || !role) {
    return <Navigate to="/login" replace />;
  }
  
  // Nếu sai role, điều hướng về trang chủ của role đó
  if (role !== allowedRole) {
    return <Navigate to={`/${role}`} replace />;
  }
  
  return children;
};

// Component Cưỡng chế điều hướng về trang Đăng nhập khi vào "/"
const RootRedirect = () => {
  // Luôn luôn đẩy về login để thắt chặt bảo mật theo yêu cầu
  return <Navigate to="/login" replace />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<RootRedirect />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<ProtectedRoute allowedRole="admin"><AdminLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="config" element={<SystemConfig />} />
          <Route path="templates" element={<LessonTemplate />} />
          <Route path="revenue" element={<RevenueTracking />} />
        </Route>

        {/* Manager Routes */}
        <Route path="/manager" element={<ProtectedRoute allowedRole="manager"><ManagerLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/manager/dashboard" replace />} />
          <Route path="dashboard" element={<ManagerDashboard />} />
          <Route path="packages" element={<PackageManagement />} />
          <Route path="orders" element={<OrderTracking />} />
          <Route path="approvals" element={<ContentApproval />} />
        </Route>

        {/* Staff Routes */}
        <Route path="/staff" element={<ProtectedRoute allowedRole="staff"><StaffLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/staff/dashboard" replace />} />
          <Route path="dashboard" element={<StaffDashboard />} />
          <Route path="templates" element={<LessonTemplate />} />
          <Route path="questions" element={<QuestionBankStaff />} />
          <Route path="prompts" element={<PromptManager />} />
        </Route>

        {/* Teacher Routes */}
        <Route path="/teacher" element={<ProtectedRoute allowedRole="teacher"><TeacherLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/teacher/dashboard" replace />} />
          <Route path="dashboard" element={<TeacherDashboard />} />
          <Route path="lessons" element={<LessonPlanner />} />
          <Route path="exams" element={<ExamCreator />} />
          <Route path="submissions" element={<SubmissionManager />} />
          <Route path="ocr" element={<OcrGrading />} />
          <Route path="analytics" element={<StudentAnalytics />} />
          <Route path="packages" element={<SubscriptionManager />} />
          <Route path="questions" element={<QuestionBank />} />
        </Route>

        {/* Student Routes */}
        <Route path="/exam/:examId" element={<StudentExam />} />

        {/* Fallback 404 */}
        <Route path="*" element={<div className="page-container" style={{ textAlign: 'center', marginTop: 50 }}><h2>404 - Trang không tồn tại</h2><p><a href="/">Quay về trang chủ</a></p></div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
