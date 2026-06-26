import React from 'react';
import { X, User, Mail, Shield, Calendar, Edit3, Crown } from 'lucide-react';

const UserProfileModal = ({ isOpen, onClose, user }) => {
  if (!isOpen) return null;

  const getRoleBadge = (role) => {
    switch(role) {
      case 'admin': return <span style={{ background: '#fee2e2', color: '#991b1b', padding: '6px 12px', borderRadius: 20, fontSize: '0.85rem', fontWeight: 600 }}>Quản trị viên (Admin)</span>;
      case 'manager': return <span style={{ background: '#dbeafe', color: '#1e40af', padding: '6px 12px', borderRadius: 20, fontSize: '0.85rem', fontWeight: 600 }}>Quản lý (Manager)</span>;
      case 'staff': return <span style={{ background: '#d1fae5', color: '#065f46', padding: '6px 12px', borderRadius: 20, fontSize: '0.85rem', fontWeight: 600 }}>Chuyên viên Nội dung (Staff)</span>;
      case 'teacher': return <span style={{ background: '#f3f4f6', color: '#374151', padding: '6px 12px', borderRadius: 20, fontSize: '0.85rem', fontWeight: 600 }}>Giáo viên (Teacher)</span>;
      default: return role;
    }
  };

  const getAvatarInitials = (name) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) return parts[0][0] + parts[parts.length-1][0];
    return name[0];
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, backdropFilter: 'blur(4px)'
    }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: 450, borderRadius: 24, padding: 0, overflow: 'hidden', position: 'relative' }}>
        
        {/* Banner */}
        <div style={{ height: 120, background: 'linear-gradient(135deg, var(--primary), var(--secondary))', position: 'relative' }}>
          <button 
            onClick={onClose}
            style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Profile Content */}
        <div style={{ padding: '0 32px 32px', textAlign: 'center', marginTop: -50 }}>
          <div style={{ 
            width: 100, height: 100, borderRadius: '50%', background: 'white', margin: '0 auto 16px', padding: 4, position: 'relative'
          }}>
            <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: 700, color: 'var(--primary)' }}>
              {getAvatarInitials(user.fullName).toUpperCase()}
            </div>
            <button style={{ position: 'absolute', bottom: 0, right: 0, background: 'white', border: '1px solid var(--border-color)', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)' }}>
              <Edit3 size={16} />
            </button>
          </div>

          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: user.isVip ? 4 : 8 }}>{user.fullName}</h2>
          
          {user.isVip && (
            <div style={{ marginBottom: 16, color: '#ea580c', fontSize: '0.9rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <Crown size={18} fill="currentColor" /> Bạn là Thành viên VIP
            </div>
          )}

          <div style={{ marginBottom: 24 }}>
            {getRoleBadge(user.role)}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, textAlign: 'left', background: 'var(--bg-secondary)', padding: 20, borderRadius: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User color="var(--text-muted)" size={20} />
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>Họ và tên</div>
                <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{user.fullName}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Mail color="var(--text-muted)" size={20} />
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>Email liên hệ</div>
                <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{user.email}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Shield color="var(--text-muted)" size={20} />
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>Quyền hạn truy cập</div>
                <div style={{ fontWeight: 600, color: 'var(--text-main)', textTransform: 'capitalize' }}>{user.role} System Access</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Calendar color="var(--text-muted)" size={20} />
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>Ngày tham gia</div>
                <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>Hôm nay</div>
              </div>
            </div>
          </div>
          
          <button className="btn-primary" onClick={onClose} style={{ width: '100%', padding: '14px', borderRadius: 12, marginTop: 24, fontWeight: 600 }}>
            Đóng cửa sổ
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfileModal;
