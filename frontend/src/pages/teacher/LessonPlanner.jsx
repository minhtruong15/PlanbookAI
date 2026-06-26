import React, { useState, useEffect } from 'react';
import { Search, Plus, FileText, Calendar, BookOpen, Clock, Loader, ChevronRight, ChevronLeft, Save, Sparkles, CheckCircle, Target, Briefcase, Layers, Rocket, Eye, Trash2, Crown, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LessonPlanner = () => {
  const [lessons, setLessons] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewTab, setViewTab] = useState('personal'); // 'personal' or 'system'
  const [hasSubscription, setHasSubscription] = useState(false);
  const [hasAIAccess, setHasAIAccess] = useState(false);
  const navigate = useNavigate();
  
  // State for Wizard
  const [showWizard, setShowWizard] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);
  const [isVipTemplate, setIsVipTemplate] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Form Data
  const [formData, setFormData] = useState({
    title: '',
    subject: 'Toán',
    grade: 'Lớp 10',
    objectives: '',
    materials: '',
    methods: '5 bước',
    warmUp: '',
    introduction: '',
    practice: '',
    production: '',
    closing: ''
  });

  const fetchData = async () => {
    try {
      // Lấy giáo án cá nhân
      const resLessons = await fetch('http://localhost:8000/api/lesson/lessons', {
        headers: { 'Authorization': `Bearer ${sessionStorage.getItem('accessToken')}` }
      });
      if (resLessons.ok) {
        const data = await resLessons.json();
        setLessons(data);
      }
      
      // Lấy giáo án mẫu từ hệ thống
      const resTemplates = await fetch('http://localhost:8000/api/lesson/templates', {
        headers: { 'Authorization': `Bearer ${sessionStorage.getItem('accessToken')}` }
      });
      if (resTemplates.status === 403) {
        setHasSubscription(false);
      } else if (resTemplates.ok) {
        setHasSubscription(true);
        const tplData = await resTemplates.json();
        setTemplates(tplData);
      }
      
      // Lấy thông tin gói để kiểm tra quyền dùng AI
      try {
        const resSub = await fetch('http://localhost:8000/api/package/subscriptions/my', {
          headers: { 'Authorization': `Bearer ${sessionStorage.getItem('accessToken')}` }
        });
        if (resSub.ok) {
          const subData = await resSub.json();
          if (subData.has_subscription && subData.packages) {
            const hasAi = subData.packages.some(p => {
              const name = (p.package_name || '').toLowerCase();
              const feat = (p.features || '').toLowerCase();
              return name.includes('ai') || name.includes('vàng') || name.includes('vip') || feat.includes('ai');
            });
            setHasAIAccess(hasAi);
          } else {
            setHasAIAccess(false);
          }
        }
      } catch(e) {}

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); // Cập nhật real-time mỗi 5 giây
    return () => clearInterval(interval);
  }, []);

  const handleNext = () => setCurrentStep(prev => Math.min(prev + 1, 4));
  const handlePrev = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const handleAskAI = (field) => {
    if (!hasAIAccess) {
      alert("Bạn chưa mua gói thuê bao có sử dụng AI! Vui lòng nâng cấp gói AI để sử dụng tính năng này.");
      return;
    }
    // Giả lập AI sinh nội dung với hiệu ứng chờ
    const aiContent = {
      objectives: "- Kiến thức: Học sinh hiểu rõ các định nghĩa và công thức cốt lõi.\n- Kỹ năng: Vận dụng linh hoạt vào các bài tập thực hành nâng cao.\n- Phẩm chất: Hình thành tư duy phản biện và khả năng tự học.",
      warmUp: "Bắt đầu bằng một câu đố vui hoặc video ngắn 3 phút để khơi gợi sự tò mò của học sinh về chủ đề hôm nay.",
      introduction: "Sử dụng sơ đồ tư duy (Mindmap) để hệ thống hóa kiến thức mới. Kết hợp thảo luận nhóm nhỏ.",
      practice: "Thực hiện chuỗi bài tập từ cơ bản đến nâng cao trên phiếu học tập. Giáo viên quan sát và hỗ trợ từng nhóm.",
      production: "Yêu cầu học sinh thiết kế một sản phẩm nhỏ hoặc giải quyết một tình huống thực tế liên quan đến bài học.",
      closing: "Chốt lại các từ khóa quan trọng. Giao nhiệm vụ tìm hiểu bài tiếp theo qua hệ thống PlanBook."
    };
    
    // Thêm một chút delay để tạo cảm giác AI đang suy nghĩ
    setTimeout(() => {
      setFormData(prev => ({ ...prev, [field]: aiContent[field] || 'Nội dung đã được tối ưu bởi AI...' }));
    }, 500);
  };

  const handleCreateNew = () => {
    setFormData({ title: '', subject: 'Toán', grade: 'Lớp 10', objectives: '', materials: '', methods: '5 bước', warmUp: '', introduction: '', practice: '', production: '', closing: '' });
    setIsViewMode(false);
    setIsVipTemplate(false);
    setCurrentStep(1);
    setShowWizard(true);
  };

  const handleViewLesson = (lesson) => {
    try {
      let contentData = {};
      try { contentData = JSON.parse(lesson.content || '{}'); } catch(e) { contentData = { objectives: lesson.content }; }
      setFormData({
        title: lesson.title, subject: lesson.subject, grade: lesson.grade,
        objectives: contentData.objectives || '', materials: contentData.materials || '', methods: contentData.methods || '5 bước',
        warmUp: contentData.activities?.warmUp || '', introduction: contentData.activities?.introduction || '',
        practice: contentData.activities?.practice || '', production: contentData.activities?.production || '', closing: contentData.activities?.closing || ''
      });
      setIsViewMode(true);
      setIsVipTemplate(contentData.isVip || false);
      setCurrentStep(4);
      setShowWizard(true);
    } catch (e) { alert("Dữ liệu không hợp lệ!"); }
  };

  const handleUseTemplate = (tpl) => {
    try {
      let contentData = {};
      try { contentData = JSON.parse(tpl.content || '{}'); } catch(e) { contentData = { objectives: tpl.content }; }
      setFormData({
        title: tpl.title, subject: tpl.subject, grade: tpl.grade,
        objectives: contentData.objectives || '', materials: contentData.materials || '', methods: contentData.methods || '5 bước',
        warmUp: contentData.activities?.warmUp || '', introduction: contentData.activities?.introduction || '',
        practice: contentData.activities?.practice || '', production: contentData.activities?.production || '', closing: contentData.activities?.closing || ''
      });
      setIsViewMode(false); // Cho phép sửa và lưu
      setIsVipTemplate(true); // Đánh dấu là xuất phát từ VIP
      setCurrentStep(1);
      setShowWizard(true);
    } catch (e) { alert("Dữ liệu mẫu không hợp lệ!"); }
  };

  const handleDeleteLesson = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa giáo án này?')) return;
    try {
      await fetch(`http://localhost:8000/api/lesson/lessons/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${sessionStorage.getItem('accessToken')}` }
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    
    const contentPayload = JSON.stringify({
      isVip: isVipTemplate,
      objectives: formData.objectives,
      materials: formData.materials,
      methods: formData.methods,
      activities: {
        warmUp: formData.warmUp,
        introduction: formData.introduction,
        practice: formData.practice,
        production: formData.production,
        closing: formData.closing
      }
    });

    const payload = {
      title: formData.title,
      subject: formData.subject,
      grade: formData.grade,
      content: contentPayload
    };

    try {
      const token = sessionStorage.getItem('accessToken');
      if (!token) {
        alert("Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.");
        setShowWizard(false);
        return;
      }

      const response = await fetch('http://localhost:8000/api/lesson/lessons', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      
      if (response.ok) {
        setShowWizard(false);
        setCurrentStep(1);
        setFormData({ title: '', subject: 'Toán', grade: 'Lớp 10', objectives: '', materials: '', methods: '5 bước', warmUp: '', introduction: '', practice: '', production: '', closing: '' });
        fetchData(); 
      } else {
        const errorText = await response.text();
        console.error("Server error response:", errorText);
        let errorMsg = "Không thể lưu giáo án";
        try {
          const errorData = JSON.parse(errorText);
          errorMsg = errorData.detail || errorMsg;
        } catch (e) {
          errorMsg = `Lỗi hệ thống (${response.status}). Vui lòng báo quản trị viên.`;
        }
        alert(`Lỗi từ máy chủ: ${errorMsg}`);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      alert(`Lỗi kết nối: ${err.message}. Đảm bảo Gateway đang chạy tại cổng 8000.`);
    } finally {
      setSubmitting(false);
    }
  };

  // RENDER WIZARD STEPS
  const renderStep1 = () => (
    <div className="wizard-step animate-fade-in">
      <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: 20 }}>Bước 1: Thông tin & Mục tiêu</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
        <div>
          <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, fontSize: '0.95rem' }}>Tên bài học <span style={{color:'red'}}>*</span></label>
          <input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} type="text" style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border-color)', outline: 'none' }} placeholder="VD: Phép tính đạo hàm" />
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, fontSize: '0.95rem' }}>Môn học</label>
            <select value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border-color)', outline: 'none' }}>
              <option value="Toán">Toán</option>
              <option value="Lý">Lý</option>
              <option value="Hóa">Hóa</option>
              <option value="Văn">Văn</option>
              <option value="Anh">Anh</option>
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, fontSize: '0.95rem' }}>Khối lớp</label>
            <select value={formData.grade} onChange={e => setFormData({...formData, grade: e.target.value})} style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border-color)', outline: 'none' }}>
              <option value="Lớp 10">Lớp 10</option>
              <option value="Lớp 11">Lớp 11</option>
              <option value="Lớp 12">Lớp 12</option>
            </select>
          </div>
        </div>
      </div>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <label style={{ fontWeight: 500, fontSize: '0.95rem' }}>Xác định mục tiêu (Kiến thức, Kỹ năng, Phẩm chất)</label>
          <button type="button" onClick={() => handleAskAI('objectives')} style={{ background: 'var(--primary-light)', color: 'var(--primary)', border: 'none', padding: '4px 10px', borderRadius: 6, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', fontWeight: 600 }}>
            <Sparkles size={14} /> AI Gợi ý
          </button>
        </div>
        <textarea value={formData.objectives} onChange={e => setFormData({...formData, objectives: e.target.value})} style={{ width: '100%', padding: '12px 14px', borderRadius: 8, border: '1px solid var(--border-color)', outline: 'none', height: 120, lineHeight: 1.5 }} placeholder="Nhập mục tiêu học sinh cần đạt được sau bài học..."></textarea>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="wizard-step animate-fade-in">
      <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: 20 }}>Bước 2: Phương pháp & Chuẩn bị</h3>
      <div style={{ marginBottom: 20 }}>
        <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, fontSize: '0.95rem' }}>Phương pháp giảng dạy chủ đạo</label>
        <select value={formData.methods} onChange={e => setFormData({...formData, methods: e.target.value})} style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border-color)', outline: 'none' }}>
          <option value="5 bước">Tiến trình 5 bước chuẩn Bộ GD&ĐT</option>
          <option value="PPP">Mô hình PPP (Presentation - Practice - Production)</option>
          <option value="Dự án">Dạy học theo dự án (Project-based learning)</option>
          <option value="Đảo ngược">Lớp học đảo ngược (Flipped Classroom)</option>
        </select>
      </div>
      <div>
        <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, fontSize: '0.95rem' }}>Chuẩn bị thiết bị và học liệu</label>
        <textarea value={formData.materials} onChange={e => setFormData({...formData, materials: e.target.value})} style={{ width: '100%', padding: '12px 14px', borderRadius: 8, border: '1px solid var(--border-color)', outline: 'none', height: 150, lineHeight: 1.5 }} placeholder="- Giáo viên: Laptop, Máy chiếu, Phiếu bài tập...&#10;- Học sinh: SGK, Vở ghi, Giấy nháp..."></textarea>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="wizard-step animate-fade-in">
      <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: 20 }}>Bước 3: Xây dựng Cấu trúc Chi tiết</h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Khởi động */}
        <div style={{ background: '#f8fafc', padding: 16, borderRadius: 12, border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <h4 style={{ fontWeight: 600, color: '#334155' }}>1. Hoạt động Khởi động (Warm-up)</h4>
            <button type="button" onClick={() => handleAskAI('warmUp')} style={{ background: '#e0e7ff', color: '#4f46e5', border: 'none', padding: '4px 10px', borderRadius: 6, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}><Sparkles size={14} /> AI</button>
          </div>
          <textarea value={formData.warmUp} onChange={e => setFormData({...formData, warmUp: e.target.value})} style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #cbd5e1', outline: 'none', height: 60 }} placeholder="Mô tả hoạt động tạo hứng thú..."></textarea>
        </div>

        {/* Hình thành kiến thức */}
        <div style={{ background: '#f8fafc', padding: 16, borderRadius: 12, border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <h4 style={{ fontWeight: 600, color: '#334155' }}>2. Hình thành kiến thức (Introduction)</h4>
            <button type="button" onClick={() => handleAskAI('introduction')} style={{ background: '#e0e7ff', color: '#4f46e5', border: 'none', padding: '4px 10px', borderRadius: 6, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}><Sparkles size={14} /> AI</button>
          </div>
          <textarea value={formData.introduction} onChange={e => setFormData({...formData, introduction: e.target.value})} style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #cbd5e1', outline: 'none', height: 80 }} placeholder="Trình bày kiến thức mới, ví dụ, giảng giải..."></textarea>
        </div>

        {/* Luyện tập */}
        <div style={{ background: '#f8fafc', padding: 16, borderRadius: 12, border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <h4 style={{ fontWeight: 600, color: '#334155' }}>3. Luyện tập (Practice)</h4>
            <button type="button" onClick={() => handleAskAI('practice')} style={{ background: '#e0e7ff', color: '#4f46e5', border: 'none', padding: '4px 10px', borderRadius: 6, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}><Sparkles size={14} /> AI</button>
          </div>
          <textarea value={formData.practice} onChange={e => setFormData({...formData, practice: e.target.value})} style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #cbd5e1', outline: 'none', height: 80 }} placeholder="Bài tập thực hành, bài tập nhóm..."></textarea>
        </div>

        {/* Vận dụng */}
        <div style={{ background: '#f8fafc', padding: 16, borderRadius: 12, border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <h4 style={{ fontWeight: 600, color: '#334155' }}>4. Vận dụng & Dặn dò (Production & Closing)</h4>
            <button type="button" onClick={() => handleAskAI('production')} style={{ background: '#e0e7ff', color: '#4f46e5', border: 'none', padding: '4px 10px', borderRadius: 6, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}><Sparkles size={14} /> AI</button>
          </div>
          <textarea value={formData.production} onChange={e => setFormData({...formData, production: e.target.value})} style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #cbd5e1', outline: 'none', height: 80 }} placeholder="Áp dụng vào thực tế, củng cố kiến thức, BTVN..."></textarea>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="wizard-step animate-fade-in">
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <CheckCircle size={48} color="#059669" style={{ margin: '0 auto 10px' }} />
        <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-main)' }}>Hoàn tất Giáo án!</h3>
        <p style={{ color: 'var(--text-muted)' }}>Vui lòng kiểm tra lại thông tin trước khi xuất bản.</p>
      </div>
      
      <div style={{ background: 'white', padding: 24, borderRadius: 12, border: '1px solid var(--border-color)', height: 350, overflowY: 'auto' }}>
        <h2 style={{ textAlign: 'center', fontWeight: 700, fontSize: '1.5rem', marginBottom: 4 }}>{formData.title || 'Chưa nhập tên bài'}</h2>
        <div style={{ textAlign: 'center', fontStyle: 'italic', color: 'var(--text-muted)', marginBottom: 20 }}>Môn: {formData.subject} - {formData.grade} | Phương pháp: {formData.methods}</div>
        
        <h4 style={{ fontWeight: 600, borderBottom: '1px solid var(--border-color)', paddingBottom: 6, marginBottom: 10 }}>I. Mục tiêu</h4>
        <div style={{ whiteSpace: 'pre-line', marginBottom: 20, color: '#374151', fontSize: '0.95rem' }}>{formData.objectives || 'Chưa có dữ liệu'}</div>
        
        <h4 style={{ fontWeight: 600, borderBottom: '1px solid var(--border-color)', paddingBottom: 6, marginBottom: 10 }}>II. Thiết bị & Học liệu</h4>
        <div style={{ whiteSpace: 'pre-line', marginBottom: 20, color: '#374151', fontSize: '0.95rem' }}>{formData.materials || 'Chưa có dữ liệu'}</div>
        
        <h4 style={{ fontWeight: 600, borderBottom: '1px solid var(--border-color)', paddingBottom: 6, marginBottom: 10 }}>III. Tiến trình dạy học</h4>
        <div style={{ paddingLeft: 10 }}>
          <p style={{ fontWeight: 600, color: '#1e40af', marginTop: 10 }}>1. Khởi động:</p>
          <div style={{ whiteSpace: 'pre-line', color: '#374151', fontSize: '0.95rem' }}>{formData.warmUp}</div>
          
          <p style={{ fontWeight: 600, color: '#1e40af', marginTop: 10 }}>2. Hình thành kiến thức:</p>
          <div style={{ whiteSpace: 'pre-line', color: '#374151', fontSize: '0.95rem' }}>{formData.introduction}</div>
          
          <p style={{ fontWeight: 600, color: '#1e40af', marginTop: 10 }}>3. Luyện tập:</p>
          <div style={{ whiteSpace: 'pre-line', color: '#374151', fontSize: '0.95rem' }}>{formData.practice}</div>
          
          <p style={{ fontWeight: 600, color: '#1e40af', marginTop: 10 }}>4. Vận dụng & Dặn dò:</p>
          <div style={{ whiteSpace: 'pre-line', color: '#374151', fontSize: '0.95rem' }}>{formData.production}</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="page-container">
      {/* MÀN HÌNH DANH SÁCH GIÁO ÁN (Khi không bật Wizard) */}
      {!showWizard ? (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div>
              <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1e293b', marginBottom: 4 }}>Giáo án Cá nhân</h1>
              <p style={{ color: '#64748b' }}>Hệ thống quản lý và soạn thảo giáo án thông minh</p>
            </div>
            <button className="btn-primary" onClick={handleCreateNew} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 20px', borderRadius: 12, background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)', border: 'none', color: 'white', fontWeight: 600, boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)', cursor: 'pointer' }}>
              <Plus size={20} /> Soạn Giáo án Wizard
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: 24 }}>
            {/* Sidebar Folder */}
            <div className="glass-panel" style={{ padding: 20, borderRadius: 16, alignSelf: 'start' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <BookOpen size={18} color="var(--primary)" /> Thư mục Quản lý
              </h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <li onClick={() => setViewTab('personal')} style={{ padding: '10px 14px', background: viewTab === 'personal' ? 'var(--primary-light)' : 'transparent', color: viewTab === 'personal' ? 'var(--primary)' : 'var(--text-main)', borderRadius: 8, fontWeight: viewTab === 'personal' ? 600 : 500, cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 8 }}>
                   <Briefcase size={16} /> Giáo án Cá nhân <span style={{ marginLeft: 'auto', background: viewTab === 'personal' ? 'white' : '#f1f5f9', padding: '2px 8px', borderRadius: 20, fontSize: '0.75rem' }}>{lessons.length}</span>
                </li>
                <li onClick={() => setViewTab('system')} style={{ padding: '10px 14px', background: viewTab === 'system' ? '#e0e7ff' : 'transparent', color: viewTab === 'system' ? '#4338ca' : 'var(--text-main)', borderRadius: 8, fontWeight: viewTab === 'system' ? 600 : 500, cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 8 }}>
                   <BookOpen size={16} /> Mẫu Hệ thống <span style={{ marginLeft: 'auto', background: viewTab === 'system' ? 'white' : '#f1f5f9', padding: '2px 8px', borderRadius: 20, fontSize: '0.75rem' }}>{templates.length}</span>
                </li>
              </ul>
            </div>

            {/* Content List */}
            <div className="glass-panel" style={{ padding: 20, borderRadius: 16 }}>
              <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: 14, top: 11 }} />
                  <input 
                    type="text" 
                    placeholder="Tìm kiếm giáo án..." 
                    style={{ width: '100%', padding: '10px 16px 10px 40px', borderRadius: 8, border: '1px solid var(--border-color)', outline: 'none' }} 
                  />
                </div>
              </div>

              {loading ? (
                <div style={{ textAlign: 'center', padding: 40 }}><Loader className="spin" size={32} color="var(--primary)" /></div>
              ) : viewTab === 'personal' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {lessons.map(lesson => {
                    let isVip = false;
                    try { isVip = JSON.parse(lesson.content).isVip; } catch(e){}
                    return (
                    <div key={lesson.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 16, border: isVip ? '1px solid #fde68a' : '1px solid var(--border-color)', background: isVip ? '#fffbeb' : 'white', borderRadius: 12, transition: 'all 0.2s', cursor: 'pointer' }} className="hover-card">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div style={{ width: 48, height: 48, background: isVip ? 'linear-gradient(135deg, #f59e0b, #d97706)' : '#e0e7ff', color: isVip ? 'white' : '#4f46e5', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: isVip ? '0 4px 6px rgba(245,158,11,0.2)' : 'none' }}>
                          {isVip ? <Crown size={24} /> : <FileText size={24} />}
                        </div>
                        <div>
                          <h4 style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: 4, fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                            {lesson.title.replace(' (Bản sao)', '')} 
                            {isVip && <span style={{ fontSize: '0.65rem', background: '#f59e0b', color: 'white', padding: '2px 6px', borderRadius: 6, fontWeight: 800 }}>VIP</span>}
                          </h4>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><BookOpen size={14} /> {lesson.subject} - {lesson.grade}</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Calendar size={14} /> {(new Date(lesson.created_at)).toLocaleDateString('vi-VN')}</span>
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 10 }}>
                        <button onClick={() => handleViewLesson(lesson)} style={{ padding: '8px 14px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 6, border: '1px solid #e2e8f0', background: 'white', color: '#475569', fontWeight: 500, cursor: 'pointer' }}>
                          <Eye size={16} /> Xem
                        </button>
                        <button onClick={() => handleDeleteLesson(lesson.id)} style={{ padding: '8px', borderRadius: 8, border: '1px solid #fee2e2', background: '#fef2f2', color: '#ef4444', cursor: 'pointer' }}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  )})}
                  {lessons.length === 0 && <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Chưa có giáo án cá nhân nào. Hãy bấm "Soạn Giáo án Wizard" để bắt đầu!</div>}
                </div>
              ) : !hasSubscription ? (
                <div style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', borderRadius: 24, padding: 40, textAlign: 'center', color: 'white', position: 'relative', overflow: 'hidden' }}>
                  <Crown size={60} color="#f59e0b" style={{ margin: '0 auto 20px' }} />
                  <h3 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 16 }}>Tính năng Giới hạn VIP</h3>
                  <p style={{ fontSize: '1.1rem', color: '#cbd5e1', marginBottom: 30, maxWidth: 500, margin: '0 auto 30px' }}>
                    Mẫu Hệ thống cung cấp kho tàng giáo án chất lượng cao được kiểm duyệt chặt chẽ. Vui lòng nâng cấp Gói Dịch Vụ để mở khóa quyền truy cập.
                  </p>
                  <button onClick={() => navigate('/teacher/packages')} style={{ padding: '14px 30px', borderRadius: 12, background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: 'white', border: 'none', fontSize: '1.1rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 15px rgba(245, 158, 11, 0.4)', display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                    <Lock size={20} /> Mở khóa ngay
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {templates.map(tpl => (
                    <div key={tpl.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 16, border: '1px solid #e0e7ff', background: '#f8fafc', borderRadius: 12, transition: 'all 0.2s', cursor: 'pointer' }} className="hover-card">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div style={{ width: 48, height: 48, background: 'linear-gradient(135deg, #4f46e5, #3b82f6)', color: 'white', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 6px rgba(59, 130, 246, 0.3)' }}>
                          <Sparkles size={24} />
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                            <h4 style={{ fontWeight: 700, color: '#1e293b', fontSize: '1.05rem' }}>{tpl.title}</h4>
                            <span style={{ fontSize: '0.65rem', background: '#dcfce7', color: '#166534', padding: '2px 6px', borderRadius: 4, fontWeight: 700, textTransform: 'uppercase' }}>Chuẩn hệ thống</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: '0.85rem', color: '#64748b' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><BookOpen size={14} /> Môn: {tpl.subject}</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Layers size={14} /> Khối: {tpl.grade}</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Target size={14} /> Người tạo: {tpl.author}</span>
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 10 }}>
                        <button onClick={() => handleUseTemplate(tpl)} style={{ padding: '8px 16px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 6, border: 'none', background: '#4f46e5', color: 'white', fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 4px rgba(79, 70, 229, 0.2)' }}>
                          Sử dụng mẫu này
                        </button>
                      </div>
                    </div>
                  ))}
                  {templates.length === 0 && <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Hệ thống chưa cung cấp giáo án mẫu nào.</div>}
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        /* MÀN HÌNH WIZARD SOẠN GIÁO ÁN */
        <div style={{ background: 'white', borderRadius: 20, boxShadow: '0 10px 30px rgba(0,0,0,0.05)', overflow: 'hidden', minHeight: 600, display: 'flex', flexDirection: 'column' }}>
          
          {/* Wizard Header / Stepper */}
          <div style={{ background: 'var(--bg-secondary)', padding: '24px 40px', borderBottom: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>Trợ lý Sư phạm: Tạo Giáo án</h2>
              <button onClick={() => setShowWizard(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontWeight: 500 }}>Thoát</button>
            </div>
            
            {/* Stepper Logic */}
            <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', maxWidth: 800, margin: '0 auto' }}>
              <div style={{ position: 'absolute', top: 22, left: 40, right: 40, height: 4, background: '#f1f5f9', zIndex: 0, borderRadius: 2 }}></div>
              <div style={{ position: 'absolute', top: 22, left: 40, width: `calc(${((currentStep - 1) / 3) * 100}% - 80px)`, height: 4, background: 'linear-gradient(to right, #4f46e5, #7c3aed)', zIndex: 1, transition: 'width 0.4s ease', borderRadius: 2 }}></div>
              
              {[
                { id: 1, label: 'Mục tiêu', icon: <Target size={20} /> },
                { id: 2, label: 'Chuẩn bị', icon: <Briefcase size={20} /> },
                { id: 3, label: 'Tiến trình', icon: <Layers size={20} /> },
                { id: 4, label: 'Xem lại', icon: <Rocket size={20} /> }
              ].map(step => (
                <div key={step.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, gap: 10, width: 80 }}>
                  <div style={{ 
                    width: 48, height: 48, borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: currentStep >= step.id ? '#4f46e5' : 'white',
                    color: currentStep >= step.id ? 'white' : '#94a3b8',
                    border: `2px solid ${currentStep >= step.id ? '#4f46e5' : '#e2e8f0'}`,
                    boxShadow: currentStep === step.id ? '0 0 0 4px rgba(79, 70, 229, 0.15)' : 'none',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}>
                    {currentStep > step.id ? <CheckCircle size={24} /> : step.icon}
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: currentStep >= step.id ? 700 : 500, color: currentStep >= step.id ? '#1e293b' : '#94a3b8', textAlign: 'center', whiteSpace: 'nowrap' }}>
                    {step.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Wizard Body */}
          <div style={{ padding: '30px 40px', flex: 1, overflowY: 'auto' }}>
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}
          </div>

          {/* Wizard Footer */}
          <div style={{ padding: '20px 40px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
            <button 
              onClick={handlePrev} 
              disabled={currentStep === 1 || (isViewMode && currentStep === 4)}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px', borderRadius: 12, border: '1px solid #e2e8f0', background: 'white', color: (currentStep === 1 || (isViewMode && currentStep === 4)) ? '#cbd5e1' : '#475569', cursor: (currentStep === 1 || (isViewMode && currentStep === 4)) ? 'not-allowed' : 'pointer', fontWeight: 600 }}
            >
              <ChevronLeft size={20} /> Quay lại
            </button>
            
            {currentStep < 4 ? (
              <button 
                onClick={handleNext} 
                className="btn-primary" 
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 28px', borderRadius: 12, background: '#4f46e5', color: 'white', border: 'none', fontWeight: 600, cursor: 'pointer' }}
              >
                Tiếp tục <ChevronRight size={20} />
              </button>
            ) : (
              !isViewMode && (
                <button 
                  onClick={handleSubmit} 
                  disabled={submitting || !formData.title}
                  className="btn-primary" 
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 32px', borderRadius: 12, background: '#059669', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)' }}
                >
                  {submitting ? <Loader className="spin" size={20} /> : <Save size={20} />} Lưu Giáo án
                </button>
              )
            )}
          </div>

        </div>
      )}
    </div>
  );
};

export default LessonPlanner;
