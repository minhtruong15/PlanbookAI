import React, { useState, useEffect } from 'react';
import { 
  UploadCloud, FileType, CheckCircle, Loader, Layers, Zap, 
  RotateCcw, UserCheck, FileWarning, ExternalLink, X, List, 
  Search, Filter, ChevronRight, AlertCircle, Info, TrendingUp,
  FileText, Users, GraduationCap, Download, Share2, Clipboard,
  BarChart3, PieChart, ArrowUpRight, Eye, Clock
} from 'lucide-react';

// Safe JSON Parse Helper
const safeParse = (str, fallback = {}) => {
  if (!str) return fallback;
  if (typeof str === 'object') return str;
  try {
    return JSON.parse(str);
  } catch (e) {
    console.error("JSON parse error:", e);
    return fallback;
  }
};

// MathText for Review
const MathText = ({ children, className = "" }) => {
  const containerRef = React.useRef(null);
  useEffect(() => {
    if (containerRef.current && window.renderMathInElement) {
      window.renderMathInElement(containerRef.current, {
        delimiters: [
          { left: "$$", right: "$$", display: true },
          { left: "$", right: "$", display: false }
        ],
        throwOnError: false
      });
    }
  }, [children]);
  return <div ref={containerRef} className={className}>{children}</div>;
};

