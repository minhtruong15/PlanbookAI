import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Users, Settings, BookOpen, DollarSign, ShieldAlert, LayoutDashboard } from 'lucide-react';
import Header from '../components/Header';

const AdminLayout = () => {
  const navItems = [
    { path: '/admin/dashboard', icon: <LayoutDashboard size={20} />, label: 'Tổng quan' },
    { path: '/admin/users', icon: <Users size={20} />, label: 'Quản lý Người dùng' },
    { path: '/admin/config', icon: <Settings size={20} />, label: 'Cấu hình Hệ thống' },
    { path: '/admin/templates', icon: <BookOpen size={20} />, label: 'Khung chương trình' },
    { path: '/admin/revenue', icon: <DollarSign size={20} />, label: 'Doanh thu & Gói' },
  ];

  return (
    <div className="app-layout">
      <aside className="sidebar" style={{ background: 'linear-gradient(180deg, #7f1d1d 0%, #991b1b 100%)' }}>
        <div className="sidebar-logo">
          <ShieldAlert color="#fca5a5" size={28} />
          <span>Admin Portal</span>
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
        <Header title="Khu vực Dành riêng cho Quản trị viên cấp cao" />
        <main><Outlet /></main>
      </div>
    </div>
  );
};

export default AdminLayout;
