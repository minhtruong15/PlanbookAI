import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Package, ShoppingCart, CheckSquare, Briefcase, LayoutDashboard } from 'lucide-react';
import Header from '../components/Header';

const ManagerLayout = () => {
  const navItems = [
    { path: '/manager/dashboard', icon: <LayoutDashboard size={20} />, label: 'Tổng quan' },
    { path: '/manager/packages', icon: <Package size={20} />, label: 'Quản lý Gói dịch vụ' },
    { path: '/manager/orders', icon: <ShoppingCart size={20} />, label: 'Đơn hàng & Đăng ký' },
    { path: '/manager/approvals', icon: <CheckSquare size={20} />, label: 'Duyệt Nội dung' },
  ];

  return (
    <div className="app-layout">
      <aside className="sidebar" style={{ background: 'linear-gradient(180deg, #1e3a8a 0%, #1e40af 100%)' }}>
        <div className="sidebar-logo">
          <Briefcase color="#93c5fd" size={28} />
          <span>Manager Portal</span>
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
        <Header title="Quản lý Kinh doanh & Vận hành" />
        <main><Outlet /></main>
      </div>
    </div>
  );
};

export default ManagerLayout;
