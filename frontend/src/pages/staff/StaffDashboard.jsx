import React, { useState, useEffect } from 'react';
import { Database, FileEdit, Terminal, TrendingUp, Users, Activity } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const StaffDashboard = () => {
  const [stats, setStats] = useState({
    templates: 0,
    questions: 0,
    prompts: 2 // Hardcoded cho demo
  });
  
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const [resTemplates, resQuestions] = await Promise.all([
        fetch('http://localhost:8000/api/lesson/templates', {
          headers: { 'Authorization': `Bearer ${sessionStorage.getItem('accessToken')}` }
        }),
        fetch('http://localhost:8000/api/question/questions', {
          headers: { 'Authorization': `Bearer ${sessionStorage.getItem('accessToken')}` }
        })
      ]);
      
      let templatesCount = 0;
      let questionsCount = 0;
      
      if (resTemplates.ok) {
        const templates = await resTemplates.json();
        templatesCount = templates.length;
      }
      
      if (resQuestions.ok) {
        const questions = await resQuestions.json();
        questionsCount = questions.length;
      }
      
      setStats({
        templates: templatesCount,
        questions: questionsCount,
        prompts: 2
      });
    } catch (e) {
      console.error('Lỗi khi lấy dữ liệu thống kê Staff', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 5000); // Tự động làm mới mỗi 5 giây (Real-time)
    return () => clearInterval(interval);
  }, []);

  // Mock data cho biểu đồ
  const chartData = [
    { name: 'T2', questions: 120, templates: 10 },
    { name: 'T3', questions: 200, templates: 15 },
    { name: 'T4', questions: 150, templates: 12 },
    { name: 'T5', questions: 280, templates: 25 },
    { name: 'T6', questions: 350, templates: 30 },
    { name: 'T7', questions: 400, templates: 45 },
    { name: 'CN', questions: 500, templates: 60 }
  ];

  return (
    <div className="page-container" style={{ background: '#f8fafc', minHeight: '100vh', padding: '24px' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#064e3b', marginBottom: 8 }}>Tổng quan Hệ thống</h1>
        <p style={{ color: '#64748b', fontSize: '1rem' }}>Giám sát lượng dữ liệu đào tạo cho AI và cấu trúc giáo án theo thời gian thực.</p>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, marginBottom: 32 }}>
        <div style={{ background: 'white', padding: 24, borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ width: 60, height: 60, background: '#dcfce7', color: '#16a34a', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             <FileEdit size={32} />
          </div>
          <div>
            <p style={{ color: '#64748b', fontWeight: 600, fontSize: '0.9rem', marginBottom: 4 }}>Tổng Giáo án Mẫu</p>
            <h3 style={{ fontSize: '2rem', fontWeight: 800, color: '#1e293b' }}>{stats.templates}</h3>
          </div>
        </div>

        <div style={{ background: 'white', padding: 24, borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ width: 60, height: 60, background: '#e0e7ff', color: '#4f46e5', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             <Database size={32} />
          </div>
          <div>
            <p style={{ color: '#64748b', fontWeight: 600, fontSize: '0.9rem', marginBottom: 4 }}>Kho Câu hỏi Hệ thống</p>
            <h3 style={{ fontSize: '2rem', fontWeight: 800, color: '#1e293b' }}>{stats.questions}</h3>
          </div>
        </div>

        <div style={{ background: 'white', padding: 24, borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ width: 60, height: 60, background: '#fef3c7', color: '#d97706', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             <Terminal size={32} />
          </div>
          <div>
            <p style={{ color: '#64748b', fontWeight: 600, fontSize: '0.9rem', marginBottom: 4 }}>Cấu hình AI Prompt</p>
            <h3 style={{ fontSize: '2rem', fontWeight: 800, color: '#1e293b' }}>{stats.prompts}</h3>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div style={{ background: 'white', padding: 32, borderRadius: 20, border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1e293b', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
              <TrendingUp size={20} color="#4f46e5"/> Mức độ tăng trưởng dữ liệu
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Theo dõi lượng câu hỏi và giáo án mẫu được đóng góp trong tuần qua.</p>
          </div>
          <select style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #e2e8f0', outline: 'none', fontWeight: 500 }}>
            <option>7 ngày qua</option>
            <option>30 ngày qua</option>
          </select>
        </div>
        
        <div style={{ height: 350, width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorQuestions" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorTemplates" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <Tooltip 
                contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                labelStyle={{ fontWeight: 700, color: '#1e293b', marginBottom: 8 }}
              />
              <Area type="monotone" dataKey="questions" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorQuestions)" name="Câu hỏi mới" />
              <Area type="monotone" dataKey="templates" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorTemplates)" name="Giáo án Mẫu" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;
