import React, { useState, useEffect } from 'react';
import { CheckSquare, CheckCircle, XCircle, Eye, FileText, Database } from 'lucide-react';

const ContentApproval = () => {
  const [activeTab, setActiveTab] = useState('templates'); // 'templates' | 'questions'
  const [templates, setTemplates] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchTemplates = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/lesson/templates', {
        headers: { 'Authorization': `Bearer ${sessionStorage.getItem('accessToken')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTemplates(data.filter(t => t.status === 'Chờ duyệt'));
      }
    } catch (e) {
      console.log('Error fetching templates', e);
    }
  };

  const fetchQuestions = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/question/questions', {
        headers: { 'Authorization': `Bearer ${sessionStorage.getItem('accessToken')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setQuestions(data.filter(q => q.status === 'Chờ duyệt'));
      }
    } catch (e) {
      console.log('Error fetching questions', e);
    }
  };

  useEffect(() => {
    fetchTemplates();
    fetchQuestions();
    const interval = setInterval(() => {
      fetchTemplates();
      fetchQuestions();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleApproveTemplate = async (id, isApproved) => {
    const nextStatus = isApproved ? 'Đã duyệt' : 'Bản nháp'; // Từ chối trả về Bản nháp
    try {
      const res = await fetch(`http://localhost:8000/api/lesson/templates/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ status: nextStatus })
      });
      if (res.ok) fetchTemplates();
    } catch (e) {
      alert('Lỗi khi duyệt giáo án');
    }
  };

  const handleApproveQuestion = async (id, isApproved) => {
    const nextStatus = isApproved ? 'Đã duyệt' : 'Bản nháp';
    try {
      const res = await fetch(`http://localhost:8000/api/question/questions/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ status: nextStatus })
      });
      if (res.ok) fetchQuestions();
    } catch (e) {
      alert('Lỗi khi duyệt câu hỏi');
    }
  };

  return (
    <div className="page-container" style={{ background: '#f8fafc', minHeight: '100vh', padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, background: 'linear-gradient(135deg, #047857 0%, #10b981 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'flex', alignItems: 'center', gap: 12 }}>
            <CheckSquare size={32} color="#059669" /> Phê duyệt Nội dung
          </h1>
          <p style={{ color: '#64748b', fontSize: '1rem', marginTop: 8 }}>Kiểm duyệt Giáo án Mẫu và Ngân hàng Câu hỏi từ đội ngũ Staff.</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24, background: 'white', padding: '8px', borderRadius: 16, width: 'fit-content', border: '1px solid #e2e8f0' }}>
        <button 
          onClick={() => setActiveTab('templates')}
          style={{ padding: '12px 24px', borderRadius: 12, border: 'none', background: activeTab === 'templates' ? '#ecfdf5' : 'transparent', color: activeTab === 'templates' ? '#047857' : '#64748b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', transition: 'all 0.2s' }}>
          <FileText size={18} /> Giáo án Mẫu ({templates.length})
        </button>
        <button 
          onClick={() => setActiveTab('questions')}
          style={{ padding: '12px 24px', borderRadius: 12, border: 'none', background: activeTab === 'questions' ? '#ecfdf5' : 'transparent', color: activeTab === 'questions' ? '#047857' : '#64748b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', transition: 'all 0.2s' }}>
          <Database size={18} /> Ngân hàng Câu hỏi ({questions.length})
        </button>
      </div>

      {/* Content Area */}
      <div style={{ background: 'white', borderRadius: 24, padding: 32, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)', border: '1px solid #e2e8f0' }}>
        
        {activeTab === 'templates' && (
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1e293b', marginBottom: 24 }}>Danh sách Giáo án Mẫu chờ duyệt</h3>
            {templates.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>Không có giáo án nào đang chờ duyệt.</div>
            ) : (
              <div style={{ display: 'grid', gap: 16 }}>
                {templates.map(t => (
                  <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 20, border: '1px solid #e2e8f0', borderRadius: 16, background: '#f8fafc' }}>
                    <div>
                      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                        <span style={{ padding: '4px 10px', background: '#e0e7ff', color: '#4338ca', borderRadius: 6, fontSize: '0.75rem', fontWeight: 700 }}>{t.subject}</span>
                        <span style={{ padding: '4px 10px', background: '#f1f5f9', color: '#475569', borderRadius: 6, fontSize: '0.75rem', fontWeight: 600 }}>{t.grade}</span>
                      </div>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#1e293b', marginBottom: 4 }}>{t.title}</h4>
                      <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Người tạo: {t.author} • Ngày gửi: {new Date(t.created_at).toLocaleDateString()}</p>
                    </div>
                    <div style={{ display: 'flex', gap: 12 }}>
                      <button onClick={() => alert('Chức năng xem chi tiết đang phát triển')} style={{ padding: '10px 16px', background: 'white', border: '1px solid #e2e8f0', borderRadius: 10, cursor: 'pointer', color: '#475569', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 500 }}>
                        <Eye size={18}/> Xem
                      </button>
                      <button onClick={() => handleApproveTemplate(t.id, false)} style={{ padding: '10px 16px', background: '#fee2e2', border: 'none', borderRadius: 10, cursor: 'pointer', color: '#ef4444', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
                        <XCircle size={18}/> Từ chối
                      </button>
                      <button onClick={() => handleApproveTemplate(t.id, true)} style={{ padding: '10px 16px', background: '#10b981', border: 'none', borderRadius: 10, cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
                        <CheckCircle size={18}/> Duyệt ngay
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'questions' && (
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1e293b', marginBottom: 24 }}>Danh sách Câu hỏi chờ duyệt</h3>
            {questions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>Không có câu hỏi nào đang chờ duyệt.</div>
            ) : (
              <div style={{ display: 'grid', gap: 16 }}>
                {questions.map(q => (
                  <div key={q.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 20, border: '1px solid #e2e8f0', borderRadius: 16, background: '#f8fafc' }}>
                    <div style={{ flex: 1, paddingRight: 24 }}>
                      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                        <span style={{ padding: '4px 10px', background: '#e0e7ff', color: '#4338ca', borderRadius: 6, fontSize: '0.75rem', fontWeight: 700 }}>{q.subject}</span>
                        <span style={{ padding: '4px 10px', background: '#f1f5f9', color: '#475569', borderRadius: 6, fontSize: '0.75rem', fontWeight: 600 }}>{q.grade}</span>
                        <span style={{ padding: '4px 10px', background: q.level === 'Nhận biết' ? '#dcfce7' : q.level === 'Thông hiểu' ? '#fef08a' : '#ffedd5', color: q.level === 'Nhận biết' ? '#166534' : q.level === 'Thông hiểu' ? '#854d0e' : '#c2410c', borderRadius: 6, fontSize: '0.75rem', fontWeight: 700 }}>{q.level}</span>
                      </div>
                      <p style={{ fontSize: '1rem', fontWeight: 500, color: '#1e293b', marginBottom: 12 }}>{q.content}</p>
                      
                      {q.options && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                          {(() => {
                            try {
                              const opts = JSON.parse(q.options);
                              return ['A', 'B', 'C', 'D'].map((char, i) => (
                                <div key={char} style={{ padding: '8px 12px', background: q.correct_answer === char ? '#dcfce7' : 'white', border: `1px solid ${q.correct_answer === char ? '#4ade80' : '#e2e8f0'}`, borderRadius: 8, display: 'flex', gap: 8 }}>
                                  <strong style={{ color: q.correct_answer === char ? '#166534' : '#475569' }}>{char}.</strong>
                                  <span style={{ color: q.correct_answer === char ? '#166534' : '#334155' }}>{opts[i] || ''}</span>
                                </div>
                              ));
                            } catch(e) { return null; }
                          })()}
                        </div>
                      )}
                      <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: 12 }}>Người tạo: {q.author} • Ngày gửi: {new Date(q.created_at).toLocaleDateString()}</p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <button onClick={() => handleApproveQuestion(q.id, true)} style={{ padding: '12px 20px', background: '#10b981', border: 'none', borderRadius: 10, cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontWeight: 600 }}>
                        <CheckCircle size={18}/> Duyệt câu hỏi
                      </button>
                      <button onClick={() => handleApproveQuestion(q.id, false)} style={{ padding: '12px 20px', background: '#fee2e2', border: 'none', borderRadius: 10, cursor: 'pointer', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontWeight: 600 }}>
                        <XCircle size={18}/> Từ chối
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default ContentApproval;