const OcrGrading = () => {
  const [view, setView] = useState('selection'); 
  const [isProcessing, setIsProcessing] = useState(false);
  const [processProgress, setProcessProgress] = useState(0);
  const [submissions, setSubmissions] = useState([]);
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null); 

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/exam/exams', {
        headers: { 'Authorization': `Bearer ${sessionStorage.getItem('accessToken')}` }
      });
      const data = await response.json();
      if (Array.isArray(data)) setExams(data);
    } catch (err) { console.error(err); }
  };

  const handleExamChange = async (examId) => {
    const exam = exams.find(ex => ex.id == examId);
    setSelectedExam(exam);
    if (!exam) return;

    // Fetch real submissions for this exam
    try {
      const response = await fetch(`http://localhost:8000/api/exam/exams/${examId}/submissions`);
      const data = await response.json();
      setSubmissions(data.map(s => ({ ...s, status: s.score > 0 ? 'success' : 'waiting' })));
      setView('grading');
    } catch (err) { console.error(err); }
  };

  const startAutoGrading = async () => {
    if (!selectedExam || submissions.length === 0) return;
    setIsProcessing(true);
    setProcessProgress(0);
    
    const examContent = safeParse(selectedExam.content);
    const questions = examContent.questions || [];
    
    for (let i = 0; i < submissions.length; i++) {
      const sub = submissions[i];
      // Mark as processing
      setSubmissions(prev => prev.map((s, idx) => idx === i ? { ...s, status: 'processing' } : s));
      
      // Calculate score
      let correctCount = 0;
      questions.forEach(q => {
        if (sub.answers[q.id] === q.correct) correctCount++;
      });
      
      const finalScore = questions.length > 0 ? ((correctCount / questions.length) * 10).toFixed(1) : 0;

      // Update backend
      try {
        await fetch(`http://localhost:8000/api/exam/submissions/${sub.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            score: finalScore, 
            correct_count: correctCount, 
            total_questions: questions.length, 
            status: 'success' 
          })
        });
      } catch (e) { console.error(e); }

      // Update local state
      setSubmissions(prev => prev.map((s, idx) => idx === i ? { 
        ...s, 
        status: 'success', 
        score: finalScore,
        correct_count: correctCount,
        total_questions: questions.length
      } : s));
      setProcessProgress(Math.round(((i + 1) / submissions.length) * 100));
      
      // Add small delay for visual effect
      await new Promise(r => setTimeout(r, 500));
    }
    
    setIsProcessing(false);
  };

  const getRankColor = (score) => {
    if (score >= 9) return { label: 'Giỏi', color: '#059669', bg: '#dcfce7' };
    if (score >= 7) return { label: 'Khá', color: '#d97706', bg: '#fef3c7' };
    if (score >= 5) return { label: 'Đạt', color: '#2563eb', bg: '#dbeafe' };
    return { label: 'Cần cố gắng', color: '#ef4444', bg: '#fee2e2' };
  };

  const renderSelection = () => (
    <div className="animate-fade-in">
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
         <h1 style={{ fontSize: '2.5rem', fontWeight: 900, background: 'linear-gradient(135deg, #1e293b 0%, #6366f1 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 16 }}>Hệ thống Chấm điểm Tự động</h1>
         <p style={{ color: '#64748b', fontSize: '1.1rem', maxWidth: 600, margin: '0 auto' }}>Dữ liệu thật, chấm điểm Real-time dựa trên đáp án của giáo viên.</p>
      </div>

      <div style={{ maxWidth: 600, margin: '0 auto', background: 'white', padding: 40, borderRadius: 32, border: '1px solid #e2e8f0', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05)' }}>
         <label style={{ display: 'block', fontWeight: 800, marginBottom: 16, color: '#1e293b' }}>Chọn bài kiểm tra cần chấm điểm:</label>
         <select className="input-field" style={{ width: '100%', padding: '16px', borderRadius: 12, marginBottom: 24, fontSize: '1rem', border: '2px solid #f1f5f9' }} onChange={(e) => handleExamChange(e.target.value)}>
            <option value="">-- Danh sách đề thi đã tạo --</option>
            {exams.map(ex => <option key={ex.id} value={ex.id}>{ex.title} ({ex.grade})</option>)}
         </select>
         <div style={{ display: 'flex', gap: 16, background: '#f8fafc', padding: 20, borderRadius: 20, border: '1px solid #e2e8f0' }}>
            <Info color="#6366f1" size={24}/>
            <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.6 }}>Hệ thống sẽ lấy toàn bộ bài làm của học sinh từ mục <strong>Kiểm tra bài làm</strong> để tiến hành đối chiếu đáp án.</p>
         </div>
      </div>
    </div>
  );

  const renderGradingDashboard = () => (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
         <div>
            <button onClick={() => setView('selection')} style={{ border: 'none', background: 'none', color: '#6366f1', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}><ChevronRight size={18} style={{ transform: 'rotate(180deg)' }}/> Quay lại</button>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 900 }}>Tiến trình Chấm bài: {selectedExam.title}</h2>
         </div>
         <button className="btn-primary" onClick={startAutoGrading} disabled={isProcessing || submissions.length === 0} style={{ padding: '14px 32px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            {isProcessing ? <Loader className="spin" size={20}/> : <><Zap size={18}/> Bắt đầu Chấm tự động</>}
         </button>
      </div>

      <div style={{ background: '#f8fafc', padding: 24, borderRadius: 24, marginBottom: 32, border: '1px solid #e2e8f0' }}>
         <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontWeight: 700 }}>
            <span>{isProcessing ? 'Đang đối chiếu đáp án...' : 'Sẵn sàng chấm điểm'}</span>
            <span>{processProgress}% ({submissions.filter(s => s.status === 'success').length}/{submissions.length} bài)</span>
         </div>
         <div style={{ width: '100%', height: 12, background: '#e2e8f0', borderRadius: 10, overflow: 'hidden' }}>
            <div style={{ width: `${processProgress}%`, height: '100%', background: 'linear-gradient(90deg, #6366f1, #a855f7)', transition: 'all 0.5s' }}></div>
         </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
         {submissions.map(sub => (
           <div key={sub.id} className="glass-panel" style={{ padding: 20, borderRadius: 20, border: `2px solid ${sub.status === 'success' ? '#dcfce7' : '#f1f5f9'}`, background: 'white' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                 <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1e293b' }}>{sub.student_name}</div>
                 {sub.status === 'success' ? <CheckCircle size={18} color="#059669"/> : sub.status === 'processing' ? <Loader className="spin" size={18} color="#6366f1"/> : <Clock size={18} color="#94a3b8"/>}
              </div>
              {sub.score > 0 || sub.status === 'success' ? (
                <div>
                   <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#6366f1' }}>{sub.score}đ</div>
                   <div style={{ fontSize: '0.75rem', color: '#64748b' }}>SBD: {sub.student_id}</div>
                </div>
              ) : (
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Chờ chấm...</div>
              )}
           </div>
         ))}
      </div>

      {!isProcessing && submissions.some(s => s.score > 0) && (
        <div style={{ marginTop: 48, textAlign: 'center' }}>
           <button className="btn-primary" onClick={() => setView('results')} style={{ padding: '18px 48px', borderRadius: 16, fontSize: '1.1rem' }}>Xem Bảng điểm & Soi lỗi chi tiết</button>
        </div>
      )}
    </div>
  );

  const renderResults = () => {
    const successFiles = submissions.filter(s => s.status === 'success');
    const avgScore = successFiles.length > 0 
      ? (successFiles.reduce((acc, f) => acc + Number(f.score), 0) / successFiles.length).toFixed(1)
      : "0.0";
    
    return (
      <div className="animate-fade-in">
         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
            <button onClick={() => setView('grading')} style={{ border: 'none', background: 'none', color: '#6366f1', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}><ChevronRight size={18} style={{ transform: 'rotate(180deg)' }}/> Quay lại tiến trình</button>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 900 }}>Bảng điểm chi tiết: {selectedExam.title}</h2>
         </div>
         
         {/* Summary Stats */}
         <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24, marginBottom: 40 }}>
            <div className="glass-panel" style={{ padding: 24, borderRadius: 24, background: 'linear-gradient(135deg, #6366f1, #818cf8)', color: 'white' }}>
               <div style={{ fontSize: '0.85rem', fontWeight: 600, opacity: 0.8 }}>Điểm trung bình</div>
               <div style={{ fontSize: '2rem', fontWeight: 900 }}>{avgScore}</div>
            </div>
            <div className="glass-panel" style={{ padding: 24, borderRadius: 24, background: '#dcfce7', border: '1px solid #bbf7d0' }}>
               <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#059669' }}>Tỷ lệ Đạt (&ge; 5)</div>
               <div style={{ fontSize: '2rem', fontWeight: 900, color: '#065f46' }}>{submissions.length > 0 ? Math.round((submissions.filter(s => s.score >= 5).length / submissions.length) * 100) : 0}%</div>
            </div>
            <div className="glass-panel" style={{ padding: 24, borderRadius: 24, background: '#fef3c7', border: '1px solid #fde68a' }}>
               <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#d97706' }}>Cần phụ đạo</div>
               <div style={{ fontSize: '2rem', fontWeight: 900, color: '#92400e' }}>{submissions.filter(s => s.score < 5).length} em</div>
            </div>
            <div className="glass-panel" style={{ padding: 24, borderRadius: 24, background: 'white', border: '1px solid #e2e8f0' }}>
               <button className="btn-secondary" style={{ width: '100%', padding: '14px', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}><Download size={18}/> Xuất Sổ điểm</button>
            </div>
         </div>

         <div style={{ background: 'white', borderRadius: 24, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
               <thead style={{ background: '#f8fafc' }}>
                  <tr>
                     <th style={{ textAlign: 'left', padding: '20px 32px' }}>HỌ TÊN HỌC SINH</th>
                     <th style={{ textAlign: 'left', padding: '20px 32px' }}>SỐ BÁO DANH</th>
                     <th style={{ textAlign: 'center', padding: '20px 32px' }}>ĐIỂM SỐ</th>
                     <th style={{ textAlign: 'center', padding: '20px 32px' }}>PHÂN LOẠI</th>
                     <th style={{ textAlign: 'right', padding: '20px 32px' }}>THAO TÁC</th>
                  </tr>
               </thead>
               <tbody>
                  {submissions.map((s, i) => {
                    const rank = getRankColor(s.score);
                    return (
                      <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                         <td style={{ padding: '20px 32px', fontWeight: 700 }}>{s.student_name}</td>
                         <td style={{ padding: '20px 32px', color: '#64748b' }}>{s.student_id}</td>
                         <td style={{ padding: '20px 32px', textAlign: 'center' }}>
                            <div style={{ fontSize: '1.2rem', fontWeight: 900, color: rank.color }}>{s.score}đ</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Đúng {s.correct_count}/{s.total_questions} câu</div>
                         </td>
                         <td style={{ padding: '20px 32px', textAlign: 'center' }}>
                            <span style={{ background: rank.bg, color: rank.color, padding: '6px 16px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 800 }}>{rank.label}</span>
                         </td>
                         <td style={{ padding: '20px 32px', textAlign: 'right' }}>
                            <button className="btn-secondary" onClick={() => setSelectedStudent(s)} style={{ fontSize: '0.75rem', padding: '8px 16px', borderRadius: 8 }}>Soi lỗi bài làm <Eye size={14} style={{ marginLeft: 6 }}/></button>
                         </td>
                      </tr>
                    );
                  })}
               </tbody>
            </table>
         </div>
      </div>
    );
  };

  const renderErrorSheet = () => {
    if (!selectedStudent || !selectedExam) return null;
    const examContent = safeParse(selectedExam.content);

    return (
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
        <div className="glass-panel animate-scale-up" style={{ background: 'white', width: '100%', maxWidth: 1000, maxHeight: '90vh', borderRadius: 32, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
           <div style={{ padding: '32px 40px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
              <div>
                 <h2 style={{ fontSize: '1.5rem', fontWeight: 900 }}>Soi lỗi chi tiết: {selectedStudent.student_name}</h2>
                 <p style={{ color: '#64748b' }}>SBD: {selectedStudent.student_id} • Điểm: <strong style={{ color: '#6366f1' }}>{selectedStudent.score}đ</strong></p>
              </div>
              <button onClick={() => setSelectedStudent(null)} className="icon-btn"><X size={24}/></button>
           </div>

           <div style={{ flex: 1, padding: 40, overflowY: 'auto', display: 'grid', gridTemplateColumns: '250px 1fr', gap: 40 }}>
              <div>
                 <h4 style={{ marginBottom: 20, fontWeight: 800 }}>Bản đồ Đáp án</h4>
                 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                    {examContent.questions?.map((q, idx) => {
                      const isCorrect = selectedStudent.answers[q.id] === q.correct;
                      return (
                        <div key={idx} style={{ 
                          width: 44, height: 44, borderRadius: 12, 
                          background: isCorrect ? '#dcfce7' : '#fee2e2', 
                          color: isCorrect ? '#059669' : '#ef4444', 
                          border: `2px solid ${isCorrect ? '#bbf7d0' : '#fecaca'}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center', 
                          fontWeight: 800, fontSize: '0.9rem' 
                        }}>
                          {idx + 1}
                        </div>
                      );
                    })}
                 </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                 {examContent.questions?.map((q, idx) => {
                    const studentChoice = selectedStudent.answers[q.id];
                    const isCorrect = studentChoice === q.correct;
                    
                    return (
                      <div key={idx} style={{ padding: 24, background: '#f8fafc', borderRadius: 20, border: `1px solid ${isCorrect ? '#e2e8f0' : '#fca5a5'}`, opacity: isCorrect ? 0.6 : 1 }}>
                         <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                            <span style={{ fontWeight: 800, color: isCorrect ? '#059669' : '#ef4444' }}>Câu {idx + 1} {isCorrect ? '(ĐÚNG)' : '(SAI)'}</span>
                         </div>
                         <MathText style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 16 }}>{q.content}</MathText>
                         <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <div style={{ padding: 12, background: 'white', border: `2px solid ${isCorrect ? '#059669' : '#ef4444'}`, borderRadius: 12 }}>
                               <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700 }}>HỌC SINH CHỌN:</div>
                               <MathText>{q.options?.[studentChoice] || "---"}</MathText>
                            </div>
                            {!isCorrect && (
                              <div style={{ padding: 12, background: 'white', border: '2px solid #059669', borderRadius: 12 }}>
                                 <div style={{ fontSize: '0.7rem', color: '#059669', fontWeight: 700 }}>ĐÁP ÁN ĐÚNG:</div>
                                 <MathText>{q.options?.[q.correct]}</MathText>
                              </div>
                            )}
                         </div>
                      </div>
                    );
                 })}
              </div>
           </div>
        </div>
      </div>
    );
  };

  return (
    <div className="page-container" style={{ padding: '40px' }}>
      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .icon-btn { width: 44px; height: 44px; border-radius: 12px; border: none; background: #f1f5f9; cursor: pointer; color: #64748b; display: flex; alignItems: center; justifyContent: center; }
        .icon-btn:hover { background: #fee2e2; color: #ef4444; }
      `}</style>

      {renderErrorSheet()}
      {view === 'selection' && renderSelection()}
      {view === 'grading' && renderGradingDashboard()}
      {view === 'results' && renderResults()}
    </div>
  );
};

export default OcrGrading;
