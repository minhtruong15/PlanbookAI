import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, LogOut } from 'lucide-react';
import UserProfileModal from './UserProfileModal';

const Header = ({ title }) => {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isVip, setIsVip] = useState(false);
  const dropdownRef = useRef(null);

  // Lấy dữ liệu cá nhân từ sessionStorage
  const fullName = sessionStorage.getItem('fullName') || 'Người dùng';
  const role = sessionStorage.getItem('userRole') || 'teacher';
  const email = sessionStorage.getItem('email') || 'user@planbook.ai';
  
  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    
    // Check VIP status
    const checkVipStatus = async () => {
      if (role !== 'teacher') return;
      try {
        const res = await fetch('http://localhost:8000/api/package/subscriptions/my', {
          headers: { 'Authorization': `Bearer ${sessionStorage.getItem('accessToken')}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.has_subscription && data.packages) {
            const hasVip = data.packages.some(p => {
              const name = (p.package_name || '').toLowerCase();
              return name.includes('ai') || name.includes('vip') || name.includes('vàng');
            });
            setIsVip(hasVip);
          }
        }
      } catch (e) {}
    };
    checkVipStatus();

    window.addEventListener('subscription_updated', checkVipStatus);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener('subscription_updated', checkVipStatus);
    };
  }, []);

  const handleLogout = () => {
    sessionStorage.clear();
    navigate('/login');
  };

  const getAvatarInitials = (name) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) return parts[0][0] + parts[parts.length-1][0];
    return name[0];
  };

  return (
    <>
      <header className="top-header">
        <div style={{ fontWeight: 'bold', color: 'var(--text-muted)' }}>{title}</div>
        
        <div className="header-actions">
          {/* User Profile - Chỉ giữ lại Avatar để click */}
          <div className="user-profile" style={{ position: 'relative', cursor: 'pointer', padding: '4px' }} ref={dropdownRef} onClick={() => setShowDropdown(!showDropdown)}>
            <div style={{ position: 'relative' }}>
              <div className="avatar" title={fullName} style={{ 
                background: role === 'admin' ? '#fca5a5' : role === 'manager' ? '#bfdbfe' : role === 'staff' ? '#a7f3d0' : (isVip ? 'linear-gradient(135deg, #f59e0b, #ea580c)' : 'var(--primary-light)'),
                color: role === 'admin' ? '#991b1b' : role === 'manager' ? '#1e40af' : role === 'staff' ? '#065f46' : (isVip ? 'white' : 'var(--primary)'),
                width: 42, height: 42, fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%',
                boxShadow: isVip ? '0 0 15px rgba(245, 158, 11, 0.5)' : '0 4px 10px rgba(0,0,0,0.05)',
                border: isVip ? '2px solid #fff' : 'none',
                fontWeight: 'bold'
              }}>
                {getAvatarInitials(fullName).toUpperCase()}
              </div>
              {isVip && (
                <div style={{ position: 'absolute', top: -6, right: -8, background: '#f59e0b', color: 'white', fontSize: '0.65rem', padding: '2px 6px', borderRadius: 10, fontWeight: 900, border: '2px solid white', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                  VIP
                </div>
              )}
            </div>

            {/* Dropdown Menu */}
            {showDropdown && (
              <div style={{
                position: 'absolute',
                top: '120%',
                right: 0,
                backgroundColor: 'white',
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                borderRadius: 16,
                padding: '8px 0',
                minWidth: 220,
                zIndex: 100,
                border: '1px solid var(--border-color)',
                overflow: 'hidden'
              }}>
                <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border-color)', marginBottom: 8, background: 'var(--bg-secondary)' }}>
                  <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{fullName}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>{email}</div>
                  {isVip && (
                    <div style={{ marginTop: 8, display: 'inline-block', background: 'linear-gradient(135deg, #f59e0b, #ea580c)', color: 'white', fontSize: '0.75rem', fontWeight: 700, padding: '4px 10px', borderRadius: 12, boxShadow: '0 2px 4px rgba(245, 158, 11, 0.3)' }}>
                      👑 Bạn là Thành viên VIP
                    </div>
                  )}
                </div>
                
                <button 
                  className="dropdown-item" 
                  onClick={() => { setShowDropdown(false); setShowProfileModal(true); }} 
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', color: 'var(--text-main)', fontSize: '0.95rem' }}
                >
                  <User size={18} color="var(--primary)" />
                  <span>Hồ sơ cá nhân</span>
                </button>
                
                <button 
                  className="dropdown-item" 
                  onClick={handleLogout} 
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', color: '#ef4444', fontSize: '0.95rem' }}
                >
                  <LogOut size={18} />
                  <span>Đăng xuất khỏi hệ thống</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Profile Modal */}
      <UserProfileModal 
        isOpen={showProfileModal} 
        onClose={() => setShowProfileModal(false)} 
        user={{ fullName, role, email, isVip }} 
      />
    </>
  );
};

export default Header;
