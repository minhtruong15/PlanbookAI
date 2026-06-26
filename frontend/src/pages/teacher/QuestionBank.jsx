import React, { useState, useEffect } from 'react';
import { BookOpen, Search, Crown, Lock, Target, Filter, Database, Zap, Edit, Copy, CheckCircle, Save, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TeacherQuestionBank = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasSubscription, setHasSubscription] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/question/questions', {
        headers: { 'Authorization': `Bearer ${sessionStorage.getItem('accessToken')}` }
      });
      if (res.status === 403) {
        setHasSubscription(false);
      } else if (res.ok) {
        setHasSubscription(true);
        const data = await res.json();
        setQuestions(data);
      }
    } catch (e) {
      console.log('Lỗi:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleUseQuestion = (q) => {
    navigator.clipboard.writeText(q.content);
    alert('Đã lưu câu hỏi vào bộ nhớ tạm. Bạn có thể dán (Ctrl+V) vào Đề kiểm tra!');
  };

  const handleEditClick = (q) => {
    setEditingId(q.id);
    setEditForm({ content: q.content, explanation: q.explanation || '' });
  };

  const handleSaveEdit = (id) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, content: editForm.content, explanation: editForm.explanation } : q));
    setEditingId(null);
    alert('Đã lưu bản chỉnh sửa cá nhân!');
  };

  if (!hasSubscription) {
    return (
      <div className="page-container" style={{ padding: '40px' }}>
        <div style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', borderRadius: 24, padding: 60, textAlign: 'center', color: 'white', position: 'relative', overflow: 'hidden' }}>
          <Crown size={80} color="#f59e0b" style={{ margin: '0 auto 30px' }} />
          <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: 20 }}>Ngân hàng Câu hỏi VIP</h2>
          <p style={{ fontSize: '1.2rem', color: '#cbd5e1', marginBottom: 40, maxWidth: 600, margin: '0 auto 40px', lineHeight: 1.6 }}>
            Truy cập hàng ngàn câu hỏi trắc nghiệm chất lượng cao được biên soạn và kiểm duyệt chặt chẽ. Vui lòng đăng ký gói dịch vụ để tiếp tục.
          </p>
          <button onClick={() => navigate('/teacher/packages')} style={{ padding: '16px 40px', borderRadius: 16, background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: 'white', border: 'none', fontSize: '1.2rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 10px 25px -5px rgba(245, 158, 11, 0.4)', display: 'inline-flex', alignItems: 'center', gap: 12, transition: 'transform 0.2s' }}>
            <Lock size={24} /> Nâng cấp Gói Dịch Vụ
          </button>
        </div>
      </div>
    );
  }

  // Calculate Statistics
  const stats = {
    total: questions.length,
    subjects: {},
    grades: {}
  };
  questions.forEach(q => {
    stats.subjects[q.subject] = (stats.subjects[q.subject] || 0) + 1;
    stats.grades[q.grade] = (stats.grades[q.grade] || 0) + 1;
  });

  return (
    <div className="page-container" style={{ padding: '24px 40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'flex', alignItems: 'center', gap: 12 }}>
            <Database size={32} color="#2563eb" /> Ngân hàng Câu hỏi
          </h1>
          <p style={{ color: '#64748b', fontSize: '1rem', marginTop: 8 }}>Kho dữ liệu câu hỏi trắc nghiệm thông minh, hệ thống tự động tổng hợp.</p>
        </div>
      </div>

      {/* Statistics Section */}
      {!loading && questions.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 20, marginBottom: 32 }}>
           <div style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', borderRadius: 20, padding: 24, color: 'white', display: 'flex', alignItems: 'center', gap: 20 }}>
              <div style={{ width: 64, height: 64, background: 'rgba(255,255,255,0.2)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                 <Target size={32} />
              </div>
              <div>
                 <div style={{ fontSize: '0.9rem', fontWeight: 600, opacity: 0.9 }}>Tổng số câu hỏi</div>
                 <div style={{ fontSize: '2.5rem', fontWeight: 900 }}>{stats.total}</div>
              </div>
           </div>
           <div style={{ background: 'white', borderRadius: 20, padding: 24, border: '1px solid #e2e8f0', display: 'flex', gap: 40 }}>
              <div>
                 <h4 style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: 12 }}>Theo Môn học</h4>
                 <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    {Object.entries(stats.subjects).map(([sub, count]) => (
                      <div key={sub} style={{ background: '#f1f5f9', padding: '6px 12px', borderRadius: 8, fontSize: '0.9rem', fontWeight: 600, color: '#334155' }}>
                         {sub}: <span style={{ color: '#2563eb' }}>{count}</span>
                      </div>
                    ))}
                 </div>
              </div>
              <div style={{ width: 1, background: '#e2e8f0' }}></div>
              <div>
                 <h4 style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: 12 }}>Theo Khối lớp</h4>
                 <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    {Object.entries(stats.grades).map(([gr, count]) => (
                      <div key={gr} style={{ background: '#f8fafc', padding: '6px 12px', borderRadius: 8, fontSize: '0.9rem', fontWeight: 600, color: '#334155', border: '1px solid #e2e8f0' }}>
                         {gr}: <span style={{ color: '#059669' }}>{count}</span>
                      </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: 100 }}><Database className="spin" size={32} color="#3b82f6" style={{ margin: '0 auto 16px' }}/> Đang tải ngân hàng...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 20 }}>
          {questions.map((q, i) => (
            <div key={q.id} style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', transition: 'all 0.2s' }} className="hover-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ background: '#dbeafe', color: '#1d4ed8', padding: '4px 10px', borderRadius: 8, fontSize: '0.8rem', fontWeight: 700 }}>{q.subject}</span>
                  <span style={{ background: '#f1f5f9', color: '#475569', padding: '4px 10px', borderRadius: 8, fontSize: '0.8rem', fontWeight: 600 }}>{q.grade}</span>
                  <span style={{ background: '#fef3c7', color: '#b45309', padding: '4px 10px', borderRadius: 8, fontSize: '0.8rem', fontWeight: 600 }}>{q.level}</span>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {editingId === q.id ? (
                    <>
                      <button onClick={() => setEditingId(null)} style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid #e2e8f0', background: 'white', color: '#64748b', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}><X size={14}/> Hủy</button>
                      <button onClick={() => handleSaveEdit(q.id)} style={{ padding: '6px 12px', borderRadius: 8, border: 'none', background: '#22c55e', color: 'white', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}><Save size={14}/> Lưu</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => handleEditClick(q)} style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#f8fafc', color: '#475569', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}><Edit size={14}/> Sửa</button>
                      <button onClick={() => handleUseQuestion(q)} style={{ padding: '6px 12px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: 'white', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}><Copy size={14}/> Sử dụng</button>
                    </>
                  )}
                </div>
              </div>

              {editingId === q.id ? (
                <textarea 
                  value={editForm.content} 
                  onChange={e => setEditForm({...editForm, content: e.target.value})} 
                  style={{ width: '100%', minHeight: 80, padding: 12, borderRadius: 8, border: '2px solid #3b82f6', outline: 'none', fontSize: '1rem', marginBottom: 16, fontFamily: 'inherit' }}
                />
              ) : (
                <p style={{ fontSize: '1.1rem', fontWeight: 600, color: '#1e293b', marginBottom: 20, lineHeight: 1.5 }}>Câu {i+1}: {q.content}</p>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {JSON.parse(q.options || '[]').map((opt, idx) => (
                  <div key={idx} style={{ padding: '12px', background: q.correct_answer == opt ? '#dcfce7' : '#f8fafc', borderRadius: 8, border: `1px solid ${q.correct_answer == opt ? '#22c55e' : '#e2e8f0'}`, fontWeight: 500 }}>
                    {opt}
                  </div>
                ))}
              </div>

              {(q.explanation || editingId === q.id) && (
                <div style={{ marginTop: 16, padding: 16, background: '#fffbeb', borderRadius: 8, border: '1px solid #fde68a', fontSize: '0.9rem', color: '#92400e' }}>
                  <strong><Zap size={16} style={{ display: 'inline', verticalAlign: 'text-bottom' }} /> Giải thích:</strong> 
                  {editingId === q.id ? (
                    <input 
                      value={editForm.explanation} 
                      onChange={e => setEditForm({...editForm, explanation: e.target.value})} 
                      style={{ width: '100%', marginTop: 8, padding: 8, borderRadius: 6, border: '1px solid #fcd34d', outline: 'none', background: 'white' }}
                    />
                  ) : (
                    <span style={{ marginLeft: 8 }}>{q.explanation}</span>
                  )}
                </div>
              )}
            </div>
          ))}
          {questions.length === 0 && (
            <div style={{ textAlign: 'center', padding: 40, background: '#f8fafc', borderRadius: 16 }}>Chưa có câu hỏi nào trong ngân hàng.</div>
          )}
        </div>
      )}
    </div>
  );
};

export default TeacherQuestionBank;
