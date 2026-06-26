import React, { useState, useEffect } from 'react';
import { Package, Plus, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';

const PackageManagement = () => {
  const [packages, setPackages] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newPackage, setNewPackage] = useState({
    name: '',
    description: '',
    price: 0,
    duration_days: 30,
    features: '',
    is_active: true
  });

  const fetchData = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/package/packages', {
        headers: { 'Authorization': `Bearer ${sessionStorage.getItem('accessToken')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPackages(data);
      }
    } catch (e) {
      console.log('Error fetching packages', e);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async () => {
    if (!newPackage.name || newPackage.price < 0 || newPackage.duration_days <= 0) {
      return alert('Vui lòng nhập đầy đủ thông tin hợp lệ!');
    }

    try {
      const url = editingId ? `http://localhost:8000/api/package/packages/${editingId}` : 'http://localhost:8000/api/package/packages';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method: method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(newPackage)
      });

      if (res.ok) {
        setShowForm(false);
        setEditingId(null);
        setNewPackage({ name: '', description: '', price: 0, duration_days: 30, features: '', is_active: true });
        fetchData();
      } else {
        const errText = await res.text();
        alert('Lỗi: ' + errText);
      }
    } catch (e) {
      alert('Lỗi kết nối: ' + e.message);
    }
  };

  const handleEdit = (pkg) => {
    setNewPackage({
      name: pkg.name,
      description: pkg.description || '',
      price: pkg.price,
      duration_days: pkg.duration_days,
      features: pkg.features || '',
      is_active: pkg.is_active
    });
    setEditingId(pkg.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Vô hiệu hóa gói này? Các tài khoản đang dùng vẫn sẽ được duy trì hạn.')) return;
    try {
      const res = await fetch(`http://localhost:8000/api/package/packages/${id}`, { 
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${sessionStorage.getItem('accessToken')}` }
      });
      if (res.ok) fetchData();
    } catch (e) {}
  };

  return (
    <div className="page-container" style={{ background: '#f8fafc', minHeight: '100vh', padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, background: 'linear-gradient(135deg, #047857 0%, #10b981 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'flex', alignItems: 'center', gap: 12 }}>
            <Package size={32} color="#059669" /> Quản lý Gói dịch vụ
          </h1>
          <p style={{ color: '#64748b', fontSize: '1rem', marginTop: 8 }}>Thiết lập và quản lý các gói thuê bao bán cho Giáo viên.</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditingId(null); setNewPackage({ name: '', description: '', price: 0, duration_days: 30, features: '', is_active: true }); }} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 24px', borderRadius: 12, background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)', boxShadow: '0 4px 6px rgba(16, 185, 129, 0.2)', border: 'none', color: 'white', cursor: 'pointer', fontWeight: 600 }}>
          <Plus size={20}/> Tạo Gói Mới
        </button>
      </div>

      {showForm && (
        <div style={{ background: 'white', padding: 24, borderRadius: 16, marginBottom: 24, border: '1px solid #e2e8f0', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
          <h3 style={{ marginBottom: 16, fontSize: '1.2rem', fontWeight: 700 }}>{editingId ? 'Chỉnh sửa Gói' : 'Thêm Gói mới'}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
             <div>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Tên Gói</label>
                <input value={newPackage.name} onChange={e => setNewPackage({...newPackage, name: e.target.value})} placeholder="VD: Gói Cơ Bản" style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #e2e8f0' }} />
             </div>
             <div>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Giá (VNĐ)</label>
                <input type="number" value={newPackage.price} onChange={e => setNewPackage({...newPackage, price: parseFloat(e.target.value)})} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #e2e8f0' }} />
             </div>
             <div>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Thời hạn (Ngày)</label>
                <input type="number" value={newPackage.duration_days} onChange={e => setNewPackage({...newPackage, duration_days: parseInt(e.target.value)})} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #e2e8f0' }} />
             </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
             <div>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Mô tả ngắn</label>
                <textarea value={newPackage.description} onChange={e => setNewPackage({...newPackage, description: e.target.value})} placeholder="Mô tả gói dịch vụ..." style={{ width: '100%', height: 80, padding: 12, borderRadius: 8, border: '1px solid #e2e8f0', resize: 'vertical' }}></textarea>
             </div>
             <div>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Các tính năng (Ngăn cách bằng dấu chấm phẩy ;)</label>
                <textarea value={newPackage.features} onChange={e => setNewPackage({...newPackage, features: e.target.value})} placeholder="VD: Trợ lý AI Pro; Không giới hạn mẫu; Hỗ trợ 24/7" style={{ width: '100%', height: 80, padding: 12, borderRadius: 8, border: '1px solid #e2e8f0', resize: 'vertical' }}></textarea>
             </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
             <button onClick={() => { setShowForm(false); setEditingId(null); }} style={{ padding: '10px 20px', borderRadius: 8, background: '#f1f5f9', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Hủy</button>
             <button onClick={handleSave} style={{ padding: '10px 20px', borderRadius: 8, background: '#059669', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 600 }}>{editingId ? 'Cập nhật Gói' : 'Lưu Gói'}</button>
          </div>
        </div>
      )}

      <div style={{ background: 'white', borderRadius: 24, padding: 32, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)', border: '1px solid #e2e8f0' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569' }}>
              <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600 }}>Tên Gói</th>
              <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600 }}>Giá Tiền</th>
              <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600 }}>Thời Hạn</th>
              <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600 }}>Trạng thái</th>
              <th style={{ padding: '16px', textAlign: 'right', fontWeight: 600 }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {packages.length === 0 ? (
              <tr><td colSpan="5" style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>Chưa có gói dịch vụ nào.</td></tr>
            ) : (
              packages.map((pkg) => (
                <tr key={pkg.id} style={{ borderBottom: '1px solid #e2e8f0', transition: 'all 0.2s' }}>
                  <td style={{ padding: '16px', fontWeight: 700 }}>
                    {pkg.name.toLowerCase().includes('kim cương') ? (
                      <span style={{ background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)', color: 'white', padding: '6px 12px', borderRadius: '20px', display: 'inline-flex', alignItems: 'center', gap: 6, boxShadow: '0 4px 10px rgba(236, 72, 153, 0.3)' }}>
                        💎 {pkg.name}
                      </span>
                    ) : pkg.name.toLowerCase().includes('vàng') ? (
                      <span style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)', color: 'white', padding: '6px 12px', borderRadius: '20px', display: 'inline-flex', alignItems: 'center', gap: 6, boxShadow: '0 4px 10px rgba(245, 158, 11, 0.3)' }}>
                        👑 {pkg.name}
                      </span>
                    ) : pkg.name.toLowerCase().includes('cơ bản') ? (
                      <span style={{ background: '#f1f5f9', color: '#475569', padding: '6px 12px', borderRadius: '20px', display: 'inline-flex', alignItems: 'center', gap: 6, border: '1px solid #cbd5e1' }}>
                        🔹 {pkg.name}
                      </span>
                    ) : (
                      <span style={{ color: '#1e293b' }}>{pkg.name}</span>
                    )}
                  </td>
                  <td style={{ padding: '16px', color: '#059669', fontWeight: 600 }}>{pkg.price.toLocaleString('vi-VN')} VNĐ</td>
                  <td style={{ padding: '16px', color: '#64748b' }}>{pkg.duration_days} ngày</td>
                  <td style={{ padding: '16px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', background: pkg.is_active ? '#dcfce7' : '#f1f5f9', color: pkg.is_active ? '#166534' : '#64748b', borderRadius: 20, fontSize: '0.85rem', fontWeight: 600 }}>
                      {pkg.is_active ? <><CheckCircle size={14}/> Đang bán</> : <><XCircle size={14}/> Đã ẩn</>}
                    </span>
                  </td>
                  <td style={{ padding: '16px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                      <button onClick={() => handleEdit(pkg)} style={{ padding: 8, background: '#f1f5f9', border: 'none', borderRadius: 8, cursor: 'pointer', color: '#059669' }}><Edit size={16}/></button>
                      {pkg.is_active && (
                        <button onClick={() => handleDelete(pkg.id)} style={{ padding: 8, background: '#fee2e2', border: 'none', borderRadius: 8, cursor: 'pointer', color: '#ef4444' }}><Trash2 size={16}/></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PackageManagement;
