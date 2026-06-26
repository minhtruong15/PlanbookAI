import React, { useState, useEffect, useRef } from 'react';
import { Database, Search, Filter, Plus, Upload, CheckCircle, Edit, Trash2 } from 'lucide-react';

// Sử dụng KaTeX trực tiếp từ CDN đã nạp trong index.html
const MathText = ({ children, ...props }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current && window.renderMathInElement) {
      window.renderMathInElement(containerRef.current, {
        delimiters: [
          { left: '$$', right: '$$', display: true },
          { left: '$', right: '$', display: false }
        ]
      });
    }
  }, [children]);

  return <span ref={containerRef} {...props}>{children}</span>;
};

const QuestionBankStaff = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSubject, setActiveSubject] = useState('All');
  const [questions, setQuestions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [newQuestion, setNewQuestion] = useState({ 
    content: '', subject: 'Toán học', grade: 'Lớp 10', level: 'Nhận biết',
    options: ['','','',''], correct_answer: 'A', explanation: ''
  });

  // Fetch real-time data
  const fetchData = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/question/questions', {
        headers: { 'Authorization': `Bearer ${sessionStorage.getItem('accessToken')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setQuestions(data);
      }
    } catch (e) {
      console.log('Error fetching questions', e);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); // Tự động làm mới mỗi 5 giây
    return () => clearInterval(interval);
  }, []);

  const handleSave = async () => {
    if (!newQuestion.content) return alert('Vui lòng nhập nội dung câu hỏi!');
    
    // Convert options array to JSON string for backend
    const payload = {
      ...newQuestion,
      options: JSON.stringify(newQuestion.options)
    };

    try {
      const url = editingId ? `http://localhost:8000/api/question/questions/${editingId}` : 'http://localhost:8000/api/question/questions';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method: method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setShowForm(false);
        setEditingId(null);
        setNewQuestion({ content: '', subject: 'Toán học', grade: 'Lớp 10', level: 'Nhận biết', options: ['','','',''], correct_answer: 'A', explanation: '' });
        fetchData();
      } else {
        const errText = await res.text();
        alert('Lỗi lưu câu hỏi: ' + errText);
      }
    } catch (e) {
      alert('Lỗi kết nối lưu câu hỏi: ' + e.message);
    }
  };

  const handleEdit = (q) => {
    let parsedOptions = ['','','',''];
    try { parsedOptions = JSON.parse(q.options); } catch(e) {}
    setNewQuestion({
      content: q.content, subject: q.subject, grade: q.grade, level: q.level,
      options: parsedOptions, correct_answer: q.correct_answer, explanation: q.explanation || ''
    });
    setEditingId(q.id);
    setShowForm(true);
  };

  const handleApprove = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'Bản nháp' ? 'Chờ duyệt' : 'Đã duyệt';
    try {
      const res = await fetch(`http://localhost:8000/api/question/questions/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ status: nextStatus })
      });
      if (res.ok) fetchData();
    } catch (e) {}
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Xóa câu hỏi này?')) return;
    try {
      const res = await fetch(`http://localhost:8000/api/question/questions/${id}`, { 
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${sessionStorage.getItem('accessToken')}` }
      });
      if (res.ok) fetchData();
    } catch (e) {}
  };

  const handleAIGenerate = () => {
    // Mô phỏng AI sinh câu hỏi nhanh
    const promptText = window.prompt("Nhập từ khóa chủ đề (VD: Logarit, Đạo hàm, DNA...):");
    if (!promptText) return;

    setShowForm(true);
    setNewQuestion({
      content: `Cho phương trình $\\log_2(x) + \\log_2(x-3) = 2$. Nghiệm của phương trình là:`,
      subject: 'Toán học',
      grade: 'Lớp 12',
      level: 'Thông hiểu',
      options: ['x = 4', 'x = -1', 'x = 4 hoặc x = -1', 'Vô nghiệm'],
      correct_answer: 'A',
      explanation: `Điều kiện: $x > 3$.\n Phương trình tương đương $\\log_2[x(x-3)] = 2 \\Rightarrow x^2 - 3x - 4 = 0$.\n Giải ra $x=4$ (thỏa mãn) hoặc $x=-1$ (loại).`
    });
  };

  const filteredQuestions = questions.filter(q => 
    (activeSubject === 'All' || q.subject === activeSubject) &&
    q.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="page-container" style={{ background: '#f8fafc', minHeight: '100vh', padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, background: 'linear-gradient(135deg, #312e81 0%, #4f46e5 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'flex', alignItems: 'center', gap: 12 }}>
            <Database size={32} color="#4f46e5" /> Ngân hàng Câu hỏi
          </h1>
          <p style={{ color: '#64748b', fontSize: '1rem', marginTop: 8 }}>Quản lý kho dữ liệu câu hỏi khổng lồ làm nguồn tri thức cho AI.</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 20px', borderRadius: 12, background: 'white', border: '1px solid #e2e8f0', color: '#4f46e5', fontWeight: 600, cursor: 'pointer' }}>
            <Upload size={20}/> Nhập từ Excel
          </button>
          <button onClick={handleAIGenerate} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 20px', borderRadius: 12, background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', boxShadow: '0 4px 6px rgba(245, 158, 11, 0.2)', border: 'none', color: 'white', fontWeight: 600, cursor: 'pointer' }}>
            ✨ AI Tạo Nhanh
          </button>
          <button onClick={() => setShowForm(!showForm)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 24px', borderRadius: 12, background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)', boxShadow: '0 4px 6px rgba(79, 70, 229, 0.2)', border: 'none', color: 'white', cursor: 'pointer' }}>
            <Plus size={20}/> Thêm Câu hỏi
          </button>
        </div>
      </div>

      {showForm && (
        <div style={{ background: 'white', padding: 24, borderRadius: 16, marginBottom: 24, border: '1px solid #e2e8f0', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
          <h3 style={{ marginBottom: 16, fontSize: '1.2rem', fontWeight: 700 }}>{editingId ? 'Chỉnh sửa Câu hỏi' : 'Thêm Câu hỏi mới'}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
             <div>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Môn học</label>
                <select value={newQuestion.subject} onChange={e => setNewQuestion({...newQuestion, subject: e.target.value})} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #e2e8f0' }}>
                  <option>Toán học</option><option>Vật lý</option><option>Hóa học</option><option>Tiếng Anh</option>
                </select>
             </div>
             <div>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Khối lớp</label>
                <select value={newQuestion.grade} onChange={e => setNewQuestion({...newQuestion, grade: e.target.value})} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #e2e8f0' }}>
                  <option>Lớp 10</option><option>Lớp 11</option><option>Lớp 12</option>
                </select>
             </div>
             <div>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Mức độ</label>
                <select value={newQuestion.level} onChange={e => setNewQuestion({...newQuestion, level: e.target.value})} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #e2e8f0' }}>
                  <option>Nhận biết</option><option>Thông hiểu</option><option>Vận dụng</option><option>Vận dụng cao</option>
                </select>
             </div>
          </div>
          <div style={{ marginBottom: 16 }}>
             <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Nội dung Câu hỏi (Hỗ trợ định dạng Toán học bằng dấu $)</label>
             <textarea value={newQuestion.content} onChange={e => setNewQuestion({...newQuestion, content: e.target.value})} placeholder="Nhập câu hỏi... VD: Giải phương trình $x^2 - 4 = 0$" style={{ width: '100%', height: 100, padding: 12, borderRadius: 8, border: '1px solid #e2e8f0', resize: 'vertical' }}></textarea>
          </div>
          
          {/* Options */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            {['A', 'B', 'C', 'D'].map((opt, idx) => (
              <div key={opt}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Đáp án {opt}</label>
                <input 
                  value={newQuestion.options[idx]} 
                  onChange={e => {
                    const newOpts = [...newQuestion.options];
                    newOpts[idx] = e.target.value;
                    setNewQuestion({...newQuestion, options: newOpts});
                  }}
                  type="text" 
                  placeholder={`Nhập đáp án ${opt}...`} 
                  style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #e2e8f0' }} 
                />
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: 16, marginBottom: 24 }}>
             <div>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Đáp án Đúng</label>
                <select value={newQuestion.correct_answer} onChange={e => setNewQuestion({...newQuestion, correct_answer: e.target.value})} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #e2e8f0' }}>
                  <option value="A">Đáp án A</option>
                  <option value="B">Đáp án B</option>
                  <option value="C">Đáp án C</option>
                  <option value="D">Đáp án D</option>
                </select>
             </div>
             <div>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Lời giải chi tiết</label>
                <textarea value={newQuestion.explanation} onChange={e => setNewQuestion({...newQuestion, explanation: e.target.value})} placeholder="Nhập lời giải..." style={{ width: '100%', height: 60, padding: 12, borderRadius: 8, border: '1px solid #e2e8f0', resize: 'vertical' }}></textarea>
             </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
             <button onClick={() => { setShowForm(false); setEditingId(null); }} style={{ padding: '10px 20px', borderRadius: 8, background: '#f1f5f9', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Hủy</button>
             <button onClick={handleSave} style={{ padding: '10px 20px', borderRadius: 8, background: '#4f46e5', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 600 }}>{editingId ? 'Cập nhật Câu hỏi' : 'Lưu Câu hỏi'}</button>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, background: 'white', padding: '16px 24px', borderRadius: 16, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
           <div style={{ position: 'relative', width: 300 }}>
              <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: 14, top: 12 }} />
              <input type="text" placeholder="Tìm kiếm nội dung câu hỏi..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{ width: '100%', padding: '10px 14px 10px 40px', borderRadius: 10, border: '1px solid #e2e8f0', outline: 'none' }} />
           </div>
           <div style={{ width: 1, height: 24, background: '#e2e8f0', margin: '0 8px' }}></div>
           {['All', 'Toán học', 'Vật lý', 'Hóa học'].map(subj => (
             <button key={subj} onClick={() => setActiveSubject(subj)} style={{ padding: '8px 16px', borderRadius: 20, border: 'none', background: activeSubject === subj ? '#4f46e5' : '#f1f5f9', color: activeSubject === subj ? 'white' : '#64748b', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>{subj}</button>
           ))}
        </div>
        <button style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 10, border: '1px solid #e2e8f0', background: 'white', color: '#475569', cursor: 'pointer', fontWeight: 500 }}>
          <Filter size={18} /> Lọc nâng cao
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {filteredQuestions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>Chưa có câu hỏi nào.</div>
        ) : (
          filteredQuestions.map((q) => (
            <div key={q.id} style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
              <div style={{ flex: 1 }}>
                 <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                   <span style={{ padding: '4px 10px', background: '#e0e7ff', color: '#4338ca', borderRadius: 6, fontSize: '0.75rem', fontWeight: 700 }}>{q.subject}</span>
                   <span style={{ padding: '4px 10px', background: '#f1f5f9', color: '#475569', borderRadius: 6, fontSize: '0.75rem', fontWeight: 600 }}>{q.grade}</span>
                   <span style={{ padding: '4px 10px', background: q.level === 'Nhận biết' ? '#dcfce7' : q.level === 'Thông hiểu' ? '#fef08a' : '#ffedd5', color: q.level === 'Nhận biết' ? '#166534' : q.level === 'Thông hiểu' ? '#854d0e' : '#c2410c', borderRadius: 6, fontSize: '0.75rem', fontWeight: 700 }}>{q.level}</span>
                 </div>
                 <MathText style={{ fontSize: '1.1rem', fontWeight: 500, color: '#1e293b' }}>{q.content}</MathText>
                 
                 {q.options && (
                   <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 16 }}>
                     {(() => {
                       try {
                         const opts = JSON.parse(q.options);
                         return ['A', 'B', 'C', 'D'].map((char, i) => (
                           <div key={char} style={{ padding: '8px 12px', background: q.correct_answer === char ? '#dcfce7' : '#f8fafc', border: `1px solid ${q.correct_answer === char ? '#4ade80' : '#e2e8f0'}`, borderRadius: 8, display: 'flex', gap: 8 }}>
                             <strong style={{ color: q.correct_answer === char ? '#166534' : '#475569' }}>{char}.</strong>
                             <MathText style={{ color: q.correct_answer === char ? '#166534' : '#334155' }}>{opts[i] || ''}</MathText>
                           </div>
                         ));
                       } catch(e) { return null; }
                     })()}
                   </div>
                 )}

                 {q.explanation && (
                   <div style={{ marginTop: 12, padding: 12, background: '#fef9c3', borderRadius: 8, border: '1px solid #fef08a' }}>
                     <strong style={{ display: 'block', marginBottom: 4, color: '#854d0e', fontSize: '0.85rem' }}>Lời giải:</strong>
                     <MathText style={{ color: '#713f12', fontSize: '0.9rem' }}>{q.explanation}</MathText>
                   </div>
                 )}

                 <div style={{ display: 'flex', gap: 16, marginTop: 16, color: '#94a3b8', fontSize: '0.85rem' }}>
                   <span>Người tạo: {q.author || 'Hệ thống'}</span>
                   <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: q.status === 'Đã duyệt' ? '#10b981' : '#ef4444' }}>
                     <CheckCircle size={14}/> {q.status || 'Bản nháp'}
                   </span>
                 </div>
              </div>
              <div style={{ display: 'flex', gap: 8, marginLeft: 24 }}>
                {(!q.status || q.status === 'Bản nháp') && (
                  <button onClick={() => handleApprove(q.id, q.status || 'Bản nháp')} style={{ padding: '6px 12px', background: '#4f46e5', border: 'none', borderRadius: 6, cursor: 'pointer', color: 'white', fontSize: '0.8rem', fontWeight: 600 }}>Gửi duyệt</button>
                )}
                <button onClick={() => handleEdit(q)} style={{ padding: 10, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, cursor: 'pointer', color: '#4f46e5' }}><Edit size={18}/></button>
                <button onClick={() => handleDelete(q.id)} style={{ padding: 10, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, cursor: 'pointer', color: '#ef4444' }}><Trash2 size={18}/></button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default QuestionBankStaff;
