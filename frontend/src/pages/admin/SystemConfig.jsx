import React, { useState, useEffect } from 'react';
import { Settings, Save, AlertTriangle, Cpu, Shield, HelpCircle, HardDrive, Loader, CheckCircle2 } from 'lucide-react';

const SystemConfig = () => {
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('AI');
  const [alertMsg, setAlertMsg] = useState({ type: '', text: '' });

  // Định nghĩa các Category và icon tương ứng
  const categories = [
    { id: 'AI', name: 'Trí tuệ Nhân tạo (AI)', icon: <Cpu size={18} /> },
    { id: 'Quota', name: 'Giới hạn & Quota', icon: <HardDrive size={18} /> },
    { id: 'Security', name: 'Bảo mật & Hệ thống', icon: <Shield size={18} /> },
    { id: 'General', name: 'Thông tin chung', icon: <HelpCircle size={18} /> },
  ];

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem('accessToken');
      const response = await fetch('http://localhost:8000/api/auth/system-config', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Không thể tải cấu hình hệ thống');
      const data = await response.json();
      setConfigs(data);
    } catch (err) {
      setAlertMsg({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (key, val) => {
    setConfigs(prev =>
      prev.map(c => (c.key === key ? { ...c, value: val } : c))
    );
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setAlertMsg({ type: '', text: '' });

    try {
      const token = sessionStorage.getItem('accessToken');
      const response = await fetch('http://localhost:8000/api/auth/system-config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(configs.map(c => ({ key: c.key, value: c.value })))
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Không thể lưu cấu hình');

      setAlertMsg({ type: 'success', text: data.message || 'Đã lưu cấu hình thành công!' });
      setTimeout(() => setAlertMsg({ type: '', text: '' }), 5000);
    } catch (err) {
      setAlertMsg({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const filteredConfigs = configs.filter(c => c.category === activeTab);

  if (loading) {
    return (
      <div className="page-container" style={{ padding: '24px 40px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <Loader className="animate-spin" size={48} color="var(--primary)" />
        <p style={{ marginTop: 16, color: 'var(--text-muted)', fontWeight: 500 }}>Đang tải cấu hình hệ thống...</p>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ padding: '24px 40px', background: '#f8fafc', minHeight: '100vh' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
        <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Settings size={28} color="#3b82f6" />
        </div>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>Cấu hình Hệ thống</h1>
          <p style={{ color: '#64748b', marginTop: 4, fontSize: '0.95rem' }}>Quản lý các thông số vận hành AI, quota sử dụng, bảo mật và thông tin liên hệ của PlanBookAI.</p>
        </div>
      </div>

      {alertMsg.text && (
        <div style={{
          padding: '16px 20px',
          borderRadius: 16,
          marginBottom: 24,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          fontWeight: 600,
          fontSize: '0.95rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
          background: alertMsg.type === 'success' ? '#ecfdf5' : '#fef2f2',
          border: alertMsg.type === 'success' ? '1px solid #a7f3d0' : '1px solid #fecaca',
          color: alertMsg.type === 'success' ? '#065f46' : '#991b1b'
        }}>
          {alertMsg.type === 'success' ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
          {alertMsg.text}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 32, alignItems: 'start' }}>
        {/* Navigation Sidebar */}
        <div style={{ background: 'white', borderRadius: 24, padding: 16, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {categories.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '14px 18px',
                borderRadius: 16,
                border: 'none',
                background: activeTab === tab.id ? 'linear-gradient(135deg, #3b82f6, #2563eb)' : 'transparent',
                color: activeTab === tab.id ? 'white' : '#475569',
                fontWeight: 700,
                fontSize: '0.95rem',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s',
                boxShadow: activeTab === tab.id ? '0 4px 12px rgba(37, 99, 235, 0.25)' : 'none'
              }}
            >
              {tab.icon}
              {tab.name}
            </button>
          ))}
        </div>

        {/* Configurations Form */}
        <div style={{ background: 'white', borderRadius: 28, padding: 40, boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b', borderBottom: '1px solid #f1f5f9', paddingBottom: 16, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
              {categories.find(c => c.id === activeTab)?.icon}
              {categories.find(c => c.id === activeTab)?.name}
            </h3>

            {filteredConfigs.length === 0 ? (
              <p style={{ color: '#94a3b8', fontStyle: 'italic', textAlign: 'center', padding: '40px 0' }}>Chưa cấu hình thông số nào trong nhóm này.</p>
            ) : (
              filteredConfigs.map(cfg => (
                <div key={cfg.id} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <label style={{ fontWeight: 700, color: '#334155', fontSize: '0.95rem' }}>
                      {cfg.key.toUpperCase().replace(/_/g, ' ')}
                    </label>
                    <span style={{ fontSize: '0.8rem', color: '#64748b', background: '#f1f5f9', padding: '2px 8px', borderRadius: 6, fontFamily: 'monospace' }}>{cfg.key}</span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 4px 0' }}>{cfg.description}</p>
                  
                  {cfg.value === 'true' || cfg.value === 'false' ? (
                    <select
                      value={cfg.value}
                      onChange={e => handleInputChange(cfg.key, e.target.value)}
                      style={{
                        padding: '12px 16px',
                        borderRadius: 12,
                        border: '1px solid #cbd5e1',
                        fontSize: '0.95rem',
                        fontWeight: 600,
                        color: '#1e293b',
                        background: '#f8fafc',
                        outline: 'none',
                        cursor: 'pointer',
                        transition: 'border 0.2s'
                      }}
                    >
                      <option value="true">BẬT (True)</option>
                      <option value="false">TẮT (False)</option>
                    </select>
                  ) : cfg.key.includes('ai_model') ? (
                    <select
                      value={cfg.value}
                      onChange={e => handleInputChange(cfg.key, e.target.value)}
                      style={{
                        padding: '12px 16px',
                        borderRadius: 12,
                        border: '1px solid #cbd5e1',
                        fontSize: '0.95rem',
                        fontWeight: 600,
                        color: '#1e293b',
                        background: '#f8fafc',
                        outline: 'none',
                        cursor: 'pointer',
                        transition: 'border 0.2s'
                      }}
                    >
                      <option value="gemini-1.5-pro">Gemini 1.5 Pro (Khuyên dùng cho giáo án)</option>
                      <option value="gemini-1.5-flash">Gemini 1.5 Flash (Nhanh & Tối ưu câu hỏi)</option>
                      <option value="gpt-4o">OpenAI GPT-4o (Cao cấp)</option>
                      <option value="gpt-3.5-turbo">OpenAI GPT-3.5 Turbo</option>
                      <option value="llama-3-70b">Llama 3 70B (Open-Source)</option>
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={cfg.value}
                      onChange={e => handleInputChange(cfg.key, e.target.value)}
                      style={{
                        padding: '12px 16px',
                        borderRadius: 12,
                        border: '1px solid #cbd5e1',
                        fontSize: '0.95rem',
                        color: '#1e293b',
                        outline: 'none',
                        transition: 'all 0.2s'
                      }}
                      onFocus={e => e.target.style.borderColor = '#3b82f6'}
                      onBlur={e => e.target.style.borderColor = '#cbd5e1'}
                    />
                  )}
                </div>
              ))
            )}

            <button
              type="submit"
              disabled={saving || filteredConfigs.length === 0}
              style={{
                alignSelf: 'flex-end',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: 'white',
                border: 'none',
                padding: '14px 28px',
                borderRadius: 14,
                fontWeight: 700,
                fontSize: '0.95rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)',
                opacity: (saving || filteredConfigs.length === 0) ? 0.7 : 1
              }}
              onMouseOver={e => !saving && (e.currentTarget.style.transform = 'translateY(-2px)')}
              onMouseOut={e => !saving && (e.currentTarget.style.transform = 'translateY(0)')}
            >
              {saving ? (
                <>
                  <Loader className="animate-spin" size={18} />
                  Đang lưu cấu hình...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Lưu thay đổi
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SystemConfig;
