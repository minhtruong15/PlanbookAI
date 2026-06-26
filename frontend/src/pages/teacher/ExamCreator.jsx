import React, { useState, useEffect, useRef } from 'react';
import { 
  Settings, FileText, CheckCircle, ChevronRight, ChevronLeft, Save, Sparkles, 
  Download, Copy, Share2, Plus, Loader, Trash2, List, Calendar, Clock, 
  BookOpen, Search, Filter, LayoutGrid, MoreVertical, TrendingUp, AlertCircle, 
  Trophy, Users, GraduationCap, Zap, X, Eye, EyeOff, QrCode, Link as LinkIcon, Lock
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
      try {
        window.renderMathInElement(containerRef.current, {
          delimiters: [
            { left: "$$", right: "$$", display: true },
            { left: "$", right: "$", display: false }
          ],
          throwOnError: false
        });
      } catch (e) {
        console.error("KaTeX render error:", e);
      }
    }
  }, [children]);

  return <div ref={containerRef} className={className} style={style}>{children}</div>;
};

const ExamCreator = () => {
  const [showWizard, setShowWizard] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [revealPassword, setRevealPassword] = useState(false);
  const [lessons, setLessons] = useState([]);
  const [exams, setExams] = useState([]);
  const [loadingExams, setLoadingExams] = useState(true);
  const [activeMode, setActiveMode] = useState('ai'); 
  const [viewMode, setViewMode] = useState('grid'); 
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGrade, setFilterGrade] = useState('All');
  const [selectedExam, setSelectedExam] = useState(null); 
  const [assignExam, setAssignExam] = useState(null); 
  const [localIp, setLocalIp] = useState('localhost');
  const [isEditingIp, setIsEditingIp] = useState(false);

  const initialFormData = {
    title: '',
    duration: '45 phút',
    grade: 'Lớp 10',
    subject: 'Toán học',
    lessonId: '',
    matrix: { nhanBiet: 4, thongHieu: 3, vanDung: 2, vanDungCao: 1 },
    questions: [],
    versions: [],
    settings: { shuffle: true, password: '', maxAttempts: 1, showAnswers: 'after_test' }
  };

  const [formData, setFormData] = useState(initialFormData);

  const totalQuestions = Object.values(formData.matrix).reduce((a, b) => Number(a) + Number(b), 0);

  useEffect(() => {
    fetchExams();
    fetchLessons();
    fetchLocalIp();
  }, []);

  const fetchLocalIp = async () => {
    // 1. Thử lấy IP từ Backend
    try {
      const response = await fetch('http://localhost:8000/api/exam/local-ip');
      const data = await response.json();
      if (data.ip && data.ip !== '127.0.0.1' && !data.ip.startsWith('172.')) {
        setLocalIp(data.ip);
        return;
      }
    } catch (e) {}

    // 2. Dùng WebRTC để dò LAN IP thật (Bỏ qua Docker IPs)
    try {
      const pc = new RTCPeerConnection({ iceServers: [] });
      pc.createDataChannel("");
      pc.createOffer().then(pc.setLocalDescription.bind(pc));
      pc.onicecandidate = (ice) => {
        if (!ice || !ice.candidate || !ice.candidate.candidate) return;
        const myIP = /([0-9]{1,3}(\.[0-9]{1,3}){3})/.exec(ice.candidate.candidate)[1];
        // Chỉ lấy IP LAN chuẩn (thường bắt đầu bằng 192.168 hoặc 10. hoặc 172.16-31 nhưng không phải docker 172.17/18)
        if (myIP && !myIP.startsWith('127.') && !myIP.startsWith('172.17.') && !myIP.startsWith('172.18.') && !myIP.startsWith('172.19.')) {
           setLocalIp(myIP);
           pc.onicecandidate = null;
        }
      };
    } catch (e) {}
  };

  const fetchLessons = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/lesson/lessons', {
        headers: { 'Authorization': `Bearer ${sessionStorage.getItem('accessToken')}` }
      });
      const data = await response.json();
      if (Array.isArray(data)) setLessons(data);
    } catch (err) {
      console.error("Failed to fetch lessons:", err);
    }
  };

  const fetchExams = async () => {
    setLoadingExams(true);
    try {
      const response = await fetch('http://localhost:8000/api/exam/exams', {
        headers: { 'Authorization': `Bearer ${sessionStorage.getItem('accessToken')}` }
      });
      const data = await response.json();
      if (Array.isArray(data)) setExams(data);
    } catch (err) {
      console.error("Failed to fetch exams:", err);
    } finally {
      setLoadingExams(false);
    }
  };

  const resetWizard = () => {
    setFormData(initialFormData);
    setCurrentStep(1);
    setIsDone(false);
    setActiveMode('ai');
  };

  const handleOpenWizard = () => {
    resetWizard();
    setShowWizard(true);
  };

  const handleCloseWizard = () => {
    setShowWizard(false);
    resetWizard();
    fetchExams();
  };

  const handleNext = () => setCurrentStep(prev => Math.min(prev + 1, 4));
  const handlePrev = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const handleGenerateQuestions = async () => {
    try {
      const selectedLesson = lessons.find(l => l.id == formData.lessonId);
      const payload = {
        lesson_title: selectedLesson ? selectedLesson.title : "",
        lesson_content: selectedLesson ? selectedLesson.content : "",
        subject: formData.subject,
        matrix: formData.matrix
      };

      const response = await fetch('http://localhost:8000/api/exam/ai/generate-questions', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      if (data.questions) {
        setFormData(prev => ({ 
          ...prev, 
          questions: data.questions.map(q => ({
            ...q,
            options: q.options.map((opt, idx) => `${String.fromCharCode(65 + idx)}. ${opt}`)
          })) 
        }));
        alert(`Đã sinh thành công ${data.questions.length} câu hỏi thông minh!`);
      }
    } catch (err) {
      console.error("AI Generation error:", err);
      alert("Lỗi khi kết nối với Trợ lý AI!");
    }
  };

  const handleAddQuestion = () => {
    setFormData(prev => ({
      ...prev,
      questions: [...prev.questions, { id: Date.now(), content: '', options: ['A. ', 'B. ', 'C. ', 'D. '], correct: 0, level: 'Nhận biết' }]
    }));
  };

  const handleShuffleVersions = () => {
    const codes = [101, 202, 303, 404];
    const versions = codes.map(code => {
      const shuffled = [...formData.questions].sort(() => Math.random() - 0.5);
      return { code, questions: shuffled };
    });
    setFormData(prev => ({ ...prev, versions }));
    alert("Đã tạo 4 mã đề thành công!");
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    const payload = {
      title: formData.title || "Đề kiểm tra không tên",
      grade: formData.grade,
      duration: formData.duration,
      password: formData.settings.password || null,
      exam_codes: formData.versions.map(v => v.code.toString()),
      lesson_id: formData.lessonId ? parseInt(formData.lessonId) : null,
      content: { ...formData }
    };

    try {
      const response = await fetch('http://localhost:8000/api/exam/exams', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(payload)
      });
      
      if (response.ok) {
        setIsDone(true);
        fetchExams();
      } else {
        const err = await response.text();
        alert(`Lỗi: ${err}`);
      }
    } catch (err) {
      alert("Lỗi kết nối máy chủ!");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredExams = exams.filter(ex => {
    const matchesSearch = ex.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGrade = filterGrade === 'All' || ex.grade === filterGrade;
    return matchesSearch && matchesGrade;
  });

  const getSubjectIcon = (subject) => {
    switch(subject) {
      case 'Toán học': return <TrendingUp size={24} />;
      case 'Hóa học': return <Zap size={24} />;
      case 'Vật lý': return <Zap size={24} />;
      default: return <BookOpen size={24} />;
    }
  };

  const renderStats = () => {
    const totalQ = exams.reduce((acc, ex) => acc + (safeParse(ex.content).questions?.length || 0), 0);
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 30 }}>
        {[
          { label: 'Tổng đề thi', value: exams.length, icon: <FileText color="#6366f1"/>, bg: '#e0e7ff' },
          { label: 'Kho câu hỏi', value: totalQ, icon: <List color="#059669"/>, bg: '#d1fae5' },
          { label: 'Lượt làm bài', value: '1.2k', icon: <Users color="#d97706"/>, bg: '#fef3c7' },
          { label: 'Điểm TB', value: '7.8', icon: <Trophy color="#ef4444"/>, bg: '#fee2e2' }
        ].map((s, i) => (
          <div key={i} className="glass-panel animate-fade-in" style={{ padding: '16px 20px', borderRadius: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{s.icon}</div>
            <div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>{s.label}</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{s.value}</div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderExamCard = (exam) => {
    const content = safeParse(exam.content);
    const qCount = content.questions?.length || 0;
    const progress = Math.floor(Math.random() * 100); 

    return (
      <div key={exam.id} className="exam-card glass-panel animate-fade-in">
        <div className="card-image" style={{ background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', height: 100, borderTopLeftRadius: 16, borderTopRightRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
           <div style={{ position: 'absolute', top: -10, right: -10, opacity: 0.1 }}><Zap size={120} color="white"/></div>
           <div style={{ color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1 }}>
              {getSubjectIcon(content.subject)}
              <span style={{ fontSize: '0.75rem', fontWeight: 700, marginTop: 4, textTransform: 'uppercase', letterSpacing: 1 }}>{content.subject || 'Đa môn'}</span>
           </div>
           <div className="card-badge" style={{ position: 'absolute', top: 12, left: 12, background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', color: 'white', padding: '4px 10px', borderRadius: 20, fontSize: '0.65rem', fontWeight: 700 }}>{exam.grade}</div>
        </div>
        <div style={{ padding: 16 }}>
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b', flex: 1, marginRight: 8 }}>{exam.title}</h4>
              <button className="icon-btn" style={{ background: 'transparent' }}><MoreVertical size={16}/></button>
           </div>
           <div style={{ display: 'flex', gap: 12, fontSize: '0.75rem', color: '#64748b', marginBottom: 16 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={12}/> {exam.duration}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><BookOpen size={12}/> {qCount} câu</span>
           </div>
           
           <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', marginBottom: 4, fontWeight: 600 }}>
                 <span>Hoàn thành</span>
                 <span>{progress}%</span>
              </div>
              <div style={{ width: '100%', height: 6, background: '#f1f5f9', borderRadius: 10 }}>
                 <div style={{ width: `${progress}%`, height: '100%', background: 'var(--primary)', borderRadius: 10 }}></div>
              </div>
           </div>

           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <button className="btn-secondary" onClick={() => setSelectedExam(exam)} style={{ fontSize: '0.75rem', padding: '8px' }}>Chi tiết</button>
              <button className="btn-primary" onClick={() => setAssignExam(exam)} style={{ fontSize: '0.75rem', padding: '8px', background: 'linear-gradient(135deg, #6366f1, #a855f7)', border: 'none' }}>Cấp phát Link</button>
           </div>
        </div>
      </div>
    );
  };

  const renderAssignModal = () => {
    if (!assignExam) return null;
    
    const shareLink = isEditingIp ? `http://${localIp}/exam/${assignExam.id}` : `${window.location.origin}/exam/${assignExam.id}`;
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareLink)}`;

    return (
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 1001, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <div className="glass-panel animate-scale-up" style={{ background: 'white', width: '100%', maxWidth: 500, borderRadius: 28, padding: 32, textAlign: 'center' }}>
          <div style={{ width: 80, height: 80, background: '#f5f3ff', color: '#6366f1', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}><Share2 size={40}/></div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: 8 }}>Cấp phát Đề thi</h2>
          <p style={{ color: '#64748b', marginBottom: 32 }}>Hệ thống tự nhận diện mạng hiện tại. Hãy copy hoặc cho học sinh quét mã QR để làm bài.</p>
          
          <div style={{ background: '#f8fafc', padding: '16px 20px', borderRadius: 16, border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
             <LinkIcon size={20} color="#6366f1"/>
             <div style={{ flex: 1, textAlign: 'left' }}>
                {isEditingIp ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <span style={{ fontSize: '0.7rem', color: '#6366f1', fontWeight: 800 }}>NHẬP IP/TÊN MIỀN KHÁC MẠNG</span>
                    <input 
                      autoFocus
                      value={localIp} 
                      onChange={(e) => setLocalIp(e.target.value)}
                      style={{ width: '100%', background: 'white', border: '2px solid #6366f1', outline: 'none', fontWeight: 800, fontSize: '0.9rem', color: '#1e293b', padding: '6px 12px', borderRadius: 10 }} 
                    />
                  </div>
                ) : (
                  <input readOnly value={shareLink} style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', fontWeight: 800, fontSize: '0.9rem', color: '#1e293b' }} />
                )}
             </div>
             <button onClick={() => { navigator.clipboard.writeText(shareLink); alert("Đã sao chép link chuẩn!"); }} style={{ border: 'none', background: '#6366f1', color: 'white', padding: '8px 16px', borderRadius: 10, fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}>Copy</button>
          </div>
          
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
             <button 
               onClick={() => setIsEditingIp(!isEditingIp)} 
               style={{ background: isEditingIp ? '#22c55e' : '#f1f5f9', color: isEditingIp ? 'white' : '#6366f1', padding: '6px 16px', borderRadius: 20, border: 'none', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, margin: '0 auto' }}
             >
               {isEditingIp ? "✅ XÁC NHẬN IP NÀY" : "⚙️ Sửa IP (Nếu điện thoại không vào được)"}
             </button>
             {isEditingIp && <p style={{ fontSize: '0.7rem', color: '#64748b', marginTop: 8 }}>Mẹo: Gõ <b>192.168.x.x</b> (IP mạng Wifi của bạn) để điện thoại học sinh vào được.</p>}
          </div>
          
          <div style={{ background: 'white', padding: 20, borderRadius: 20, border: '1px solid #e2e8f0', display: 'inline-block', marginBottom: 32, boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)' }}>
             <img src={qrApiUrl} alt="QR Code" style={{ width: 180, height: 180 }} />
             <div style={{ marginTop: 10, fontSize: '0.8rem', fontWeight: 800, color: '#6366f1' }}>QUÉT MÃ ĐỂ LÀM BÀI</div>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
             <button onClick={() => setAssignExam(null)} className="btn-secondary" style={{ flex: 1, padding: '14px', borderRadius: 12 }}>Đóng</button>
             <button className="btn-primary" style={{ flex: 1, padding: '14px', borderRadius: 12 }}>Cài đặt thi</button>
          </div>
        </div>
      </div>
    );
  };

  const renderExamDetails = () => {
    if (!selectedExam) return null;
    const content = safeParse(selectedExam.content);

    return (
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <div className="glass-panel animate-scale-up" style={{ background: 'white', width: '100%', maxWidth: 900, maxHeight: '90vh', borderRadius: 24, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '24px 32px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>{selectedExam.title}</h2>
              <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{selectedExam.grade} • {content.subject} • {selectedExam.duration}</div>
            </div>
            <button onClick={() => setSelectedExam(null)} className="icon-btn" style={{ background: '#f1f5f9' }}><X size={20}/></button>
          </div>
          <div style={{ flex: 1, padding: 32, overflowY: 'auto' }}>
            {/* Password Info Section */}
            <div style={{ background: '#f5f3ff', border: '1px solid #ddd6fe', padding: '20px 24px', borderRadius: 20, marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 6px -1px rgba(99, 102, 241, 0.1)' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 48, height: 48, background: '#ede9fe', color: '#6366f1', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Lock size={24}/></div>
                  <div>
                     <div style={{ fontSize: '0.75rem', color: '#6366f1', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>Mật khẩu làm bài (Cung cấp cho học sinh)</div>
                     <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 12 }}>
                        {selectedExam.password || "Không có mật khẩu"}
                        {selectedExam.password && (
                          <button 
                            onClick={() => { navigator.clipboard.writeText(selectedExam.password); alert("Đã sao chép mật khẩu!"); }}
                            style={{ padding: '4px 10px', fontSize: '0.7rem', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 6, cursor: 'pointer', fontWeight: 700, color: '#64748b' }}
                          >
                            <Copy size={12} style={{ display: 'inline', marginRight: 4 }}/> Sao chép
                          </button>
                        )}
                     </div>
                  </div>
               </div>
               <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, maxWidth: '40%', justifyContent: 'flex-end' }}>
                  {selectedExam.exam_codes?.map(code => (
                    <span key={code} style={{ background: 'white', border: '1px solid #e2e8f0', padding: '6px 12px', borderRadius: 10, fontSize: '0.8rem', fontWeight: 800, color: '#64748b' }}>Mã đề: {code}</span>
                  )) || <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Mã mặc định: 101</span>}
               </div>
            </div>

            <h4 style={{ marginBottom: 20, fontWeight: 700, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: 8 }}><List size={20}/> Danh sách {content.questions?.length || 0} câu hỏi</h4>
            {content.questions?.map((q, idx) => (
              <div key={idx} style={{ marginBottom: 30, padding: 20, background: '#f8fafc', borderRadius: 16, border: '1px solid #e2e8f0' }}>
                <MathText className="math-rendering" style={{ fontWeight: 700, marginBottom: 16, fontSize: '1.05rem' }}>
                  Câu {idx + 1}: {q.content}
                </MathText>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {q.options?.map((opt, oIdx) => (
                    <MathText key={oIdx} style={{ padding: '10px 16px', background: q.correct === oIdx ? '#dcfce7' : 'white', borderRadius: 10, border: `1px solid ${q.correct === oIdx ? '#22c55e' : '#e2e8f0'}`, fontSize: '0.95rem' }}>
                      {opt} {q.correct === oIdx && <CheckCircle size={14} style={{ display: 'inline', marginLeft: 4, color: '#22c55e' }}/>}
                    </MathText>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div style={{ padding: '20px 32px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', textAlign: 'right' }}>
            <button onClick={() => setSelectedExam(null)} className="btn-primary" style={{ padding: '10px 24px' }}>Đóng</button>
          </div>
        </div>
      </div>
    );
  };

  const renderStep1 = () => (
    <div className="wizard-step animate-fade-in">
      <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: 20 }}>Bước 1: Thiết lập Thông tin & Ma trận đề thi</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        <div>
          <label style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>Tên Đề thi</label>
          <input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} type="text" className="input-field" placeholder="VD: Kiểm tra 1 tiết Đại số" />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>Môn học</label>
          <select value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} className="input-field">
            <option value="Toán học">Toán học</option>
            <option value="Vật lý">Vật lý</option>
            <option value="Hóa học">Hóa học</option>
            <option value="Sinh học">Sinh học</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        <div>
          <label style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>Khối lớp</label>
          <select value={formData.grade} onChange={e => setFormData({...formData, grade: e.target.value})} className="input-field">
            <option value="Lớp 10">Lớp 10</option>
            <option value="Lớp 11">Lớp 11</option>
            <option value="Lớp 12">Lớp 12</option>
          </select>
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>Dựa trên Giáo án</label>
          <select value={formData.lessonId} onChange={e => setFormData({...formData, lessonId: e.target.value})} className="input-field">
            <option value="">-- Không liên kết --</option>
            {lessons.map(l => <option key={l.id} value={l.id}>{l.title}</option>)}
          </select>
        </div>
      </div>

      <div style={{ background: '#f8fafc', padding: 20, borderRadius: 12, border: '1px solid #e2e8f0' }}>
        <h4 style={{ fontWeight: 600, marginBottom: 16 }}>Ma trận nhận thức (Tổng {totalQuestions} câu)</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {['nhanBiet', 'thongHieu', 'vanDung', 'vanDungCao'].map((level) => (
            <div key={level}>
              <label style={{ fontSize: '0.85rem' }}>{level === 'nhanBiet' ? 'Nhận biết' : level === 'thongHieu' ? 'Thông hiểu' : 'Vận dụng'}</label>
              <input type="number" min="0" value={formData.matrix[level]} onChange={e => setFormData({...formData, matrix: {...formData.matrix, [level]: parseInt(e.target.value) || 0}})} className="input-field" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="page-container" style={{ padding: '24px 40px' }}>
      <style>{`
        .input-field { width: 100%; padding: 10px 14px; border-radius: 10px; border: 1px solid #e2e8f0; outline: none; font-family: inherit; transition: all 0.2s; }
        .input-field:focus { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1); }
        .btn-ai-sparkle { background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); color: white; border: none; padding: 10px 20px; border-radius: 10px; cursor: pointer; display: flex; align-items: center; gap: 8px; font-weight: 700; transition: transform 0.2s; }
        .btn-ai-sparkle:hover { transform: scale(1.02); }
        .question-card { background: white; padding: 24px; border-radius: 16px; border: 1px solid #e2e8f0; margin-bottom: 20px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
        .math-textarea { width: 100%; padding: 14px; border: 1px solid #e2e8f0; border-radius: 10px; font-family: 'Inter', sans-serif; min-height: 100px; font-size: 1rem; line-height: 1.6; }
        .exam-card { background: white; border-radius: 16px; border: 1px solid #e2e8f0; transition: all 0.3s; overflow: hidden; }
        .exam-card:hover { transform: translateY(-8px); box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); }
        .search-bar { position: relative; width: 300px; }
        .search-bar input { width: 100%; padding: 10px 14px 10px 40px; border-radius: 10px; border: 1px solid #e2e8f0; outline: none; }
        .search-bar svg { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #94a3b8; }
        .filter-chip { padding: 6px 14px; border-radius: 20px; border: 1px solid #e2e8f0; background: white; font-size: 0.85rem; cursor: pointer; transition: all 0.2s; font-weight: 500; }
        .filter-chip.active { background: var(--primary); color: white; border-color: var(--primary); }
        .icon-btn { width: 32px; height: 32px; border-radius: 8px; border: none; background: #f8fafc; color: #64748b; cursor: pointer; display: flex; align-items: center; justifyContent: center; }
        .math-rendering .katex { font-size: 1.1em; }
      `}</style>

      {renderExamDetails()}
      {renderAssignModal()}

      {!showWizard ? (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32 }}>
            <div>
              <h1 style={{ fontSize: '2rem', fontWeight: 900, background: 'linear-gradient(135deg, #1e293b 0%, #6366f1 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Quản lý Đề kiểm tra</h1>
              <p style={{ color: '#64748b', fontSize: '1rem' }}>Thiết kế đề thi thông minh với trợ lý AI chuyên nghiệp</p>
            </div>
            <button className="btn-primary" onClick={handleOpenWizard} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 28px', borderRadius: 12, boxShadow: '0 10px 15px -3px rgba(99, 102, 241, 0.3)' }}><Plus size={20}/> Tạo Đề thi mới</button>
          </div>

          {renderStats()}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, background: '#f8fafc', padding: '12px 20px', borderRadius: 16 }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
               <div className="search-bar">
                  <Search size={18}/>
                  <input type="text" placeholder="Tìm kiếm đề thi..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
               </div>
               <div style={{ width: 1, height: 24, background: '#e2e8f0', margin: '0 8px' }}></div>
               {['All', 'Lớp 10', 'Lớp 11', 'Lớp 12'].map(g => (
                 <button key={g} onClick={() => setFilterGrade(g)} className={`filter-chip ${filterGrade === g ? 'active' : ''}`}>{g}</button>
               ))}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
               <button onClick={() => setViewMode('grid')} className={`icon-btn ${viewMode === 'grid' ? 'active' : ''}`} style={{ background: viewMode === 'grid' ? 'white' : 'transparent', boxShadow: viewMode === 'grid' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none' }}><LayoutGrid size={18}/></button>
               <button onClick={() => setViewMode('list')} className={`icon-btn ${viewMode === 'list' ? 'active' : ''}`} style={{ background: viewMode === 'list' ? 'white' : 'transparent', boxShadow: viewMode === 'list' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none' }}><List size={18}/></button>
            </div>
          </div>

          {loadingExams ? (
            <div style={{ textAlign: 'center', padding: 80 }}><Loader className="spin" size={48} color="var(--primary)"/></div>
          ) : (
            <div style={viewMode === 'grid' ? { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 } : { display: 'flex', flexDirection: 'column', gap: 16 }}>
              {filteredExams.length === 0 ? (
                <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 80, background: 'white', borderRadius: 24, border: '2px dashed #e2e8f0' }}>
                   <AlertCircle size={48} color="#94a3b8" style={{ margin: '0 auto 16px' }}/>
                   <h3 style={{ color: '#1e293b', fontWeight: 700 }}>Không tìm thấy đề thi</h3>
                   <p style={{ color: '#64748b' }}>Thử thay đổi bộ lọc hoặc tìm kiếm tên khác</p>
                </div>
              ) : filteredExams.map(ex => renderExamCard(ex))}
            </div>
          )}
        </>
      ) : (
        /* WIZARD UI */
        <div style={{ background: 'white', borderRadius: 28, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', minHeight: 750, overflow: 'hidden' }}>
           <div style={{ background: 'linear-gradient(to bottom, #f8fafc, #ffffff)', padding: '32px 48px', borderBottom: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 40, height: 40, background: 'var(--primary)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}><Sparkles size={24}/></div>
                    <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#1e293b' }}>Thiết kế Đề thi AI</h2>
                 </div>
                 <button onClick={handleCloseWizard} style={{ border: 'none', background: '#fee2e2', padding: '10px 20px', borderRadius: 10, color: '#ef4444', cursor: 'pointer', fontWeight: 700 }}>Hủy bỏ</button>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', maxWidth: 800, margin: '0 auto' }}>
                 {[1,2,3,4].map(s => (
                   <div key={s} style={{ zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 44, height: 44, borderRadius: '14px', background: currentStep >= s ? 'var(--primary)' : 'white', color: currentStep >= s ? 'white' : '#cbd5e1', border: `2px solid ${currentStep >= s ? 'var(--primary)' : '#e2e8f0'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, transition: 'all 0.3s' }}>{s}</div>
                      <span style={{ fontSize: '0.8rem', fontWeight: currentStep >= s ? 700 : 500, color: currentStep >= s ? '#1e293b' : '#94a3b8' }}>{s === 1 ? 'Thiết lập' : s === 2 ? 'Soạn thảo' : s === 3 ? 'Trộn đề' : 'Hoàn tất'}</span>
                   </div>
                 ))}
                 <div style={{ position: 'absolute', top: 22, left: 44, right: 44, height: 2, background: '#e2e8f0', zIndex: 0 }}></div>
                 <div style={{ position: 'absolute', top: 22, left: 44, width: `${(currentStep-1)*33}%`, height: 2, background: 'var(--primary)', zIndex: 0, transition: 'all 0.5s ease' }}></div>
              </div>
           </div>

           <div style={{ flex: 1, padding: '40px 64px', overflowY: 'auto' }}>
              {currentStep === 1 && renderStep1()}
              {currentStep === 2 && (
                <div className="wizard-step animate-fade-in">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <div style={{ display: 'flex', background: '#f1f5f9', padding: 4, borderRadius: 12 }}>
                      <button onClick={() => setActiveMode('ai')} style={{ padding: '10px 24px', borderRadius: 10, border: 'none', cursor: 'pointer', background: activeMode === 'ai' ? 'white' : 'transparent', color: activeMode === 'ai' ? 'var(--primary)' : '#64748b', fontWeight: 700, boxShadow: activeMode === 'ai' ? '0 4px 6px rgba(0,0,0,0.05)' : 'none' }}>AI Trợ lý</button>
                      <button onClick={() => setActiveMode('manual')} style={{ padding: '10px 24px', borderRadius: 10, border: 'none', cursor: 'pointer', background: activeMode === 'manual' ? 'white' : 'transparent', color: activeMode === 'manual' ? 'var(--primary)' : '#64748b', fontWeight: 700, boxShadow: activeMode === 'manual' ? '0 4px 6px rgba(0,0,0,0.05)' : 'none' }}>Thủ công</button>
                    </div>
                    {activeMode === 'ai' && <button onClick={handleGenerateQuestions} className="btn-ai-sparkle"><Sparkles size={18}/> Sinh {totalQuestions} câu hỏi chuẩn</button>}
                  </div>
                  <div style={{ minHeight: 400 }}>
                    {formData.questions.length === 0 ? (
                       <div style={{ textAlign: 'center', padding: 80, background: '#f8fafc', borderRadius: 24, border: '2px dashed #e2e8f0' }}>
                          <Zap size={64} color="#6366f1" style={{ margin: '0 auto 20px', opacity: 0.2 }}/>
                          <h4 style={{ fontWeight: 700 }}>Chưa có câu hỏi nào</h4>
                          <p style={{ color: '#64748b' }}>Sử dụng AI để sinh câu hỏi tự động hoặc tự tay soạn thảo</p>
                       </div>
                    ) : (
                      formData.questions.map((q, i) => (
                        <div key={q.id} className="question-card animate-slide-up" style={{ animationDelay: `${i*0.05}s` }}>
                           <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                 <div style={{ width: 28, height: 28, background: 'var(--primary)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 800 }}>{i+1}</div>
                                 <span style={{ fontWeight: 700, color: '#475569', fontSize: '0.9rem' }}>Độ khó: {q.level}</span>
                              </div>
                              <button onClick={() => setFormData({...formData, questions: formData.questions.filter(item => item.id !== q.id)})} style={{ width: 32, height: 32, borderRadius: 8, border: 'none', background: '#fee2e2', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Trash2 size={16}/></button>
                           </div>
                           <textarea value={q.content} onChange={e => {
                             const newQs = [...formData.questions];
                             newQs[i].content = e.target.value;
                             setFormData({...formData, questions: newQs});
                           }} className="math-textarea" placeholder="Nhập nội dung câu hỏi (hỗ trợ LaTeX)..." />
                           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 20 }}>
                              {q.options.map((opt, oIdx) => (
                                <div key={oIdx} style={{ display: 'flex', gap: 12, alignItems: 'center', background: q.correct === oIdx ? '#f0f9ff' : '#f8fafc', padding: '12px 16px', borderRadius: 12, border: `2px solid ${q.correct === oIdx ? '#3b82f6' : 'transparent'}`, transition: 'all 0.2s' }}>
                                   <input type="radio" checked={q.correct === oIdx} onChange={() => {
                                     const newQs = [...formData.questions];
                                     newQs[i].correct = oIdx;
                                     setFormData({...formData, questions: newQs});
                                   }} style={{ width: 18, height: 18, cursor: 'pointer' }} />
                                   <input value={opt} onChange={e => {
                                     const newQs = [...formData.questions];
                                     newQs[i].options[oIdx] = e.target.value;
                                     setFormData({...formData, questions: newQs});
                                   }} style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontWeight: 500, color: '#1e293b' }} />
                                </div>
                              ))}
                           </div>
                        </div>
                      ))
                    )}
                    {activeMode === 'manual' && <button onClick={handleAddQuestion} style={{ width: '100%', padding: '20px', border: '2px dashed #cbd5e1', background: 'white', borderRadius: 16, color: '#64748b', cursor: 'pointer', fontWeight: 700, marginTop: 20 }}>+ Thêm câu hỏi mới</button>}
                  </div>
                </div>
              )}
              {currentStep === 3 && (
                <div className="wizard-step animate-fade-in">
                   <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 32, textAlign: 'center' }}>Thiết lập Mã đề & Bảo mật</h3>
                   <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 40 }}>
                      <div className="glass-panel" style={{ padding: 32, borderRadius: 24 }}>
                         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                            <h4 style={{ fontWeight: 800, fontSize: '1.1rem' }}>Các phiên bản đề thi</h4>
                            <button onClick={handleShuffleVersions} className="btn-secondary" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8 }}><Sparkles size={16}/> Trộn mã đề</button>
                         </div>
                         {formData.versions.length === 0 ? (
                           <div style={{ textAlign: 'center', padding: 40, background: '#f8fafc', borderRadius: 16 }}>
                              <p style={{ color: '#94a3b8' }}>Chưa có mã đề nào được tạo. Hãy bấm "Trộn mã đề" để sinh 4 mã đề chuẩn.</p>
                           </div>
                         ) : (
                           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                             {formData.versions.map(v => (
                               <div key={v.code} style={{ background: 'white', border: '1px solid #e2e8f0', padding: 16, borderRadius: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <div>
                                     <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Mã đề</div>
                                     <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--primary)' }}>{v.code}</div>
                                  </div>
                                  <div style={{ textAlign: 'right' }}>
                                     <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Câu hỏi</div>
                                     <div style={{ fontWeight: 700 }}>{v.questions.length}</div>
                                  </div>
                               </div>
                             ))}
                           </div>
                         )}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                         <div className="glass-panel" style={{ padding: 24, borderRadius: 20 }}>
                            <h4 style={{ fontWeight: 800, marginBottom: 16 }}>Bảo mật</h4>
                             <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: 6, fontWeight: 600 }}>Mật khẩu mở đề</label>
                             <div style={{ position: 'relative' }}>
                                <input 
                                  type={revealPassword ? "text" : "password"} 
                                  value={formData.settings.password} 
                                  onChange={e => setFormData({...formData, settings: {...formData.settings, password: e.target.value}})} 
                                  className="input-field" 
                                  placeholder="Để trống nếu không cần" 
                                  style={{ paddingRight: '44px' }}
                                />
                                <button 
                                  type="button"
                                  onClick={() => setRevealPassword(!revealPassword)}
                                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                >
                                   {revealPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                                </button>
                             </div>
                         </div>
                         <div className="glass-panel" style={{ padding: 24, borderRadius: 20 }}>
                            <h4 style={{ fontWeight: 800, marginBottom: 16 }}>Tùy chọn hiển thị</h4>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                               <input type="checkbox" checked={formData.settings.shuffle} onChange={e => setFormData({...formData, settings: {...formData.settings, shuffle: e.target.checked}})} style={{ width: 20, height: 20 }} />
                               <span style={{ fontWeight: 600, color: '#1e293b' }}>Xáo trộn thứ tự câu hỏi cục bộ</span>
                            </div>
                         </div>
                      </div>
                   </div>
                </div>
              )}
              {currentStep === 4 && (
                <div className="wizard-step animate-fade-in" style={{ textAlign: 'center', padding: '40px 0' }}>
                   {isDone ? (
                     <div style={{ maxWidth: 500, margin: '0 auto' }}>
                        <div style={{ width: 100, height: 100, background: '#d1fae5', borderRadius: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', transform: 'rotate(10deg)' }}><CheckCircle size={50} color="#059669" /></div>
                        <h2 style={{ fontSize: '2.4rem', fontWeight: 900, marginBottom: 12 }}>Hoàn tất xuất bản!</h2>
                        <p style={{ color: '#64748b', fontSize: '1.1rem', marginBottom: 40, lineHeight: 1.6 }}>Đề thi <strong>{formData.title}</strong> đã được lưu vào kho lưu trữ cá nhân. Bạn có thể in đề hoặc gửi cho lớp ngay bây giờ.</p>
                        <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
                           <button className="btn-secondary" style={{ padding: '14px 28px' }}><Share2 size={18}/> Chia sẻ</button>
                           <button className="btn-primary" onClick={handleCloseWizard} style={{ padding: '14px 28px' }}>Quay lại Quản lý</button>
                        </div>
                     </div>
                   ) : (
                     <>
                        <h3 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: 16 }}>Xác nhận & Xuất bản</h3>
                        <p style={{ color: '#64748b', marginBottom: 40 }}>Vui lòng kiểm tra kỹ các thông số lần cuối.</p>
                        <div style={{ display: 'inline-grid', gridTemplateColumns: '1fr 1fr', gap: 20, textAlign: 'left', background: '#f8fafc', padding: '32px 40px', borderRadius: 24, border: '1px solid #e2e8f0', minWidth: 500 }}>
                           <div>
                              <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>TÊN ĐỀ THI</div>
                              <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{formData.title || "Chưa đặt tên"}</div>
                           </div>
                           <div>
                              <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>KHỐI LỚP</div>
                              <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{formData.grade}</div>
                           </div>
                           <div>
                              <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>MÔN HỌC</div>
                              <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{formData.subject}</div>
                           </div>
                           <div>
                              <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>SỐ CÂU HỎI</div>
                              <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{formData.questions.length} câu</div>
                           </div>
                        </div>
                     </>
                   )}
                </div>
              )}
           </div>

           {!isDone && (
              <div style={{ padding: '32px 64px', background: 'white', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <button onClick={handlePrev} disabled={currentStep === 1} className="btn-secondary" style={{ padding: '12px 32px', borderRadius: 12, fontWeight: 700 }}>Quay lại</button>
                 <div style={{ display: 'flex', gap: 16 }}>
                    {currentStep < 4 ? (
                      <button onClick={handleNext} className="btn-primary" style={{ padding: '14px 40px', borderRadius: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>Tiếp theo <ChevronRight size={20}/></button>
                    ) : (
                      <button onClick={handleSubmit} disabled={submitting} className="btn-primary" style={{ background: '#059669', padding: '14px 40px', borderRadius: 12, fontWeight: 700 }}>
                        {submitting ? <Loader className="spin" size={20}/> : "Xác nhận & Lưu đề"}
                      </button>
                    )}
                 </div>
              </div>
           )}
        </div>
      )}
    </div>
  );
};

export default ExamCreator;
