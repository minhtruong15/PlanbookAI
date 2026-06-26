import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, Users, Download, Zap, Eye, CheckCircle, 
  Search, Filter, ChevronRight, X, Clock, Trash2,
  BarChart3, TrendingUp, AlertCircle, Sparkles, MessageCircle, Loader,
  LayoutDashboard, GraduationCap, ClipboardList, LayoutGrid, List
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

// MathText component to render LaTeX safely
const MathText = ({ children, className = "", style = {} }) => {
  const containerRef = useRef(null);
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
  return <div ref={containerRef} className={className} style={style}>{children}</div>;
};

const SubmissionManager = () => {
  const [view, setView] = useState('exam-list'); 
  const [exams, setExams] = useState([]);
  const [allSubmissions, setAllSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedExam, setSelectedExam] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [selectedSub, setSelectedSub] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('All');
  const [viewMode, setViewMode] = useState('grid');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [examsRes, subsRes] = await Promise.all([
        fetch('http://localhost:8000/api/exam/exams', {
          headers: { 'Authorization': `Bearer ${sessionStorage.getItem('accessToken')}` }
        }),
        fetch('http://localhost:8000/api/exam/submissions', {
          headers: { 'Authorization': `Bearer ${sessionStorage.getItem('accessToken')}` }
        })
      ]);
      
      const examsData = await examsRes.json();
      const subsData = await subsRes.json();
      
      if (Array.isArray(examsData)) setExams(examsData);
      if (Array.isArray(subsData)) setAllSubmissions(subsData);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchSubmissions = async (exam) => {
    setSelectedExam(exam);
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/api/exam/exams/${exam.id}/submissions`);
      const data = await response.json();
      setSubmissions(data);
      setView('submission-detail');
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const filteredExams = exams.filter(ex => {
    const matchSearch = ex.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        ex.grade.toLowerCase().includes(searchQuery.toLowerCase());
    const matchGrade = selectedGrade === 'All' || ex.grade === selectedGrade;
    return matchSearch && matchGrade;
  });

  const renderExamList = () => (
    <div className="animate-fade-in">
       {/* Stats Header */}
       <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, marginBottom: 40 }}>
          <div className="glass-panel" style={{ padding: 24, borderRadius: 24, background: 'white', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 20 }}>
             <div style={{ width: 56, height: 56, background: '#eff6ff', color: '#2563eb', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ClipboardList size={28}/></div>
             <div>
                <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Tổng số Đề kiểm tra</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#1e293b' }}>{exams.length}</div>
             </div>
          </div>
          <div className="glass-panel" style={{ padding: 24, borderRadius: 24, background: 'white', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 20 }}>
             <div style={{ width: 56, height: 56, background: '#f0fdf4', color: '#16a34a', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Users size={28}/></div>
             <div>
                <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Học sinh đã làm bài</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#1e293b' }}>{allSubmissions.length}</div>
             </div>
          </div>
          <div className="glass-panel" style={{ padding: 24, borderRadius: 24, background: 'white', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 20 }}>
             <div style={{ width: 56, height: 56, background: '#faf5ff', color: '#9333ea', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><TrendingUp size={28}/></div>
             <div>
                <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Tỷ lệ nộp bài</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#1e293b' }}>98%</div>
             </div>
          </div>
       </div>

       {/* Search & Filter Bar */}
       <div className="glass-panel" style={{ padding: '12px 24px', borderRadius: 20, background: 'white', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32, gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flex: 1 }}>
             <div style={{ position: 'relative', width: 280 }}>
                <Search style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={18}/>
                <input 
                  type="text" 
                  placeholder="Tìm kiếm đề thi..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ width: '100%', padding: '12px 12px 12px 44px', borderRadius: 12, border: '1px solid #f1f5f9', background: '#f8fafc', outline: 'none', fontSize: '0.9rem' }}
                />
             </div>
             
             <div style={{ height: 24, width: 1, background: '#e2e8f0' }}></div>
             
             <div style={{ display: 'flex', gap: 8 }}>
                {['All', 'Lớp 10', 'Lớp 11', 'Lớp 12'].map(grade => (
                  <button 
                    key={grade}
                    onClick={() => setSelectedGrade(grade)}
                    style={{ 
                      padding: '8px 16px', 
                      borderRadius: 10, 
                      fontSize: '0.85rem', 
                      fontWeight: 700,
                      border: 'none',
                      cursor: 'pointer',
                      background: selectedGrade === grade ? '#6366f1' : '#f8fafc',
                      color: selectedGrade === grade ? 'white' : '#64748b',
                      transition: 'all 0.2s'
                    }}
                  >
                    {grade}
                  </button>
                ))}
             </div>
          </div>

          <div style={{ display: 'flex', gap: 4, background: '#f8fafc', padding: 4, borderRadius: 10 }}>
             <button onClick={() => setViewMode('grid')} style={{ width: 36, height: 36, borderRadius: 8, border: 'none', background: viewMode === 'grid' ? 'white' : 'transparent', color: viewMode === 'grid' ? '#6366f1' : '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: viewMode === 'grid' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}><LayoutGrid size={20}/></button>
             <button onClick={() => setViewMode('list')} style={{ width: 36, height: 36, borderRadius: 8, border: 'none', background: viewMode === 'list' ? 'white' : 'transparent', color: viewMode === 'list' ? '#6366f1' : '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: viewMode === 'list' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}><List size={20}/></button>
          </div>
       </div>

       {viewMode === 'grid' ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
             {filteredExams.map(ex => {
               const examSubCount = allSubmissions.filter(s => s.exam_id === ex.id).length;
               return (
                 <div key={ex.id} className="glass-panel premium-card" style={{ padding: 24, borderRadius: 24, border: '1px solid #e2e8f0', background: 'white' }}>
                    <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
                       <div style={{ width: 48, height: 48, background: '#eff6ff', color: '#2563eb', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FileText size={24}/></div>
                       <div>
                          <h3 style={{ fontWeight: 800, fontSize: '1.1rem' }}>{ex.title}</h3>
                          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Lớp {ex.grade} • {ex.duration}</span>
                       </div>
                    </div>
                    <div style={{ background: '#f8fafc', borderRadius: 16, padding: '16px', marginBottom: 20 }}>
                       <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#475569', marginBottom: 8 }}>
                          <span>Số học sinh nộp:</span>
                          <strong style={{ color: '#1e293b' }}>{examSubCount} em</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#475569' }}>
                       <span>Ngày cấp phát:</span>
                       <strong style={{ color: '#1e293b' }}>{new Date(ex.created_at).toLocaleDateString()}</strong>
                    </div>
                 </div>
                 <button onClick={() => fetchSubmissions(ex)} className="btn-primary" style={{ width: '100%', borderRadius: 12, padding: '12px', fontWeight: 700 }}>Xem bài nộp thực tế</button>
              </div>
            );
          })}
       </div>
       ) : (
         <div className="glass-panel" style={{ padding: 0, borderRadius: 24, overflow: 'hidden', background: 'white', border: '1px solid #e2e8f0' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
               <thead style={{ background: '#f8fafc' }}>
                  <tr>
                     <th style={{ textAlign: 'left', padding: '20px 32px' }}>TÊN ĐỀ KIỂM TRA</th>
                     <th style={{ textAlign: 'left', padding: '20px 32px' }}>LỚP</th>
                     <th style={{ textAlign: 'left', padding: '20px 32px' }}>THỜI LƯỢNG</th>
                     <th style={{ textAlign: 'center', padding: '20px 32px' }}>SỐ BÀI NỘP</th>
                     <th style={{ textAlign: 'right', padding: '20px 32px' }}>THAO TÁC</th>
                  </tr>
               </thead>
               <tbody>
                  {filteredExams.map(ex => {
                    const examSubCount = allSubmissions.filter(s => s.exam_id === ex.id).length;
                    return (
                      <tr key={ex.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                         <td style={{ padding: '20px 32px', fontWeight: 800 }}>{ex.title}</td>
                         <td style={{ padding: '20px 32px', color: '#64748b' }}>{ex.grade}</td>
                         <td style={{ padding: '20px 32px', color: '#64748b' }}>{ex.duration}</td>
                         <td style={{ padding: '20px 32px', textAlign: 'center' }}>
                            <span style={{ background: '#f0fdf4', color: '#16a34a', padding: '4px 12px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700 }}>{examSubCount} em</span>
                         </td>
                         <td style={{ padding: '20px 32px', textAlign: 'right' }}>
                            <button onClick={() => fetchSubmissions(ex)} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.8rem' }}>Xem bài nộp</button>
                         </td>
                      </tr>
                    );
                  })}
               </tbody>
            </table>
         </div>
       )}

       {filteredExams.length === 0 && (
         <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
            <AlertCircle size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }}/>
            <p>Không tìm thấy đề thi nào khớp với bộ lọc của bạn.</p>
         </div>
       )}
    </div>
  );

  const renderSubmissionDetail = () => (
    <div className="animate-fade-in">
       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <div>
             <button onClick={() => setView('exam-list')} style={{ border: 'none', background: 'none', color: '#6366f1', fontWeight: 700, cursor: 'pointer', marginBottom: 8 }}>← Quay lại danh sách đề</button>
             <h2 style={{ fontSize: '1.8rem', fontWeight: 900 }}>Dữ liệu nộp bài: {selectedExam.title}</h2>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
             <button onClick={() => alert('Đang đóng gói bài làm...')} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Download size={18}/> Tải tất cả (.zip)</button>
             <button className="btn-primary" style={{ background: '#059669' }} onClick={() => window.location.href='/teacher/ocr'}>Chuyển sang Chấm điểm</button>
          </div>
       </div>

       <div className="glass-panel" style={{ padding: 0, borderRadius: 24, overflow: 'hidden', background: 'white' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
             <thead style={{ background: '#f8fafc' }}>
                <tr>
                   <th style={{ textAlign: 'left', padding: '20px 32px' }}>HỌ TÊN HỌC SINH</th>
                   <th style={{ textAlign: 'left', padding: '20px 32px' }}>SỐ BÁO DANH</th>
                   <th style={{ textAlign: 'left', padding: '20px 32px' }}>THỜI GIAN NỘP</th>
                   <th style={{ textAlign: 'center', padding: '20px 32px' }}>TRẠNG THÁI</th>
                   <th style={{ textAlign: 'right', padding: '20px 32px' }}>THAO TÁC</th>
                </tr>
             </thead>
             <tbody>
                {submissions.length === 0 ? (
                  <tr><td colSpan="5" style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>Chưa có học sinh nào nộp bài.</td></tr>
                ) : submissions.map((sub, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                     <td style={{ padding: '20px 32px', fontWeight: 700 }}>{sub.student_name}</td>
                     <td style={{ padding: '20px 32px', color: '#64748b' }}>{sub.student_id}</td>
                     <td style={{ padding: '20px 32px', color: '#64748b' }}>{new Date(sub.created_at).toLocaleString()}</td>
                     <td style={{ padding: '20px 32px', textAlign: 'center' }}>
                        <span style={{ background: '#dcfce7', color: '#059669', padding: '4px 12px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700 }}>Đã nhận bài</span>
                     </td>
                     <td style={{ padding: '20px 32px', textAlign: 'right' }}>
                        <button className="icon-btn" style={{ background: '#f1f5f9' }} onClick={() => setSelectedSub(sub)}><Eye size={18}/></button>
                     </td>
                  </tr>
                ))}
             </tbody>
          </table>
       </div>

       {/* Modal xem chi tiết bài làm */}
       {selectedSub && (
         <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
            <div className="glass-panel animate-scale-up" style={{ background: 'white', width: '100%', maxWidth: 800, maxHeight: '90vh', borderRadius: 32, padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
               <div style={{ padding: '24px 40px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
                  <div>
                     <h3 style={{ fontSize: '1.4rem', fontWeight: 900 }}>Bài làm: {selectedSub.student_name}</h3>
                     <p style={{ fontSize: '0.85rem', color: '#64748b' }}>SBD: {selectedSub.student_id} • Thời gian nộp: {new Date(selectedSub.created_at).toLocaleString()}</p>
                  </div>
                  <button onClick={() => setSelectedSub(null)} className="icon-btn"><X size={24}/></button>
               </div>
               
               <div style={{ flex: 1, padding: 40, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
                  {(() => {
                    const examContent = safeParse(selectedExam.content);
                    const questions = examContent.questions || [];
                    
                    return questions.map((q, idx) => {
                      const studentChoice = selectedSub.answers[q.id];
                      const isCorrect = studentChoice === q.correct;
                      const hasAnswered = studentChoice !== undefined;

                      return (
                        <div key={idx} style={{ padding: 24, background: '#f8fafc', borderRadius: 20, border: `2px solid ${hasAnswered ? (isCorrect ? '#dcfce7' : '#fee2e2') : '#f1f5f9'}` }}>
                           <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                              <span style={{ fontWeight: 800, color: isCorrect ? '#059669' : '#ef4444' }}>
                                 Câu {idx + 1}: {hasAnswered ? (isCorrect ? 'ĐÚNG' : 'SAI') : 'BỎ TRỐNG'}
                              </span>
                              <span style={{ fontSize: '0.75rem', background: '#e2e8f0', padding: '4px 10px', borderRadius: 8 }}>{q.level}</span>
                           </div>
                           
                           <MathText style={{ fontWeight: 600, fontSize: '1.05rem', marginBottom: 20, lineHeight: 1.6 }}>{q.content}</MathText>
                           
                           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                              <div style={{ padding: 12, background: 'white', border: `1px solid ${isCorrect ? '#059669' : '#ef4444'}`, borderRadius: 12 }}>
                                 <div style={{ fontSize: '0.7rem', color: isCorrect ? '#059669' : '#ef4444', fontWeight: 800, marginBottom: 4 }}>HỌC SINH CHỌN:</div>
                                 <MathText style={{ fontWeight: 600 }}>{hasAnswered ? q.options[studentChoice] : "Chưa trả lời"}</MathText>
                              </div>
                              {!isCorrect && (
                                <div style={{ padding: 12, background: 'white', border: '1px solid #059669', borderRadius: 12 }}>
                                   <div style={{ fontSize: '0.7rem', color: '#059669', fontWeight: 800, marginBottom: 4 }}>ĐÁP ÁN ĐÚNG:</div>
                                   <MathText style={{ fontWeight: 600 }}>{q.options[q.correct]}</MathText>
                                </div>
                              )}
                           </div>
                        </div>
                      );
                    });
                  })()}
               </div>
               
               <div style={{ padding: '20px 40px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', textAlign: 'right' }}>
                  <button onClick={() => setSelectedSub(null)} className="btn-primary" style={{ padding: '10px 32px', borderRadius: 10 }}>Đóng</button>
               </div>
            </div>
         </div>
       )}
    </div>
  );

  return (
    <div className="page-container" style={{ padding: '40px' }}>
      <style>{`
        .premium-card:hover { transform: translateY(-5px); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); border-color: #6366f1 !important; }
        .icon-btn { width: 40px; height: 40px; border-radius: 10px; border: none; cursor: pointer; display: flex; alignItems: center; justifyContent: center; color: #64748b; }
        .icon-btn:hover { background: #6366f1 !important; color: white !important; }
      `}</style>
      {loading ? <div style={{ textAlign: 'center', padding: 100 }}><Loader className="spin" size={48} color="#6366f1"/></div> : (
        view === 'exam-list' ? renderExamList() : renderSubmissionDetail()
      )}
    </div>
  );
};

export default SubmissionManager;
