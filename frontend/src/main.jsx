import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Ghi đè fetch để hỗ trợ đa mạng (LAN/Ngrok/Localtunnel)
// Chỉ thay đổi sang đường dẫn tương đối (/api) nếu người dùng đang không dùng localhost
// Giúp tránh lỗi Vite Proxy chưa được khởi động lại trên máy local của user.
const originalFetch = window.fetch;
window.fetch = async (...args) => {
  if (typeof args[0] === 'string' && args[0].startsWith('http://localhost:8000')) {
    if (window.location.hostname !== 'localhost') {
      args[0] = args[0].replace('http://localhost:8000', '');
    }
  }
  return originalFetch(...args);
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
