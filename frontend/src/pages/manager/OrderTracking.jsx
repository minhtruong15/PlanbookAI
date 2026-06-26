import React, { useState, useEffect } from 'react';
import { ShoppingCart, Search, Calendar, CheckCircle2, Tag, Edit, AlertCircle, Loader, X, Save } from 'lucide-react';

const OrderTracking = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPackage, setFilterPackage] = useState('All');
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'oldest' | 'priceDesc' | 'priceAsc'
  const [editingOrder, setEditingOrder] = useState(null); // Giao dịch đang chỉnh sửa
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState('');
  const [modalSuccess, setModalSuccess] = useState('');

  const fetchData = async () => {
    try {
      const token = sessionStorage.getItem('accessToken');
      const headers = { 'Authorization': `Bearer ${token}` };
      
      // 1. Fetch Orders
      const resOrders = await fetch('http://localhost:8000/api/package/subscriptions/all', { headers });
      let ordersData = [];
      if (resOrders.ok) {
        ordersData = await resOrders.json();
      }

      // 2. Fetch Users
      const resUsers = await fetch('http://localhost:8000/api/auth/users', { headers });
      let usersData = [];
      if (resUsers.ok) {
        usersData = await resUsers.json();
      }

      // 3. Merge data
      const merged = ordersData.map(order => {
        const u = usersData.find(x => x.id === order.user_id);
        return {
          ...order,
          user_name: u ? u.full_name : 'Unknown User',
          user_email: u ? u.email : 'No email'
        };
      });

      setOrders(merged);
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu đơn hàng', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEditClick = (order) => {
    // Chuyển ngày thành định dạng YYYY-MM-DD cho input date
    const formattedDate = new Date(order.end_date).toISOString().split('T')[0];
    setEditingOrder({
      ...order,
      edit_end_date: formattedDate,
      edit_status: order.status
    });
    setModalError('');
    setModalSuccess('');
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setModalError('');
    setModalSuccess('');

    try {
      const token = sessionStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:8000/api/package/subscriptions/${editingOrder.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: editingOrder.edit_status,
          end_date: editingOrder.edit_end_date
        })
      });

      const resData = await response.json();
      if (!response.ok) throw new Error(resData.detail || 'Không thể cập nhật đơn hàng');

      setModalSuccess('Đã cập nhật đơn hàng thành công!');
      setTimeout(() => {
        setEditingOrder(null);
        fetchData();
      }, 1000);
    } catch (err) {
      setModalError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Lọc theo tìm kiếm
  let processedOrders = orders.filter(o => 
    o.user_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    o.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.package_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Lọc theo gói
  if (filterPackage !== 'All') {
    processedOrders = processedOrders.filter(o => o.package_name === filterPackage);
  }

  // Sắp xếp
  processedOrders.sort((a, b) => {
    if (sortBy === 'newest') return b.id - a.id;
    if (sortBy === 'oldest') return a.id - b.id;
    if (sortBy === 'priceDesc') return b.price - a.price;
    if (sortBy === 'priceAsc') return a.price - b.price;
    return 0;
  });

  return (
    <div className="page-container" style={{ padding: '24px 40px', background: '#f8fafc', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShoppingCart size={28} color="#2563eb" />
          </div>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>Quản lý Đơn hàng & Đăng ký</h1>
            <p style={{ color: '#64748b', marginTop: 4, fontSize: '0.95rem' }}>Xem, tìm kiếm khách hàng, và điều chỉnh thời hạn kích hoạt gói dịch vụ của giáo viên.</p>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar Area */}
      <div style={{ background: 'white', borderRadius: 24, padding: 24, marginBottom: 28, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          {/* Search Box */}
          <div style={{ position: 'relative', flex: 1, minWidth: 280 }}>
            <Search size={18} color="#64748b" style={{ position: 'absolute', left: 16, top: 13 }} />
            <input 
              type="text" 
              placeholder="Tìm khách hàng theo tên, email hoặc gói dịch vụ..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '12px 16px 12px 48px', borderRadius: 14, border: '1px solid #cbd5e1', fontSize: '0.95rem', color: '#1e293b', outline: 'none', transition: 'border 0.2s' }}
              onFocus={e => e.target.style.borderColor = '#2563eb'}
              onBlur={e => e.target.style.borderColor = '#cbd5e1'}
            />
          </div>

          {/* Sorter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#475569' }}>Sắp xếp:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{ padding: '12px 16px', borderRadius: 14, border: '1px solid #cbd5e1', fontSize: '0.95rem', fontWeight: 600, color: '#1e293b', background: '#f8fafc', outline: 'none', cursor: 'pointer' }}
            >
              <option value="newest">Mới nhất trước</option>
              <option value="oldest">Cũ nhất trước</option>
              <option value="priceDesc">Giá cao nhất trước</option>
              <option value="priceAsc">Giá thấp nhất trước</option>
            </select>
          </div>
        </div>

        {/* Categories Quick Filters */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', borderTop: '1px solid #f1f5f9', paddingTop: 16 }}>
          {['All', 'Gói cơ bản', 'Gói Vàng', 'Gói Kim Cương'].map(pkg => (
            <button
              key={pkg}
              onClick={() => setFilterPackage(pkg)}
              style={{
                padding: '8px 18px',
                borderRadius: 20,
                border: 'none',
                background: filterPackage === pkg ? '#eff6ff' : '#f8fafc',
                color: filterPackage === pkg ? '#2563eb' : '#475569',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                border: filterPackage === pkg ? '1px solid #bfdbfe' : '1px solid #e2e8f0'
              }}
            >
              {pkg === 'All' ? 'Tất cả gói' : pkg}
            </button>
          ))}
        </div>
      </div>
      
      {/* Table Data Panel */}
      <div style={{ background: 'white', borderRadius: 28, padding: 32, boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 0' }}>
            <Loader className="animate-spin" size={40} color="#2563eb" />
            <p style={{ marginTop: 12, color: '#64748b', fontWeight: 500 }}>Đang tải danh sách đơn hàng...</p>
          </div>
        ) : processedOrders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <AlertCircle size={40} />
            <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>Không tìm thấy đơn hàng nào tương ứng</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                  <th style={{ padding: '16px 20px', color: '#475569', fontWeight: 700, fontSize: '0.9rem' }}>Mã Đơn</th>
                  <th style={{ padding: '16px 20px', color: '#475569', fontWeight: 700, fontSize: '0.9rem' }}>Khách hàng</th>
                  <th style={{ padding: '16px 20px', color: '#475569', fontWeight: 700, fontSize: '0.9rem' }}>Gói dịch vụ</th>
                  <th style={{ padding: '16px 20px', color: '#475569', fontWeight: 700, fontSize: '0.9rem' }}>Thanh toán</th>
                  <th style={{ padding: '16px 20px', color: '#475569', fontWeight: 700, fontSize: '0.9rem' }}>Hạn hết hạn</th>
                  <th style={{ padding: '16px 20px', color: '#475569', fontWeight: 700, fontSize: '0.9rem' }}>Trạng thái</th>
                  <th style={{ padding: '16px 20px', color: '#475569', fontWeight: 700, fontSize: '0.9rem', textAlign: 'right' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {processedOrders.map(order => (
                  <tr key={order.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }}>
                    <td style={{ padding: '20px', fontWeight: 700, color: '#64748b' }}>#{order.id}</td>
                    <td style={{ padding: '20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1rem', border: '1px solid #bfdbfe' }}>
                          {order.user_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: '#1e293b' }}>{order.user_name}</div>
                          <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 2 }}>{order.user_email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, color: '#1e293b' }}>
                        <Tag size={16} color={order.package_name.toLowerCase().includes('vàng') ? '#f59e0b' : order.package_name.toLowerCase().includes('kim cương') ? '#8b5cf6' : '#3b82f6'} />
                        {order.package_name}
                      </div>
                    </td>
                    <td style={{ padding: '20px', fontWeight: 800, color: '#10b981' }}>
                      {order.price.toLocaleString('vi-VN')}đ
                    </td>
                    <td style={{ padding: '20px', color: '#475569', fontWeight: 600 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Calendar size={15} color="#64748b" />
                        {new Date(order.end_date).toLocaleDateString('vi-VN')}
                      </div>
                    </td>
                    <td style={{ padding: '20px' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        background: order.status === 'active' ? '#ecfdf5' : '#fef2f2',
                        color: order.status === 'active' ? '#047857' : '#b91c1c',
                        padding: '6px 14px',
                        borderRadius: 20,
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        border: order.status === 'active' ? '1px solid #a7f3d0' : '1px solid #fecaca'
                      }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }}></div>
                        {order.status === 'active' ? 'Đã kích hoạt' : 'Hết hạn'}
                      </span>
                    </td>
                    <td style={{ padding: '20px', textAlign: 'right' }}>
                      <button
                        onClick={() => handleEditClick(order)}
                        style={{
                          background: '#f1f5f9',
                          border: 'none',
                          padding: '10px 16px',
                          borderRadius: 10,
                          cursor: 'pointer',
                          color: '#475569',
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          transition: 'all 0.2s'
                        }}
                        onMouseOver={e => { e.currentTarget.style.background = '#e2e8f0'; e.currentTarget.style.color = '#0f172a'; }}
                        onMouseOut={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#475569'; }}
                      >
                        <Edit size={14} /> Điều chỉnh
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Order Modal */}
      {editingOrder && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: 28, width: '100%', maxWidth: 500, padding: 36, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <ShoppingCart size={22} color="#2563eb" /> Điều chỉnh đơn hàng #{editingOrder.id}
              </h2>
              <button
                onClick={() => setEditingOrder(null)}
                style={{ background: '#f1f5f9', border: 'none', width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Status Info */}
            <div style={{ background: '#f8fafc', padding: 18, borderRadius: 16, border: '1px solid #f1f5f9' }}>
              <div style={{ fontWeight: 700, color: '#1e293b' }}>{editingOrder.user_name}</div>
              <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: 4 }}>{editingOrder.user_email}</div>
              <div style={{ fontSize: '0.85rem', color: '#475569', marginTop: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                <strong>Gói dịch vụ:</strong> 
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 700 }}>
                  <Tag size={13} color="#2563eb" /> {editingOrder.package_name}
                </span>
              </div>
            </div>

            {modalError && <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '12px 16px', borderRadius: 12, fontSize: '0.9rem', fontWeight: 600 }}>{modalError}</div>}
            {modalSuccess && <div style={{ background: '#ecfdf5', color: '#047857', padding: '12px 16px', borderRadius: 12, fontSize: '0.9rem', fontWeight: 600 }}>{modalSuccess}</div>}

            {/* Modal Form */}
            <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Expiration Date Input */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label style={{ fontWeight: 700, color: '#334155', fontSize: '0.9rem' }}>Hạn sử dụng mới</label>
                <input
                  type="date"
                  value={editingOrder.edit_end_date}
                  onChange={e => setEditingOrder({ ...editingOrder, edit_end_date: e.target.value })}
                  required
                  style={{ padding: '12px 16px', borderRadius: 12, border: '1px solid #cbd5e1', fontSize: '0.95rem', outline: 'none' }}
                />
              </div>

              {/* Status Select */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label style={{ fontWeight: 700, color: '#334155', fontSize: '0.9rem' }}>Trạng thái kích hoạt</label>
                <select
                  value={editingOrder.edit_status}
                  onChange={e => setEditingOrder({ ...editingOrder, edit_status: e.target.value })}
                  style={{ padding: '12px 16px', borderRadius: 12, border: '1px solid #cbd5e1', fontSize: '0.95rem', fontWeight: 600, color: '#1e293b', background: '#f8fafc', outline: 'none', cursor: 'pointer' }}
                >
                  <option value="active">Đang hoạt động (Active)</option>
                  <option value="expired">Hết hạn (Expired)</option>
                </select>
              </div>

              {/* Actions Buttons */}
              <div style={{ display: 'flex', gap: 14, justifyContent: 'flex-end', marginTop: 12 }}>
                <button
                  type="button"
                  onClick={() => setEditingOrder(null)}
                  style={{ padding: '12px 24px', borderRadius: 12, border: '1px solid #cbd5e1', background: 'white', color: '#475569', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer' }}
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    padding: '12px 24px',
                    borderRadius: 12,
                    border: 'none',
                    background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    opacity: saving ? 0.7 : 1
                  }}
                >
                  {saving ? <Loader className="animate-spin" size={16} /> : <Save size={16} />}
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderTracking;
