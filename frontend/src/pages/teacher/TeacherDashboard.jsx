import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, FileText, CheckCircle, TrendingUp, Loader, Sparkles } from 'lucide-react';

const TeacherDashboard = () => {
  const [stats, setStats] = useState({
    lessonsCount: 0,
    examsCount: 0,
    studentsCount: 0,
    performance: 0,
    distribution: [],
    subjectStats: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = sessionStorage.getItem('accessToken');
        console.log("Fetching dashboard data with token:", token ? "Exists" : "Missing");
        
        // 1. Fetch Lessons
        const lessonRes = await fetch('http://localhost:8000/api/lesson/lessons', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const lessons = await lessonRes.json();
        console.log("Lessons fetched:", lessons.length);

        // 2. Fetch Real Stats from Exam Service
        const statsRes = await fetch('http://localhost:8000/api/exam/stats', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const realStats = await statsRes.json();
        console.log("Real stats fetched:", realStats);

        setStats({
          lessonsCount: lessons.length || 0,
          examsCount: realStats.total_exams || 0,
          studentsCount: realStats.total_students || 0,
          performance: realStats.performance || 0,
          distribution: realStats.distribution || [],
          subjectStats: realStats.subject_stats || []
        });
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const COLORS = ['#00ced1', '#34d399', '#fbbf24', '#f87171']; // Aqua/Cyan theme

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', flexDirection: 'column', gap: 16 }}>
        <Loader className="spin" size={48} color="#00ced1" />
        <p style={{ color: '#64748b', fontWeight: 500 }}>Đang nạp dữ liệu Aqua Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ background: '#f8fafc', minHeight: '100vh' }}>
      {/* Hero Welcome Section - Lighter Version */}
      <div style={{ 
        background: 'linear-gradient(135deg, #ccfbf1 0%, #99f6e4 100%)', 
        borderRadius: 24, 
        padding: '32px 40px', 
        marginBottom: 32, 
        color: '#0d9488',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)',
        border: '1px solid #5eead4'
      }}>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 900, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
            Chào mừng giáo viên! <Sparkles size={32} color="#0d9488" />
          </h1>
          <p style={{ fontSize: '1.1rem', opacity: 0.8, maxWidth: 600, color: '#0f766e' }}>
            Hệ thống PlanbookAI đã sẵn sàng. Bạn đang quản lý <b>{stats.studentsCount}</b> học sinh và đã soạn <b>{stats.lessonsCount}</b> giáo án chất lượng.
          </p>
        </div>
        <div style={{ position: 'absolute', right: -20, bottom: -20, opacity: 0.1 }}>
          <Users size={200} />
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, marginBottom: 30 }}>
        <div className="glass-panel" style={{ padding: 24, borderRadius: 20, display: 'flex', alignItems: 'center', gap: 16, border: '1px solid rgba(0, 206, 209, 0.1)' }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: '#e0fcfc', color: '#00ced1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={28} />
          </div>
          <div>
            <div style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 600 }}>Học sinh quản lý</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1e293b' }}>{stats.studentsCount}</div>
          </div>
        </div>
        
        <div className="glass-panel" style={{ padding: 24, borderRadius: 20, display: 'flex', alignItems: 'center', gap: 16, border: '1px solid rgba(52, 211, 153, 0.1)' }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileText size={28} />
          </div>
          <div>
            <div style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 600 }}>Giáo án đã soạn</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1e293b' }}>{stats.lessonsCount}</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: 24, borderRadius: 20, display: 'flex', alignItems: 'center', gap: 16, border: '1px solid rgba(251, 191, 36, 0.1)' }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: '#fffbeb', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle size={28} />
          </div>
          <div>
            <div style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 600 }}>Đề thi thực tế</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1e293b' }}>{stats.examsCount}</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: 24, borderRadius: 20, display: 'flex', alignItems: 'center', gap: 16, border: '1px solid rgba(248, 113, 113, 0.1)' }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: '#fef2f2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TrendingUp size={28} />
          </div>
          <div>
            <div style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 600 }}>Hiệu suất lớp</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1e293b' }}>{stats.performance}%</div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
        <div className="glass-panel" style={{ padding: 20, borderRadius: 16 }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: 20 }}>Phổ điểm theo môn học</h3>
          <div style={{ height: 300, width: '100%' }}>
            <ResponsiveContainer>
              <BarChart data={stats.subjectStats}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
                <Legend iconType="circle" />
                <Bar dataKey="gioi" name="Giỏi" stackId="a" fill="#059669" radius={[0, 0, 4, 4]} />
                <Bar dataKey="kha" name="Khá" stackId="a" fill="#3b82f6" />
                <Bar dataKey="trungbinh" name="Trung bình" stackId="a" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: 20, borderRadius: 16 }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: 20 }}>Tổng quan Năng lực</h3>
          <div style={{ height: 300, width: '100%' }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={stats.distribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats.distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
