import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Clock, CheckCircle, AlertCircle, ChevronRight, ChevronLeft, 
  Send, Info, BookOpen, User, HelpCircle, GraduationCap, Loader, List, Lock, ShieldCheck, Hash
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

// MathText for Student View
const MathText = ({ children, className = "" }) => {
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
  return <div ref={containerRef} className={className}>{children}</div>;
};

const StudentExam = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0); 
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [studentInfo, setStudentInfo] = useState({ name: '', studentId: '', examCode: '', password: '' });
  const [started, setStarted] = useState(false);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    fetchExam();
  }, [examId]);

  useEffect(() => {
    if (started && timeLeft > 0 && !isSubmitted) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && started && !isSubmitted) {
      handleSubmit();
    }
  }, [started, timeLeft, isSubmitted]);

  const fetchExam = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/exam/exams/${examId}`);
      const data = await response.json();
      setExam(data);
      const minutes = parseInt(data.duration) || 45;
      setTimeLeft(minutes * 60);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleStart = () => {
    setAuthError('');
    if (!studentInfo.name || !studentInfo.studentId || !studentInfo.examCode || !studentInfo.password) {
      setAuthError('Vui lòng điền đầy đủ tất cả các trường thông tin.');
      return;
    }

    // Validate Password
    if (exam.password && studentInfo.password !== exam.password) {
      setAuthError('Mật khẩu mở đề không chính xác.');
      return;
    }

    // Validate Exam Code
    if (exam.exam_codes && exam.exam_codes.length > 0) {
      if (!exam.exam_codes.includes(studentInfo.examCode)) {
        setAuthError('Mã đề không tồn tại trong hệ thống.');
        return;
      }
    }

    setStarted(true);
  };

  const handleAnswer = (qId, optionIdx) => {
    setAnswers({ ...answers, [qId]: optionIdx });
  };

  const handleSubmit = async () => {
    if (!window.confirm("Bạn có chắc chắn muốn nộp bài?")) return;
    setIsSubmitting(true);
    
    try {
      const payload = {
        exam_id: parseInt(examId),
        student_name: studentInfo.name,
        student_id: studentInfo.studentId,
        exam_code: studentInfo.examCode,
        answers: answers,
        score: 0, 
        status: "submitted"
      };

      const response = await fetch(`http://localhost:8000/api/exam/submissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setIsSubmitted(true);
      }
    } catch (err) { console.error(err); }
    finally { setIsSubmitting(false); }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}><Loader className="spin" size={48} color="#6366f1"/></div>;

  if (!started) {
    const examCodes = exam?.exam_codes || ["101", "202", "303", "404"]; // Fallback for old exams
    return (
      <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
         <div className="glass-panel animate-scale-up" style={{ background: 'white', maxWidth: 550, width: '100%', borderRadius: 32, padding: 40, textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)' }}>
            <div style={{ width: 80, height: 80, background: '#e0e7ff', color: '#6366f1', borderRadius: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}><GraduationCap size={40}/></div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: 8 }}>{exam?.title}</h1>
            <p style={{ color: '#64748b', marginBottom: 32 }}>Bảo mật đề thi: Vui lòng xác thực danh tính để vào phòng thi.</p>
            
            {authError && (
              <div style={{ background: '#fee2e2', color: '#ef4444', padding: '12px', borderRadius: 12, marginBottom: 24, fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                <AlertCircle size={18}/> {authError}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
               <div style={{ textAlign: 'left' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}><User size={14}/> Họ và Tên</label>
                  <input value={studentInfo.name} onChange={e => setStudentInfo({...studentInfo, name: e.target.value})} style={{ width: '100%', padding: '14px', borderRadius: 12, border: '1px solid #e2e8f0', outline: 'none' }} placeholder="Nguyễn Văn A" />
               </div>
               <div style={{ textAlign: 'left' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}><ShieldCheck size={14}/> SBD</label>
                  <input value={studentInfo.studentId} onChange={e => setStudentInfo({...studentInfo, studentId: e.target.value})} style={{ width: '100%', padding: '14px', borderRadius: 12, border: '1px solid #e2e8f0', outline: 'none' }} placeholder="HS123456" />
               </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 32 }}>
               <div style={{ textAlign: 'left' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}><Hash size={14}/> Mã đề thi</label>
                  <select 
                    value={studentInfo.examCode} 
                    onChange={e => setStudentInfo({...studentInfo, examCode: e.target.value})} 
                    style={{ width: '100%', padding: '14px', borderRadius: 12, border: '1px solid #e2e8f0', outline: 'none', background: 'white' }}
                  >
                     <option value="">Chọn mã đề</option>
                     {examCodes.map(code => <option key={code} value={code}>Mã đề: {code}</option>)}
                  </select>
               </div>
               <div style={{ textAlign: 'left' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}><Lock size={14}/> Mật khẩu mở đề</label>
                  <input type="password" value={studentInfo.password} onChange={e => setStudentInfo({...studentInfo, password: e.target.value})} style={{ width: '100%', padding: '14px', borderRadius: 12, border: '1px solid #e2e8f0', outline: 'none' }} placeholder="••••••" />
               </div>
            </div>

            <div style={{ background: '#f1f5f9', padding: 20, borderRadius: 16, textAlign: 'left', marginBottom: 32, display: 'flex', gap: 16 }}>
               <Info color="#6366f1" size={24} style={{ flexShrink: 0 }}/>
               <div style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.5 }}>
                  <strong>Lưu ý quan trọng:</strong> Bài thi có thời gian làm bài là <strong>{exam?.duration}</strong>. Hãy đảm bảo đường truyền internet ổn định trước khi bắt đầu.
               </div>
            </div>

            <button onClick={handleStart} className="btn-primary" style={{ width: '100%', padding: '16px', borderRadius: 12, fontWeight: 800, fontSize: '1.1rem' }}>Bắt đầu Làm bài</button>
         </div>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
         <div className="glass-panel animate-scale-up" style={{ background: 'white', maxWidth: 500, width: '100%', borderRadius: 32, padding: 40, textAlign: 'center' }}>
            <div style={{ width: 100, height: 100, background: '#d1fae5', color: '#059669', borderRadius: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', transform: 'rotate(10deg)' }}><CheckCircle size={60}/></div>
            <h1 style={{ fontSize: '2.2rem', fontWeight: 900, marginBottom: 12 }}>Nộp bài Thành công!</h1>
            <p style={{ color: '#64748b', fontSize: '1.1rem', marginBottom: 40, lineHeight: 1.6 }}>Cảm ơn <strong>{studentInfo.name}</strong>, bài làm (Mã đề: {studentInfo.examCode}) của bạn đã được ghi nhận.</p>
            <button onClick={() => window.close()} className="btn-secondary" style={{ width: '100%', padding: '14px', borderRadius: 12, fontWeight: 700 }}>Hoàn tất</button>
         </div>
      </div>
    );
  }

  const content = safeParse(exam.content);
  let questions = content.questions || [];
  
  // Nếu đề thi có nhiều mã đề (shuffled versions), lấy bộ câu hỏi của mã đề đã chọn
  if (content.versions && content.versions.length > 0) {
    const selectedVersion = content.versions.find(v => v.code.toString() === studentInfo.examCode);
    if (selectedVersion) {
      questions = selectedVersion.questions;
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9', paddingBottom: 100 }}>
       <style>{`
          .pulse { animation: pulse-red 1s infinite; }
          @keyframes pulse-red { 0% { transform: scale(1); } 50% { transform: scale(1.05); color: #ef4444; } 100% { transform: scale(1); } }
          .btn-primary { background: var(--primary); color: white; border: none; cursor: pointer; transition: all 0.2s; }
          .btn-primary:hover { opacity: 0.9; transform: translateY(-2px); }
       `}</style>
       {/* Sticky Header */}
       <div style={{ position: 'sticky', top: 0, background: 'white', borderBottom: '1px solid #e2e8f0', padding: '16px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 100, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <div>
             <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>{exam.title}</h2>
             <div style={{ fontSize: '0.8rem', color: '#64748b' }}><User size={12} style={{ display: 'inline', marginRight: 4 }}/> {studentInfo.name} • SBD: {studentInfo.studentId} • Mã đề: {studentInfo.examCode}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: timeLeft < 300 ? '#fee2e2' : '#f1f5f9', padding: '8px 20px', borderRadius: 12, border: `1px solid ${timeLeft < 300 ? '#fca5a5' : '#e2e8f0'}`, color: timeLeft < 300 ? '#ef4444' : '#1e293b' }}>
             <Clock size={20} className={timeLeft < 300 ? 'pulse' : ''}/>
             <span style={{ fontSize: '1.3rem', fontWeight: 900, fontFamily: 'monospace' }}>{formatTime(timeLeft)}</span>
          </div>
          <button 
            onClick={handleSubmit} 
            disabled={isSubmitting}
            className="btn-primary" 
            style={{ padding: '10px 24px', borderRadius: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, background: '#059669' }}
          >
            {isSubmitting ? <Loader className="spin" size={18}/> : <Send size={18}/>} Nộp bài
          </button>
       </div>

       <div style={{ maxWidth: 800, margin: '40px auto', padding: '0 20px', marginLeft: 'calc(50% - 400px - 140px)' }}>
          {questions?.map((q, idx) => (
            <div key={idx} id={`q-${idx}`} style={{ background: 'white', borderRadius: 24, padding: 32, marginBottom: 32, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
               <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
                  <div style={{ width: 32, height: 32, background: 'var(--primary)', color: 'white', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0 }}>{idx + 1}</div>
                  <MathText style={{ fontSize: '1.1rem', fontWeight: 600, color: '#1e293b', lineHeight: 1.6 }}>{q.content}</MathText>
               </div>
               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  {q.options?.map((opt, oIdx) => (
                    <button 
                      key={oIdx} 
                      onClick={() => handleAnswer(q.id, oIdx)}
                      style={{ 
                        padding: '16px 20px', 
                        textAlign: 'left', 
                        borderRadius: 16, 
                        border: `2px solid ${answers[q.id] === oIdx ? 'var(--primary)' : '#f1f5f9'}`, 
                        background: answers[q.id] === oIdx ? '#f5f3ff' : 'white',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12
                      }}
                    >
                       <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${answers[q.id] === oIdx ? 'var(--primary)' : '#cbd5e1'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {answers[q.id] === oIdx && <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--primary)' }}></div>}
                       </div>
                       <MathText style={{ fontWeight: 600, color: answers[q.id] === oIdx ? 'var(--primary)' : '#475569' }}>{opt}</MathText>
                    </button>
                  ))}
               </div>
            </div>
          ))}
       </div>

       {/* Quick Nav (Floating Sidebar Right) */}
       <div style={{ 
          position: 'fixed', 
          right: 40, 
          top: 100, 
          width: 240, 
          background: 'white', 
          padding: '24px', 
          borderRadius: 24, 
          border: '1px solid #e2e8f0', 
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)',
          zIndex: 90
       }}>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><List size={18}/> Danh sách câu hỏi</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
             {questions?.map((q, idx) => (
               <div 
                 key={idx} 
                 style={{ 
                   width: 32, 
                   height: 32, 
                   borderRadius: 8, 
                   background: answers[q.id] !== undefined ? 'var(--primary)' : '#f1f5f9', 
                   color: answers[q.id] !== undefined ? 'white' : '#64748b', 
                   display: 'flex', 
                   alignItems: 'center', 
                   justifyContent: 'center', 
                   fontSize: '0.75rem', 
                   fontWeight: 700, 
                   cursor: 'pointer',
                   transition: 'all 0.2s',
                   border: answers[q.id] !== undefined ? 'none' : '1px solid #e2e8f0'
                 }}
                 onClick={() => document.getElementById(`q-${idx}`).scrollIntoView({ behavior: 'smooth', block: 'center' })}
               >
                 {idx + 1}
               </div>
             ))}
          </div>
          <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid #f1f5f9', fontSize: '0.8rem', color: '#64748b' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <div style={{ width: 12, height: 12, borderRadius: 3, background: 'var(--primary)' }}></div> Đã làm
             </div>
             <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 12, height: 12, borderRadius: 3, background: '#f1f5f9', border: '1px solid #e2e8f0' }}></div> Chưa làm
             </div>
          </div>
       </div>
    </div>
  );
};

export default StudentExam;
