import React, { useState, useEffect } from 'react';
import { FileEdit, Plus, Search, Filter, MoreVertical, Edit, Trash2, Eye } from 'lucide-react';

const LessonTemplate = () => {
  const [activeTab, setActiveTab] = useState('list'); // list, create
  const [searchQuery, setSearchQuery] = useState('');
  const [templates, setTemplates] = useState([]);
  
  const [newTemplate, setNewTemplate] = useState({ title: '', subject: 'Toán học', grade: 'All', content: '' });
  const [editingId, setEditingId] = useState(null);
  const [editorTab, setEditorTab] = useState('edit'); // edit, preview

  const variableTags = [
    { tag: '{{ten_bai}}', desc: 'Tên bài học' },
    { tag: '{{muc_tieu}}', desc: 'Mục tiêu bài học' },
    { tag: '{{thiet_bi}}', desc: 'Thiết bị & Học liệu' },
    { tag: '{{khoi_dong}}', desc: 'Hoạt động Khởi động' },
    { tag: '{{hinh_thanh_kt}}', desc: 'Hình thành kiến thức' },
    { tag: '{{luyen_tap}}', desc: 'Hoạt động Luyện tập' },
    { tag: '{{van_dung}}', desc: 'Vận dụng & Dặn dò' }
  ];

  const insertTag = (tag) => {
    setNewTemplate(prev => ({ ...prev, content: prev.content + tag + ' ' }));
  };

  const fetchData = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/lesson/templates', {
        headers: { 'Authorization': `Bearer ${sessionStorage.getItem('accessToken')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTemplates(data);
      }
    } catch (e) {
      console.log('Error fetching templates', e);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSave = async () => {
    if (!newTemplate.title || !newTemplate.content) return alert('Vui lòng nhập tên và nội dung giáo án!');
    try {
      const url = editingId ? `http://localhost:8000/api/lesson/templates/${editingId}` : 'http://localhost:8000/api/lesson/templates';
      const method = editingId ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method: method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(newTemplate)
      });
      if (res.ok) {
        setActiveTab('list');
        setNewTemplate({ title: '', subject: 'Toán học', grade: 'All', content: '' });
        setEditingId(null);
        fetchData();
      }
    } catch (e) {
      alert('Lỗi lưu giáo án mẫu. Backend có thể chưa khởi động xong.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Xóa giáo án mẫu này?')) return;
    try {
      const res = await fetch(`http://localhost:8000/api/lesson/templates/${id}`, { 
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${sessionStorage.getItem('accessToken')}` }
      });
      if (res.ok) fetchData();
    } catch (e) {}
  };

  const handleEdit = (item) => {
    setNewTemplate({ title: item.title, subject: item.subject, grade: item.grade, content: item.content });
    setEditingId(item.id);
    setActiveTab('create');
    setEditorTab('edit');
  };

  const handleApprove = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'Bản nháp' ? 'Chờ duyệt' : 'Đã duyệt';
    try {
      const res = await fetch(`http://localhost:8000/api/lesson/templates/${id}`, {
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

  const filteredTemplates = templates.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="page-container" style={{ background: '#f8fafc', minHeight: '100vh', padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, background: 'linear-gradient(135deg, #312e81 0%, #4f46e5 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'flex', alignItems: 'center', gap: 12 }}>
            <FileEdit size={32} color="#4f46e5" /> Quản lý Giáo án Mẫu
          </h1>
          <p style={{ color: '#64748b', fontSize: '1rem', marginTop: 8 }}>Xây dựng và quản lý các khung giáo án chuẩn mực cho giáo viên.</p>
        </div>
        {activeTab === 'list' && (
          <button onClick={() => { setEditingId(null); setNewTemplate({ title: '', subject: 'Toán học', grade: 'All', content: '' }); setActiveTab('create'); }} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 24px', borderRadius: 12, background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)', boxShadow: '0 4px 6px rgba(79, 70, 229, 0.2)', border: 'none', color: 'white', cursor: 'pointer' }}>
            <Plus size={20}/> Tạo Mẫu mới
          </button>
        )}
      </div>

      {activeTab === 'list' ? (
        <div style={{ background: 'white', borderRadius: 24, padding: 32, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
            <div style={{ position: 'relative', width: 350 }}>
              <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: 14, top: 12 }} />
              <input 
                type="text" 
                placeholder="Tìm kiếm mẫu giáo án..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: '100%', padding: '10px 14px 10px 40px', borderRadius: 10, border: '1px solid #e2e8f0', outline: 'none' }} 
              />
            </div>
            <button style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 10, border: '1px solid #e2e8f0', background: 'white', color: '#475569', cursor: 'pointer', fontWeight: 500 }}>
              <Filter size={18} /> Bộ lọc
            </button>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569' }}>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600 }}>Tên Mẫu Giáo án</th>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600 }}>Môn học</th>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600 }}>Khối lớp</th>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600 }}>Trạng thái</th>
                <th style={{ padding: '16px', textAlign: 'right', fontWeight: 600 }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredTemplates.length === 0 ? (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>Chưa có giáo án mẫu nào.</td></tr>
              ) : (
                filteredTemplates.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #e2e8f0', transition: 'all 0.2s' }}>
                    <td style={{ padding: '16px', fontWeight: 500, color: '#1e293b' }}>{item.title}</td>
                    <td style={{ padding: '16px' }}>
                      <span style={{ padding: '4px 10px', background: '#e0e7ff', color: '#4338ca', borderRadius: 20, fontSize: '0.85rem', fontWeight: 600 }}>{item.subject}</span>
                    </td>
                    <td style={{ padding: '16px', color: '#64748b' }}>{item.grade}</td>
                    <td style={{ padding: '16px' }}>
                      <span style={{ padding: '4px 10px', background: item.status === 'Đã duyệt' ? '#dcfce7' : '#fee2e2', color: item.status === 'Đã duyệt' ? '#166534' : '#ef4444', borderRadius: 20, fontSize: '0.85rem', fontWeight: 600 }}>{item.status || 'Bản nháp'}</span>
                    </td>
                    <td style={{ padding: '16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', alignItems: 'center' }}>
                        {(!item.status || item.status === 'Bản nháp') && (
                          <button onClick={() => handleApprove(item.id, item.status || 'Bản nháp')} style={{ padding: '6px 12px', background: '#4f46e5', border: 'none', borderRadius: 6, cursor: 'pointer', color: 'white', fontSize: '0.8rem', fontWeight: 600 }}>Gửi duyệt</button>
                        )}
                        <button onClick={() => handleEdit(item)} style={{ padding: 6, background: '#f1f5f9', border: 'none', borderRadius: 6, cursor: 'pointer', color: '#475569' }}><Edit size={16}/></button>
                        <button onClick={() => handleDelete(item.id)} style={{ padding: 6, background: '#fee2e2', border: 'none', borderRadius: 6, cursor: 'pointer', color: '#ef4444' }}><Trash2 size={16}/></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ background: 'white', borderRadius: 24, padding: 32, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)', border: '1px solid #e2e8f0' }}>
           <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: 24, color: '#1e293b' }}>{editingId ? 'Chỉnh sửa Giáo án Mẫu' : 'Trình soạn thảo Giáo án Mẫu'}</h3>
           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
             <div>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500, color: '#475569' }}>Tên Mẫu Giáo án</label>
                <input value={newTemplate.title} onChange={e => setNewTemplate({...newTemplate, title: e.target.value})} type="text" placeholder="VD: Khung giáo án Toán 10 KNTT" style={{ width: '100%', padding: '12px 16px', borderRadius: 10, border: '1px solid #e2e8f0', outline: 'none' }} />
             </div>
             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
               <div>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 500, color: '#475569' }}>Môn học</label>
                  <select value={newTemplate.subject} onChange={e => setNewTemplate({...newTemplate, subject: e.target.value})} style={{ width: '100%', padding: '12px 16px', borderRadius: 10, border: '1px solid #e2e8f0', outline: 'none' }}>
                    <option>Toán học</option><option>Vật lý</option><option>Hóa học</option><option>Đa môn</option>
                  </select>
               </div>
               <div>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 500, color: '#475569' }}>Khối lớp</label>
                  <select value={newTemplate.grade} onChange={e => setNewTemplate({...newTemplate, grade: e.target.value})} style={{ width: '100%', padding: '12px 16px', borderRadius: 10, border: '1px solid #e2e8f0', outline: 'none' }}>
                    <option>All</option><option>Lớp 10</option><option>Lớp 11</option><option>Lớp 12</option>
                  </select>
               </div>
             </div>
           </div>

           <div>
             {/* Toolbar Thẻ Biến */}
             <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '12px 12px 0 0', border: '1px solid #e2e8f0', borderBottom: 'none', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569', display: 'flex', alignItems: 'center', gap: 4 }}>
                  Thẻ Biến (Click để chèn):
                </span>
                {variableTags.map(v => (
                  <button 
                    key={v.tag} 
                    onClick={() => insertTag(v.tag)} 
                    title={v.desc}
                    style={{ padding: '6px 12px', background: 'white', border: '1px dashed #cbd5e1', borderRadius: 20, color: '#4f46e5', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseOver={(e) => { e.currentTarget.style.background = '#eef2ff'; e.currentTarget.style.borderColor = '#4f46e5'; }}
                    onMouseOut={(e) => { e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
                  >
                    {v.tag}
                  </button>
                ))}
             </div>

             {/* Editor or Preview */}
             <div>
                <div style={{ display: 'flex', gap: 0, marginBottom: 0 }}>
                  <button onClick={() => setEditorTab('edit')} style={{ flex: 1, padding: '12px', borderRadius: 0, border: '1px solid #e2e8f0', background: editorTab === 'edit' ? '#ffffff' : '#f8fafc', color: editorTab === 'edit' ? '#4f46e5' : '#64748b', fontWeight: 600, cursor: 'pointer', borderBottom: editorTab === 'edit' ? 'none' : '1px solid #e2e8f0' }}>📝 Soạn thảo (HTML/Markdown)</button>
                  <button onClick={() => setEditorTab('preview')} style={{ flex: 1, padding: '12px', borderRadius: 0, border: '1px solid #e2e8f0', borderLeft: 'none', background: editorTab === 'preview' ? '#ffffff' : '#f8fafc', color: editorTab === 'preview' ? '#4f46e5' : '#64748b', fontWeight: 600, cursor: 'pointer', borderBottom: editorTab === 'preview' ? 'none' : '1px solid #e2e8f0' }}>👁️ Xem trước (Preview)</button>
                </div>
                
                {editorTab === 'edit' ? (
                  <textarea value={newTemplate.content} onChange={e => setNewTemplate({...newTemplate, content: e.target.value})} placeholder="Soạn thảo khung giáo án tại đây... Chèn các thẻ biến như {{ten_bai}} để AI tự động điền." style={{ width: '100%', height: 400, padding: '20px', borderRadius: '0 0 12px 12px', border: '1px solid #e2e8f0', borderTop: 'none', outline: 'none', resize: 'vertical', fontFamily: '"Fira Code", monospace', fontSize: '0.95rem', lineHeight: 1.5 }}></textarea>
                ) : (
                  <div style={{ width: '100%', height: 400, padding: '20px', borderRadius: '0 0 12px 12px', border: '1px solid #e2e8f0', borderTop: 'none', background: '#ffffff', overflowY: 'auto' }} dangerouslySetInnerHTML={{ __html: newTemplate.content || '<p style="color:#94a3b8; font-style:italic">Chưa có nội dung...</p>' }}></div>
                )}
             </div>
           </div>

           <div style={{ display: 'flex', gap: 16, marginTop: 32, justifyContent: 'flex-end' }}>
             <button onClick={() => { setActiveTab('list'); setEditingId(null); }} style={{ padding: '12px 24px', borderRadius: 10, border: '1px solid #e2e8f0', background: 'white', color: '#475569', fontWeight: 600, cursor: 'pointer' }}>Hủy bỏ</button>
             <button onClick={handleSave} style={{ padding: '12px 24px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)', color: 'white', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 6px rgba(79, 70, 229, 0.2)' }}>{editingId ? 'Cập nhật Mẫu' : 'Lưu Mẫu Giáo Án'}</button>
           </div>
        </div>
      )}
    </div>
  );
};

export default LessonTemplate;
