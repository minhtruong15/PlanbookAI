import React, { useState, useEffect } from 'react';
import { DollarSign, Search, Calendar, Tag, TrendingUp, Users, AlertCircle, Loader, Filter } from 'lucide-react';

const RevenueTracking = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPackage, setFilterPackage] = useState('All');
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'oldest' | 'priceDesc' | 'priceAsc'

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = sessionStorage.getItem('accessToken');
        const headers = { 'Authorization': `Bearer ${token}` };
        
        const resOrders = await fetch('http://localhost:8000/api/package/subscriptions/all', { headers });
        let ordersData = [];
        if (resOrders.ok) ordersData = await resOrders.json();

        const resUsers = await fetch('http://localhost:8000/api/auth/users', { headers });
        let usersData = [];
        if (resUsers.ok) usersData = await resUsers.json();

        const merged = ordersData.map(order => {
          const u = usersData.find(x => x.id === order.user_id);
          return { ...order, user_name: u ? u.full_name : 'Unknown User', user_email: u ? u.email : 'No email' };
        });

        setOrders(merged);
      } catch (err) {
        console.error('Lỗi khi tải dữ liệu doanh thu', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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

  const totalRevenue = orders.reduce((sum, o) => sum + (o.price || 0), 0);
  const totalActive = orders.filter(o => o.status === 'active').length;

  return (
    <div className="page-container" style={{ padding: '24px 40px', background: '#f8fafc', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <DollarSign size={28} color="#ef4444" />
          </div>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>Quản lý Doanh thu & Đơn hàng</h1>
            <p style={{ color: '#64748b', marginTop: 4, fontSize: '0.95rem' }}>Theo dõi toàn bộ dòng tiền và chi tiết giao dịch mua gói dịch vụ từ giáo viên.</p>
          </div>
        </div>
      </div>

      {/* Cards Statistics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24, marginBottom: 32 }}>
        <div style={{ background: 'white', padding: 24, borderRadius: 20, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 20, borderLeft: '5px solid #10b981' }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TrendingUp size={26} color="#059669" />
          </div>
          <div>
            <div style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 600, marginBottom: 4 }}>Tổng Doanh Thu</div>
            <div style={{ fontSize: '1.7rem', fontWeight: 800, color: '#1e293b' }}>{totalRevenue.toLocaleString('vi-VN')}đ</div>
          </div>
        </div>
        <div style={{ background: 'white', padding: 24, borderRadius: 20, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 20, borderLeft: '5px solid #3b82f6' }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <DollarSign size={26} color="#1d4ed8" />
          </div>
          <div>
            <div style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 600, marginBottom: 4 }}>Tổng Số Đơn Hàng</div>
            <div style={{ fontSize: '1.7rem', fontWeight: 800, color: '#1e293b' }}>{orders.length} đơn</div>
          </div>
        </div>
        <div style={{ background: 'white', padding: 24, borderRadius: 20, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 20, borderLeft: '5px solid #f59e0b' }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={26} color="#b45309" />
          </div>
          <div>
            <div style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 600, marginBottom: 4 }}>Gói Đang Kích Hoạt</div>
            <div style={{ fontSize: '1.7rem', fontWeight: 800, color: '#1e293b' }}>{totalActive} gói</div>
          </div>
        </div>
      </div>
      
      {/* Search & Filters */}
      <div style={{ background: 'white', borderRadius: 24, padding: 24, marginBottom: 28, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          {/* Search Box */}
          <div style={{ position: 'relative', flex: 1, minWidth: 280 }}>
            <Search size={18} color="#64748b" style={{ position: 'absolute', left: 16, top: 13 }} />
            <input 
              type="text" 
              placeholder="Tìm nhanh khách hàng hoặc đơn mua..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '12px 16px 12px 48px', borderRadius: 14, border: '1px solid #cbd5e1', fontSize: '0.95rem', color: '#1e293b', outline: 'none', transition: 'border 0.2s' }}
              onFocus={e => e.target.style.borderColor = '#ef4444'}
              onBlur={e => e.target.style.borderColor = '#cbd5e1'}
            />
          </div>

          {/* Sorter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#475569', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Filter size={15} /> Sắp xếp:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{ padding: '12px 16px', borderRadius: 14, border: '1px solid #cbd5e1', fontSize: '0.95rem', fontWeight: 600, color: '#1e293b', background: '#f8fafc', outline: 'none', cursor: 'pointer' }}
            >
              <option value="newest">Đơn mới nhất trước</option>
              <option value="oldest">Đơn cũ nhất trước</option>
              <option value="priceDesc">Giá trị lớn nhất trước</option>
              <option value="priceAsc">Giá trị nhỏ nhất trước</option>
            </select>
          </div>
        </div>

        {/* Quick Tabs */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', borderTop: '1px solid #f1f5f9', paddingTop: 16 }}>
          {['All', 'Gói cơ bản', 'Gói Vàng', 'Gói Kim Cương'].map(pkg => (
            <button
              key={pkg}
              onClick={() => setFilterPackage(pkg)}
              style={{
                padding: '8px 18px',
                borderRadius: 20,
                border: 'none',
                background: filterPackage === pkg ? '#fef2f2' : '#f8fafc',
                color: filterPackage === pkg ? '#ef4444' : '#475569',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                border: filterPackage === pkg ? '1px solid #fecaca' : '1px solid #e2e8f0'
              }}
            >
              {pkg === 'All' ? 'Tất cả đơn mua' : pkg}
            </button>
          ))}
        </div>
      </div>

      {/* Transaction Table */}
      <div style={{ background: 'white', borderRadius: 28, padding: 32, boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1e293b', margin: '0 0 24px 0' }}>Lịch sử giao dịch doanh thu</h3>
        
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 0' }}>
            <Loader className="animate-spin" size={40} color="#ef4444" />
            <p style={{ marginTop: 12, color: '#64748b', fontWeight: 500 }}>Đang đồng bộ dữ liệu giao dịch...</p>
          </div>
        ) : processedOrders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <AlertCircle size={40} />
            <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>Không tìm thấy giao dịch nào tương ứng</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                  <th style={{ padding: '16px 20px', color: '#475569', fontWeight: 700, fontSize: '0.9rem' }}>Mã Đơn</th>
                  <th style={{ padding: '16px 20px', color: '#475569', fontWeight: 700, fontSize: '0.9rem' }}>Khách hàng</th>
                  <th style={{ padding: '16px 20px', color: '#475569', fontWeight: 700, fontSize: '0.9rem' }}>Gói dịch vụ</th>
                  <th style={{ padding: '16px 20px', color: '#475569', fontWeight: 700, fontSize: '0.9rem' }}>Số tiền</th>
                  <th style={{ padding: '16px 20px', color: '#475569', fontWeight: 700, fontSize: '0.9rem' }}>Ngày mua</th>
                </tr>
              </thead>
              <tbody>
                {processedOrders.map(order => (
                  <tr key={order.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }}>
                    <td style={{ padding: '20px', fontWeight: 700, color: '#64748b' }}>#{order.id}</td>
                    <td style={{ padding: '20px' }}>
                      <div style={{ fontWeight: 700, color: '#1e293b' }}>{order.user_name}</div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 2 }}>{order.user_email}</div>
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
                        {new Date(order.created_at).toLocaleDateString('vi-VN')}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default RevenueTracking;
