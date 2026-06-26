import React, { useState, useEffect } from 'react';
import { Users, ShieldCheck, Database, Cpu, Globe, Loader, AlertCircle, Clock, Terminal } from 'lucide-react';

const AdminDashboard = () => {
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDays, setSelectedDays] = useState(7);
  const [selectedDateStr, setSelectedDateStr] = useState('');

  useEffect(() => {
    fetchStats(selectedDays);
    const interval = setInterval(() => fetchStats(selectedDays), 20000); // Polling tự động mỗi 20 giây để giữ dữ liệu mới nhất
    return () => clearInterval(interval);
  }, [selectedDays]);

  const fetchStats = async (days = selectedDays) => {
    try {
      const token = sessionStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:8000/api/auth/system-stats?days=${days}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Không thể tải thống kê hệ thống');
      const data = await response.json();
      setStatsData(data);
      setError('');
      
      // Chọn ngày mặc định hoặc cập nhật ngày đã chọn
      if (data.dates && data.dates.length > 0) {
        if (!selectedDateStr || !data.dates.includes(selectedDateStr)) {
          setSelectedDateStr(data.dates[data.dates.length - 1]);
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getFormattedSelectedDate = () => {
    if (!selectedDateStr) return '';
    const parts = selectedDateStr.split('-');
    if (parts.length !== 3) return selectedDateStr;
    
    const dateObj = new Date(selectedDateStr);
    const dayNames = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    const dayName = dayNames[dateObj.getDay()];
    
    return `${dayName} (${parts[2]}/${parts[1]}/${parts[0]})`;
  };

  const getFilteredLogsForSelectedDay = () => {
    if (!statsData || !statsData.logs || !selectedDateStr) return [];
    
    return statsData.logs.filter(log => {
      const logDateStr = log.created_at.substring(0, 10);
      return logDateStr === selectedDateStr;
    });
  };

  if (loading || !statsData) {
    return (
      <div className="page-container" style={{ padding: '24px 40px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <Loader className="animate-spin" size={48} color="#ef4444" />
        <p style={{ marginTop: 16, color: '#64748b', fontWeight: 500 }}>Đang đồng bộ dữ liệu...</p>
      </div>
    );
  }

  const stats = [
    { title: 'Tổng Người dùng', value: statsData ? statsData.total_users.toLocaleString() : '0', change: '+12%', icon: <Users size={24} color="#3b82f6" />, bg: '#eff6ff' },
    { title: 'Server Load', value: statsData ? `${statsData.cpu_usage}%` : '45%', change: '-5%', icon: <Cpu size={24} color="#8b5cf6" />, bg: '#f5f3ff' },
    { title: 'Database Size', value: statsData ? statsData.database_size : '1.2 GB', change: '+2%', icon: <Database size={24} color="#10b981" />, bg: '#ecfdf5' },
    { title: 'Uptime', value: statsData ? statsData.uptime : '99.99%', change: '0%', icon: <ShieldCheck size={24} color="#f59e0b" />, bg: '#fffbeb' }
  ];

  const filteredLogs = getFilteredLogsForSelectedDay();
  const maxActivityCount = statsData ? Math.max(...statsData.daily_activity_counts, 1) : 1;

  return (
    <div className="page-container" style={{ padding: '24px 40px', background: '#f8fafc', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 12, margin: 0 }}>
            <ShieldCheck size={36} color="#ef4444" /> System Overview
          </h1>
          <p style={{ color: '#64748b', marginTop: 8, fontSize: '1.05rem' }}>Theo dõi sức khỏe hệ thống và các chỉ số cốt lõi.</p>
        </div>
        <button style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'white', border: '1px solid #e2e8f0', padding: '10px 20px', borderRadius: 12, fontWeight: 600, color: '#334155', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <Globe size={18} /> Export Report
        </button>
      </div>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '14px 20px', borderRadius: 16, display: 'flex', alignItems: 'center', gap: 10, color: '#991b1b', fontWeight: 600, marginBottom: 24 }}>
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24, marginBottom: 32 }}>
        {stats.map((stat, i) => (
          <div key={i} style={{ background: 'white', padding: 24, borderRadius: 20, boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 20, transition: 'transform 0.2s', cursor: 'pointer' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {stat.icon}
            </div>
            <div>
              <div style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 600, marginBottom: 4 }}>{stat.title}</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1e293b' }}>{stat.value}</div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: stat.change.startsWith('+') ? '#10b981' : stat.change.startsWith('-') ? '#ef4444' : '#64748b', marginTop: 4 }}>{stat.change} so với tháng trước</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, marginBottom: 32 }}>
        {/* Interactive Clickable Bar Chart */}
        <div style={{ background: 'white', padding: 32, borderRadius: 24, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 850, color: '#1e293b', margin: 0 }}>Tần suất Hoạt động Hệ thống</h3>
              <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: 6, margin: '6px 0 0' }}>Nhấp chọn cột bất kỳ để xem danh sách nhật ký hoạt động chi tiết trong ngày.</p>
            </div>
            <select 
              value={selectedDays}
              onChange={(e) => {
                setLoading(true);
                setSelectedDays(Number(e.target.value));
              }}
              style={{ padding: '8px 14px', borderRadius: 10, border: '1px solid #cbd5e1', outline: 'none', background: '#f8fafc', fontWeight: 600, color: '#475569', cursor: 'pointer' }}
            >
              <option value={7}>7 Ngày qua (Tuần này)</option>
              <option value={30}>30 Ngày qua</option>
            </select>
          </div>

          <div style={{ height: 280, background: '#f8fafc', borderRadius: 20, display: 'flex', alignItems: 'flex-end', padding: '24px 32px', gap: selectedDays === 7 ? '4%' : '1%', position: 'relative', border: '1px solid #f1f5f9' }}>
             {/* Render Bars dynamically with selected highlight */}
             {statsData && statsData.daily_activity_counts.map((count, idx) => {
               const heightPercent = (count / maxActivityCount) * 80 + 5; // Tính % chiều cao tối đa
               const dateStr = statsData.dates[idx];
               const isSelected = dateStr === selectedDateStr;

               return (
                <div
                  key={idx}
                  onClick={() => setSelectedDateStr(dateStr)}
                  style={{
                    flex: 1,
                    background: isSelected 
                      ? 'linear-gradient(to top, #ef4444, #f87171)' 
                      : 'linear-gradient(to top, #fca5a5, #fecaca)',
                    height: `${heightPercent}%`,
                    borderRadius: '8px 8px 0 0',
                    position: 'relative',
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: isSelected ? '0 8px 16px rgba(239, 68, 68, 0.35)' : 'none',
                    transform: isSelected ? 'scale(1.05)' : 'scale(1)'
                  }}
                  onMouseOver={e => {
                    if (!isSelected) {
                      e.currentTarget.style.background = 'linear-gradient(to top, #f87171, #fca5a5)';
                    }
                  }}
                  onMouseOut={e => {
                    if (!isSelected) {
                      e.currentTarget.style.background = 'linear-gradient(to top, #fca5a5, #fecaca)';
                    }
                  }}
                >
                  <div style={{
                    position: 'absolute',
                    top: -26,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    fontSize: selectedDays === 7 ? '0.8rem' : '0.65rem',
                    fontWeight: 800,
                    color: isSelected ? '#ef4444' : '#64748b',
                    whiteSpace: 'nowrap'
                  }}>
                    {count}
                  </div>
                </div>
               );
             })}
             
             {/* X-axis labels */}
             <div style={{ position: 'absolute', bottom: -28, left: 0, right: 0, display: 'flex', justifyContent: 'space-between', padding: '0 32px' }}>
                {statsData && statsData.labels.map((label, idx) => {
                  const dateStr = statsData.dates[idx];
                  const isSelected = dateStr === selectedDateStr;
                  const shouldShowLabel = selectedDays === 7 || idx % 4 === 0 || idx === statsData.dates.length - 1;

                  return (
                    <span 
                      key={idx} 
                      onClick={() => setSelectedDateStr(dateStr)}
                      style={{ 
                        fontSize: selectedDays === 7 ? '0.85rem' : '0.75rem', 
                        fontWeight: isSelected ? 800 : 600, 
                        color: isSelected ? '#ef4444' : '#94a3b8',
                        cursor: 'pointer',
                        padding: '2px 6px',
                        borderRadius: 6,
                        background: isSelected ? '#fee2e2' : 'transparent',
                        transition: 'all 0.2s',
                        visibility: shouldShowLabel ? 'visible' : 'hidden'
                      }}
                    >
                      {label}
                    </span>
                  );
                })}
             </div>
          </div>
        </div>

        {/* Roles Breakdown */}
        <div style={{ background: 'white', padding: 32, borderRadius: 24, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: 20 }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>Cơ cấu người dùng (Thực tế)</h3>
          
          {statsData && statsData.role_counts ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { name: 'Giáo viên (Teacher)', count: statsData.role_counts.teacher, color: '#3b82f6', percent: Math.round((statsData.role_counts.teacher / statsData.total_users) * 100) || 0 },
                { name: 'Nhân viên (Staff)', count: statsData.role_counts.staff, color: '#10b981', percent: Math.round((statsData.role_counts.staff / statsData.total_users) * 100) || 0 },
                { name: 'Quản trị viên (Manager)', count: statsData.role_counts.manager, color: '#8b5cf6', percent: Math.round((statsData.role_counts.manager / statsData.total_users) * 100) || 0 },
                { name: 'Admin tối cao', count: statsData.role_counts.admin, color: '#ef4444', percent: Math.round((statsData.role_counts.admin / statsData.total_users) * 100) || 0 }
              ].map((role, idx) => (
                <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: 600 }}>
                    <span style={{ color: '#475569' }}>{role.name}</span>
                    <span style={{ color: '#1e293b' }}>{role.count} ({role.percent}%)</span>
                  </div>
                  <div style={{ width: '100%', height: 8, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ width: `${role.percent}%`, height: '100%', background: role.color, borderRadius: 4 }}></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: '#94a3b8', fontStyle: 'italic' }}>Không có dữ liệu cơ cấu người dùng</p>
          )}
        </div>
      </div>

      {/* Drilldown Detailed Logs Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24 }}>
        <div style={{ background: 'white', padding: 36, borderRadius: 28, boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, borderBottom: '1px solid #f1f5f9', paddingBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Terminal size={22} color="#ef4444" />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#1e293b', margin: 0 }}>
                Chi tiết Nhật ký Hoạt động - {getFormattedSelectedDate()}
              </h3>
            </div>
            <span style={{
              background: '#fee2e2',
              color: '#ef4444',
              padding: '6px 14px',
              borderRadius: 20,
              fontSize: '0.85rem',
              fontWeight: 800
            }}>
              {filteredLogs.length} hoạt động ghi nhận
            </span>
          </div>

          {filteredLogs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8', fontStyle: 'italic' }}>
              Không có nhật ký hoạt động nào được ghi nhận trong ngày này.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {filteredLogs.map(log => (
                <div 
                  key={log.id} 
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    padding: '16px 20px', 
                    background: '#f8fafc', 
                    borderRadius: 16, 
                    border: '1px solid #f1f5f9',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={e => { e.currentTarget.style.transform = 'translateX(4px)'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
                  onMouseOut={e => { e.currentTarget.style.transform = 'translateX(0)'; e.currentTarget.style.borderColor = '#f1f5f9'; }}
                >
                  <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                    {/* Status circle indicator */}
                    <div style={{ 
                      width: 12, 
                      height: 12, 
                      borderRadius: '50%', 
                      background: log.status === 'success' ? '#10b981' : log.status === 'warning' ? '#f59e0b' : '#ef4444',
                      boxShadow: `0 0 10px ${log.status === 'success' ? 'rgba(16,185,129,0.3)' : log.status === 'warning' ? 'rgba(245,158,11,0.3)' : 'rgba(239,68,68,0.3)'}`
                    }}></div>
                    
                    <div>
                      <div style={{ fontWeight: 700, color: '#334155', fontSize: '0.95rem' }}>{log.action}</div>
                      <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: 4 }}>
                        Thực hiện bởi: <span style={{ fontWeight: 600, color: '#64748b' }}>{log.user}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600 }}>
                    <Clock size={14} />
                    {new Date(log.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
