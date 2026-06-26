import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, User, ArrowRight, ShieldCheck, Eye, EyeOff } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    role: 'teacher' // Cố định role là teacher
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const payload = {
        ...formData,
        email: formData.email.trim(),
        password: formData.password.trim()
      };

      const response = await fetch('http://localhost:8000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || 'Có lỗi xảy ra khi đăng ký');
      }
      
      alert('Đăng ký tài khoản thành công! Vui lòng đăng nhập để tiếp tục.');
      navigate('/login');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', padding: 20 }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: 450, padding: 40, borderRadius: 24 }}>
        <div style={{ textAlign: 'center', marginBottom: 30 }}>
          <div style={{ width: 60, height: 60, background: 'var(--primary-light)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <ShieldCheck color="var(--primary)" size={32} />
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-main)' }}>Đăng ký Giáo viên</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: 8 }}>Trở thành thành viên của PlanbookAI</p>
        </div>

        {error && <div style={{ background: '#fee2e2', color: '#ef4444', padding: '10px 14px', borderRadius: 8, marginBottom: 20, fontSize: '0.9rem' }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', marginBottom: 6, fontSize: '0.9rem', fontWeight: 500 }}>Họ và tên</label>
            <div style={{ position: 'relative' }}>
              <User size={18} color="var(--text-muted)" style={{ position: 'absolute', left: 14, top: 13 }} />
              <input 
                type="text" 
                required
                placeholder="VD: Nguyễn Văn A" 
                value={formData.full_name}
                onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                style={{ width: '100%', padding: '12px 16px 12px 40px', borderRadius: 12, border: '1px solid var(--border-color)', outline: 'none' }} 
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 6, fontSize: '0.9rem', fontWeight: 500 }}>Email</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} color="var(--text-muted)" style={{ position: 'absolute', left: 14, top: 13 }} />
              <input 
                type="email" 
                required
                placeholder="email@truonghoc.edu.vn" 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                style={{ width: '100%', padding: '12px 16px 12px 40px', borderRadius: 12, border: '1px solid var(--border-color)', outline: 'none' }} 
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 6, fontSize: '0.9rem', fontWeight: 500 }}>Mật khẩu</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} color="var(--text-muted)" style={{ position: 'absolute', left: 14, top: 13 }} />
              <input 
                type={showPassword ? "text" : "password"} 
                required
                placeholder="••••••••" 
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                style={{ width: '100%', padding: '12px 40px', borderRadius: 12, border: '1px solid var(--border-color)', outline: 'none' }} 
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: 14, top: 13, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                {showPassword ? <EyeOff size={18} color="var(--text-muted)" /> : <Eye size={18} color="var(--text-muted)" />}
              </button>
            </div>
          </div>

          {/* Chức năng chọn Role đã bị loại bỏ vì lý do bảo mật. Mọi tài khoản tạo từ đây mặc định là Teacher */}

          <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '14px', borderRadius: 12, marginTop: 10, opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Đang tạo tài khoản...' : <><ArrowRight size={18} /> Hoàn tất đăng ký</>}
          </button>
        </form>
        
        <div style={{ textAlign: 'center', marginTop: 20, fontSize: '0.9rem' }}>
          Đã có tài khoản? <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 500 }}>Đăng nhập ngay</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
