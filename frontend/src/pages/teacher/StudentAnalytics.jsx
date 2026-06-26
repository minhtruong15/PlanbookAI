import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Download, MessageSquare } from 'lucide-react';

const StudentAnalytics = () => {
  const data = [
    { name: 'Kỳ 1', score: 6.5 },
    { name: 'Kỳ 2', score: 7.2 },
    { name: 'Kỳ 3', score: 8.0 },
    { name: 'Kỳ 4', score: 7.8 },
    { name: 'Kỳ 5', score: 8.5 },
  ];

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: 4 }}>Phân tích & Feedback</h1>
          <p style={{ color: 'var(--text-muted)' }}>Đánh giá năng lực cá nhân và xuất báo cáo tự động</p>
        </div>
        <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 8 }}>
          <Download size={18} /> Xuất báo cáo Excel
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 24 }}>
        <div className="glass-panel" style={{ padding: 20, borderRadius: 16 }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: 16 }}>Danh sách Học sinh</h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <li style={{ padding: '12px', background: 'var(--primary-light)', color: 'var(--primary)', borderRadius: 8, fontWeight: 500, display: 'flex', justifyContent: 'space-between' }}>
              <span>Nguyễn Văn A</span>
              <span style={{ fontWeight: 700 }}>8.5</span>
            </li>
            <li style={{ padding: '12px', background: 'white', border: '1px solid var(--border-color)', borderRadius: 8, display: 'flex', justifyContent: 'space-between', cursor: 'pointer' }}>
              <span>Trần Thị B</span>
              <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>7.2</span>
            </li>
            <li style={{ padding: '12px', background: 'white', border: '1px solid var(--border-color)', borderRadius: 8, display: 'flex', justifyContent: 'space-between', cursor: 'pointer' }}>
              <span>Lê Hoàng C</span>
              <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>6.0</span>
            </li>
          </ul>
        </div>

        <div className="glass-panel" style={{ padding: 20, borderRadius: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-main)' }}>Tiến bộ của Nguyễn Văn A</h3>
            <button className="btn-primary" style={{ padding: '6px 12px', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem' }}>
              <MessageSquare size={14} /> AI Tạo Nhận xét
            </button>
          </div>
          
          <div style={{ height: 250, width: '100%', marginBottom: 24 }}>
            <ResponsiveContainer>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis domain={[0, 10]} axisLine={false} tickLine={false} />
                <Tooltip />
                <Line type="monotone" dataKey="score" stroke="var(--primary)" strokeWidth={3} dot={{ r: 6 }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div style={{ background: '#f8fafc', padding: 16, borderRadius: 12, border: '1px solid #e2e8f0' }}>
            <h4 style={{ fontWeight: 600, marginBottom: 8, color: '#334155' }}>Nhận xét từ AI:</h4>
            <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: 1.6 }}>Em A có sự tiến bộ rõ rệt qua từng kỳ học. Tuy nhiên, kỹ năng giải toán Hình học Không gian vẫn còn yếu, thường sai ở các bước dựng hình. Cần bổ sung thêm bài tập phần này.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentAnalytics;
