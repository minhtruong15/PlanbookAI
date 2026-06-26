import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, BookOpen, FileText, ScanLine, BarChart2, GraduationCap, CheckCircle, Crown, Database } from 'lucide-react';
import Header from '../components/Header';

const TeacherLayout = () => {
  const navItems = [
    { path: '/teacher/dashboard', icon: <LayoutDashboard size={20} />, label: 'Tổng quan' },
    { path: '/teacher/lessons', icon: <BookOpen size={20} />, label: 'Giáo án Cá nhân' },
    { path: '/teacher/exams', icon: <FileText size={20} />, label: 'Đề kiểm tra' },
    { path: '/teacher/submissions', icon: <ScanLine size={20} />, label: 'Kiểm tra bài làm' },
    { path: '/teacher/ocr', icon: <CheckCircle size={20} />, label: 'Quản lý Chấm điểm' },
    { path: '/teacher/analytics', icon: <BarChart2 size={20} />, label: 'Phổ điểm lớp' },
    { path: '/teacher/questions', icon: <Database size={20} />, label: 'Ngân hàng Câu hỏi' },
    { path: '/teacher/packages', icon: <Crown size={20} />, label: 'Gói Dịch Vụ' },
  ];

  return (
    <div className="app-layout">
      <aside className="sidebar shadow-lg">
        <div className="sidebar-logo">
          <GraduationCap color="white" size={32} strokeWidth={2.5} />
          <span style={{ fontSize: '1.2rem', letterSpacing: '1px' }}>GIÁO VIÊN 4.0</span>
        </div>
        <nav className="sidebar-menu">
          {navItems.map((item) => (
            <NavLink key={item.path} to={item.path} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              {item.icon}<span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="main-content-wrapper">
        <Header title="Không gian Làm việc & Giảng dạy" />
        <main><Outlet /></main>
      </div>
    </div>
  );
};

export default TeacherLayout;
