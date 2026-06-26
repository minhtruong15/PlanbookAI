import React, { useState, useEffect } from 'react';
import { Search, Shield, Trash2, UserCheck, Loader, Users, AlertCircle } from 'lucide-react';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/auth/users');
      if (!response.ok) throw new Error('Không thể tải danh sách người dùng');
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // QUAN TRỌNG: Chỉ lọc hiển thị người dùng có vai trò là 'teacher' theo yêu cầu
  const teachers = users.filter(u => u.role === 'teacher');

  // Lọc theo tìm kiếm
  const filteredTeachers = teachers.filter(u => 
    u.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="page-container" style={{ padding: '24px 40px', background: '#f8fafc', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={28} color="#2563eb" />
          </div>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>Quản lý Giáo viên</h1>
            <p style={{ color: '#64748b', marginTop: 4, fontSize: '0.95rem' }}>Quản lý và hỗ trợ tất cả tài khoản Giáo viên (Teacher) đang có trên hệ thống PlanbookAI.</p>
          </div>
        </div>
      </div>

      {/* Info Stats Card */}
      <div style={{ background: 'white', borderRadius: 24, padding: '20px 24px', marginBottom: 28, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ background: '#eff6ff', padding: '10px 16px', borderRadius: 12, color: '#2563eb', fontWeight: 800, fontSize: '1.2rem' }}>
          {teachers.length}
        </div>
        <div>
          <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.95rem' }}>Tổng số Giáo viên đăng ký</div>
          <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: 2 }}>Hệ thống chỉ hiển thị duy nhất các tài khoản Giáo viên để quản lý tập trung và an toàn.</div>
        </div>
      </div>

      {/* Search and Table Area */}
      <div className="glass-panel" style={{ padding: 32, borderRadius: 28, background: 'white', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
        <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} color="#64748b" style={{ position: 'absolute', left: 16, top: 13 }} />
            <input 
              type="text" 
              placeholder="Tìm kiếm giáo viên nhanh theo họ tên hoặc email đăng nhập..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '12px 16px 12px 48px', borderRadius: 14, border: '1px solid #cbd5e1', fontSize: '0.95rem', color: '#1e293b', outline: 'none', transition: 'border 0.2s' }} 
              onFocus={e => e.target.style.borderColor = '#2563eb'}
              onBlur={e => e.target.style.borderColor = '#cbd5e1'}
            />
          </div>
        </div>

        {error && <div style={{ background: '#fee2e2', color: '#ef4444', padding: '12px 16px', borderRadius: 12, marginBottom: 20, fontWeight: 600 }}>{error}</div>}

        <div style={{ overflowX: 'auto' }}>
          {loading ? (
            <div style={{ padding: '60px 0', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <Loader className="animate-spin" size={40} color="#2563eb" />
              <div style={{ color: '#64748b', fontWeight: 500 }}>Đang đồng bộ danh sách giáo viên từ Database...</div>
            </div>
          ) : filteredTeachers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <AlertCircle size={40} />
              <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>Không tìm thấy giáo viên nào tương ứng</div>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                  <th style={{ padding: '16px 20px', color: '#475569', fontWeight: 700, fontSize: '0.9rem' }}>ID</th>
                  <th style={{ padding: '16px 20px', color: '#475569', fontWeight: 700, fontSize: '0.9rem' }}>Người dùng</th>
                  <th style={{ padding: '16px 20px', color: '#475569', fontWeight: 700, fontSize: '0.9rem' }}>Vai trò</th>
                  <th style={{ padding: '16px 20px', color: '#475569', fontWeight: 700, fontSize: '0.9rem' }}>Trạng thái DB</th>
                  <th style={{ padding: '16px 20px', color: '#475569', fontWeight: 700, fontSize: '0.9rem', textAlign: 'right' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredTeachers.map((user) => (
                  <tr key={user.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }}>
                    <td style={{ padding: '20px', fontWeight: 700, color: '#64748b' }}>#{user.id}</td>
                    <td style={{ padding: '20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#f3f4f6', color: '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1rem', border: '1px solid #cbd5e1' }}>
                          {user.full_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 750, color: '#1e293b' }}>{user.full_name}</div>
                          <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: 2 }}>{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '20px' }}>
                      <span style={{ background: '#f3f4f6', color: '#374151', padding: '6px 12px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 700, border: '1px solid #e2e8f0' }}>Teacher</span>
                    </td>
                    <td style={{ padding: '20px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#059669', fontSize: '0.9rem', fontWeight: 600 }}><UserCheck size={16} /> Đã xác thực</span>
                    </td>
                    <td style={{ padding: '20px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                        <button style={{ background: '#e0e7ff', border: 'none', padding: '10px 14px', borderRadius: 10, cursor: 'pointer', color: '#4f46e5', display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: '0.8rem' }} title="Phân quyền">
                          <Shield size={14} /> Phân quyền
                        </button>
                        <button style={{ background: '#fee2e2', border: 'none', padding: '10px 14px', borderRadius: 10, cursor: 'pointer', color: '#dc2626', display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: '0.8rem' }} title="Xóa tài khoản">
                          <Trash2 size={14} /> Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
