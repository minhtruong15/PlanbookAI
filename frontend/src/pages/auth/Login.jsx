import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BookOpen, Lock, Mail, ArrowRight, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const response = await fetch('http://localhost:8000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password: password.trim() })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || 'Email hoặc mật khẩu không đúng');
      }
      
      sessionStorage.setItem('userRole', data.role);
      sessionStorage.setItem('accessToken', data.access_token);
      sessionStorage.setItem('fullName', data.full_name);
      sessionStorage.setItem('email', data.email);
      
      navigate(`/${data.role}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: 420, padding: 40, borderRadius: 24 }}>
        <div style={{ textAlign: 'center', marginBottom: 30 }}>
          <div style={{ width: 60, height: 60, background: 'var(--primary-light)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <BookOpen color="var(--primary)" size={32} />
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-main)' }}>PlanbookAI</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: 8 }}>Cổng công cụ AI Dành cho Giáo viên</p>
        </div>

        {error && <div style={{ background: '#fee2e2', color: '#ef4444', padding: '10px 14px', borderRadius: 8, marginBottom: 20, fontSize: '0.9rem' }}>{error}</div>}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <label style={{ display: 'block', marginBottom: 8, fontSize: '0.9rem', fontWeight: 500 }}>Email đăng nhập</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} color="var(--text-muted)" style={{ position: 'absolute', left: 14, top: 13 }} />
              <input 
                type="email" 
                required
                placeholder="VD: gv@truong.edu.vn" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: '100%', padding: '12px 16px 12px 40px', borderRadius: 12, border: '1px solid var(--border-color)', outline: 'none' }} 
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 8, fontSize: '0.9rem', fontWeight: 500 }}>Mật khẩu</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} color="var(--text-muted)" style={{ position: 'absolute', left: 14, top: 13 }} />
              <input 
                type={showPassword ? "text" : "password"} 
                required
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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

          <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '14px', borderRadius: 12, marginTop: 10, opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Đang xác thực...' : <>Đăng nhập hệ thống <ArrowRight size={18} /></>}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 20, fontSize: '0.9rem' }}>
          Chưa có tài khoản? <Link to="/register" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 500 }}>Tạo tài khoản mới</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
