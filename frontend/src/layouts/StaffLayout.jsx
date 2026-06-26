import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { BookTemplate, HelpCircle, MessageSquare, GraduationCap } from 'lucide-react';
import Header from '../components/Header';

const StaffLayout = () => {
    const navItems = [
    { path: '/staff/dashboard', icon: <GraduationCap size={20} />, label: 'Tổng quan' },
    { path: '/staff/templates', icon: <BookTemplate size={20} />, label: 'Giáo án Mẫu' },
    { path: '/staff/questions', icon: <HelpCircle size={20} />, label: 'Ngân hàng Câu hỏi' },
    { path: '/staff/prompts', icon: <MessageSquare size={20} />, label: 'Quản lý Prompt AI' },
  ];

  return (
    <div className="app-layout">
      <aside className="sidebar" style={{ background: 'linear-gradient(180deg, #064e3b 0%, #065f46 100%)' }}>
        <div className="sidebar-logo">
          <GraduationCap color="#6ee7b7" size={28} />
          <span>Staff Portal</span>
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
        <Header title="Sáng tạo Nội dung & Ngân hàng dữ liệu" />
        <main><Outlet /></main>
      </div>
    </div>
  );
};

export default StaffLayout;
