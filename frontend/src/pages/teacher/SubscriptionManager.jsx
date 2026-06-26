import React, { useState, useEffect } from 'react';
import { Crown, CheckCircle2, Zap, Calendar, ShieldCheck, Sparkles, Check, Loader } from 'lucide-react';

const SubscriptionManager = () => {
  const [packages, setPackages] = useState([]);
  const [currentSubs, setCurrentSubs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Lấy gói đang bán
      const resPkg = await fetch('http://localhost:8000/api/package/packages', {
        headers: { 'Authorization': `Bearer ${sessionStorage.getItem('accessToken')}` }
      });
      if (resPkg.ok) setPackages(await resPkg.json());

      // Lấy trạng thái đăng ký của user hiện tại
      const resSub = await fetch('http://localhost:8000/api/package/subscriptions/my', {
        headers: { 'Authorization': `Bearer ${sessionStorage.getItem('accessToken')}` }
      });
      if (resSub.ok) {
        const data = await resSub.json();
        if (data.has_subscription && data.packages) {
          setCurrentSubs(data.packages);
        } else {
          setCurrentSubs([]);
        }
      }
    } catch (e) {
      console.log('Error fetching packages', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleBuy = async (pkgId) => {
    try {
      const res = await fetch('http://localhost:8000/api/package/subscriptions/buy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ package_id: pkgId })
      });
      if (res.ok) {
        alert('Đăng ký gói dịch vụ thành công!');
        fetchData();
        window.dispatchEvent(new Event('subscription_updated'));
      } else {
        const errText = await res.text();
        alert('Có lỗi xảy ra khi đăng ký: ' + errText);
      }
    } catch (e) {
      alert('Lỗi kết nối: ' + e.message);
    }
  };

  const getPackageBadgeColor = (pkgName) => {
    const name = pkgName.toLowerCase();
    if (name.includes('vàng') || name.includes('gold')) return 'linear-gradient(135deg, #f59e0b, #d97706)';
    if (name.includes('kim cương') || name.includes('diamond')) return 'linear-gradient(135deg, #3b82f6, #1d4ed8)';
    return 'linear-gradient(135deg, #64748b, #475569)';
  };

  const getPackageTheme = (pkgName) => {
    const name = pkgName.toLowerCase();
    if (name.includes('vàng') || name.includes('gold')) {
      return {
        borderColor: '#f59e0b',
        glow: 'rgba(245, 158, 11, 0.15)',
        badgeText: 'Khuyên dùng',
        accentColor: '#d97706',
        cardBg: 'linear-gradient(to bottom, #ffffff, #fffbeb)',
        btnBg: 'linear-gradient(135deg, #f59e0b, #d97706)'
      };
    }
    if (name.includes('kim cương') || name.includes('diamond')) {
      return {
        borderColor: '#6366f1',
        glow: 'rgba(99, 102, 241, 0.15)',
        badgeText: 'Cao cấp nhất',
        accentColor: '#4f46e5',
        cardBg: 'linear-gradient(to bottom, #1e1b4b, #0f0e26)',
        btnBg: 'linear-gradient(135deg, #6366f1, #4f46e5)',
        textColor: '#e0e7ff',
        titleColor: '#ffffff',
        descColor: '#a5b4fc',
        featureColor: '#c7d2fe'
      };
    }
    return {
      borderColor: '#e2e8f0',
      glow: 'rgba(0,0,0,0.02)',
      badgeText: '',
      accentColor: '#475569',
      cardBg: '#ffffff',
      btnBg: 'linear-gradient(135deg, #475569, #334155)'
    };
  };

  return (
    <div className="page-container" style={{ background: '#f8fafc', minHeight: '100vh', padding: '32px 40px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, margin: 0 }}>
          <Crown size={38} color="#f59e0b" fill="#f59e0b" style={{ filter: 'drop-shadow(0 2px 8px rgba(245,158,11,0.3))' }} />
          Gói Dịch Vụ & Đặc Quyền
        </h1>
        <p style={{ color: '#64748b', fontSize: '1.05rem', marginTop: 12, maxWidth: 620, margin: '12px auto 0', lineHeight: 1.6 }}>
          Nâng cấp tài nguyên của bạn để sử dụng các Giáo án Mẫu cao cấp và Ngân hàng Câu hỏi khổng lồ được tối ưu hóa bởi AI.
        </p>
      </div>

      {/* Active Subscriptions Summary - Thu gọn tinh tế */}
      {currentSubs.length > 0 && (
        <div style={{ maxWidth: 1000, margin: '0 auto 40px', background: 'white', borderRadius: 24, padding: '24px 32px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <ShieldCheck size={20} color="#10b981" /> Gói dịch vụ bạn đang sở hữu
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            {currentSubs.map((sub, idx) => (
              <div key={idx} style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)', borderRadius: 16, padding: '16px 20px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{
                      background: getPackageBadgeColor(sub.package_name),
                      color: 'white',
                      padding: '3px 10px',
                      borderRadius: 20,
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      textTransform: 'uppercase'
                    }}>{sub.package_name}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, color: '#475569', fontSize: '0.9rem', fontWeight: 500 }}>
                    <Calendar size={15} color="#64748b" />
                    <span>Hạn sử dụng: <strong style={{ color: '#0f172a' }}>{new Date(sub.end_date).toLocaleDateString('vi-VN')}</strong></span>
                  </div>
                </div>
                <div style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 700, fontSize: '0.85rem', background: '#ecfdf5', padding: '6px 12px', borderRadius: 8 }}>
                  <CheckCircle2 size={15} /> ĐANG HOẠT ĐỘNG
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 0' }}>
          <Loader className="animate-spin" size={40} color="#4f46e5" />
          <p style={{ marginTop: 12, color: '#64748b', fontWeight: 500 }}>Đang cập nhật danh sách gói...</p>
        </div>
      ) : (
        /* Pricing Cards Grid */
        <div style={{ display: 'flex', justifyContent: 'center', gap: 28, flexWrap: 'wrap', maxWidth: 1140, margin: '0 auto' }}>
          {packages.map(pkg => {
            const theme = getPackageTheme(pkg.name);
            const isDark = theme.textColor !== undefined;

            return (
              <div
                key={pkg.id}
                style={{
                  background: theme.cardBg,
                  width: 340,
                  borderRadius: 28,
                  padding: '36px 32px',
                  boxShadow: `0 20px 25px -5px ${theme.glow}, 0 8px 10px -6px ${theme.glow}`,
                  border: `2px solid ${theme.borderColor}`,
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'pointer'
                }}
                onMouseOver={e => {
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.boxShadow = `0 25px 35px -5px ${theme.glow.replace('0.15', '0.25')}, 0 12px 16px -6px ${theme.glow.replace('0.15', '0.25')}`;
                }}
                onMouseOut={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = `0 20px 25px -5px ${theme.glow}, 0 8px 10px -6px ${theme.glow}`;
                }}
              >
                {/* Popular/Recommended Badge */}
                {theme.badgeText && (
                  <div style={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    background: theme.btnBg,
                    color: 'white',
                    padding: '4px 12px',
                    borderRadius: 20,
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}>
                    <Sparkles size={10} fill="white" />
                    {theme.badgeText}
                  </div>
                )}

                <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: theme.titleColor || '#0f172a', margin: '0 0 8px 0' }}>{pkg.name}</h3>
                <p style={{ color: theme.descColor || '#64748b', fontSize: '0.85rem', margin: '0 0 28px 0', minHeight: 38, lineHeight: 1.5 }}>{pkg.description}</p>
                
                <div style={{ marginBottom: 28, display: 'flex', alignItems: 'baseline', gap: 4 }}>
                  <span style={{ fontSize: '2.2rem', fontWeight: 900, color: theme.titleColor || '#0f172a' }}>
                    {pkg.price.toLocaleString('vi-VN')}đ
                  </span>
                  <span style={{ color: theme.descColor || '#64748b', fontWeight: 600, fontSize: '0.9rem' }}>
                    / {pkg.duration_days} ngày
                  </span>
                </div>

                <div style={{ width: '100%', height: 1, background: isDark ? 'rgba(255,255,255,0.1)' : '#f1f5f9', marginBottom: 28 }}></div>

                <div style={{ flex: 1, marginBottom: 32 }}>
                  <p style={{ fontWeight: 800, color: theme.titleColor || '#0f172a', fontSize: '0.9rem', margin: '0 0 16px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Đặc quyền đi kèm:</p>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {pkg.features ? pkg.features.split(';').map((f, i) => (
                      <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, color: theme.featureColor || '#475569', fontSize: '0.9rem' }}>
                        <div style={{
                          width: 18, height: 18, borderRadius: '50%',
                          background: isDark ? 'rgba(99, 102, 241, 0.2)' : 'rgba(16, 185, 129, 0.1)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2
                        }}>
                          <Check size={12} color={isDark ? '#a5b4fc' : '#10b981'} strokeWidth={3} />
                        </div>
                        <span style={{ lineHeight: 1.4 }}>{f.trim()}</span>
                      </li>
                    )) : (
                      <li style={{ color: '#94a3b8', fontStyle: 'italic' }}>Chưa cập nhật tính năng cụ thể.</li>
                    )}
                  </ul>
                </div>

                <button
                  onClick={() => handleBuy(pkg.id)}
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: 14,
                    background: theme.btnBg,
                    color: 'white',
                    border: 'none',
                    fontSize: '1rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    boxShadow: isDark ? '0 4px 14px rgba(99, 102, 241, 0.4)' : '0 4px 14px rgba(245, 158, 11, 0.25)',
                    transition: 'all 0.2s',
                    outline: 'none'
                  }}
                  onMouseOver={e => e.currentTarget.style.filter = 'brightness(1.1)'}
                  onMouseOut={e => e.currentTarget.style.filter = 'brightness(1)'}
                >
                  <Zap size={16} fill="currentColor" /> Đăng ký ngay
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SubscriptionManager;
