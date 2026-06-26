import React, { useState } from 'react';
import { Terminal, Save, Play, RefreshCw, Settings, Code } from 'lucide-react';

const PromptManager = () => {
  const [activePrompt, setActivePrompt] = useState('exam_generation');

  const [prompts, setPrompts] = useState({
    exam_generation: {
      name: 'Sinh Đề thi Thông minh',
      description: 'Prompt sử dụng để tạo câu hỏi trắc nghiệm dựa trên ma trận kiến thức.',
      system_instruction: 'Bạn là một chuyên gia giáo dục xuất sắc của Bộ GD&ĐT Việt Nam. Nhiệm vụ của bạn là sinh ra các câu hỏi trắc nghiệm khách quan 4 lựa chọn, đảm bảo tính chính xác về mặt khoa học và phân loại đúng độ khó.',
      temperature: 0.7,
      max_tokens: 2048,
      model: 'gpt-4-turbo'
    },
    lesson_planning: {
      name: 'Khung Giáo án Tự động',
      description: 'Prompt sử dụng để xây dựng dàn ý giáo án theo chuẩn Công văn 5512.',
      system_instruction: 'Bạn là một giáo viên có kinh nghiệm 20 năm. Hãy tạo ra một khung giáo án chi tiết bao gồm: Mục tiêu, Chuẩn bị, Hoạt động học, và Đánh giá dựa trên từ khóa bài học được cung cấp.',
      temperature: 0.5,
      max_tokens: 4000,
      model: 'gpt-3.5-turbo'
    }
  });

  const currentConfig = prompts[activePrompt];

  const handleConfigChange = (key, value) => {
    setPrompts(prev => ({
      ...prev,
      [activePrompt]: {
        ...prev[activePrompt],
        [key]: value
      }
    }));
  };

  return (
    <div className="page-container" style={{ background: '#f8fafc', minHeight: '100vh', padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, background: 'linear-gradient(135deg, #312e81 0%, #4f46e5 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'flex', alignItems: 'center', gap: 12 }}>
            <Terminal size={32} color="#4f46e5" /> Quản lý AI Prompts
          </h1>
          <p style={{ color: '#64748b', fontSize: '1rem', marginTop: 8 }}>Tinh chỉnh bộ não AI, thiết lập các lệnh hệ thống để tối ưu hóa chất lượng đầu ra.</p>
        </div>
        <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 24px', borderRadius: 12, background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)', boxShadow: '0 4px 6px rgba(79, 70, 229, 0.2)', border: 'none', color: 'white', cursor: 'pointer' }}>
          <Save size={20}/> Lưu cấu hình
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: 24 }}>
        {/* Sidebar */}
        <div style={{ background: 'white', borderRadius: 20, padding: 20, border: '1px solid #e2e8f0', height: 'fit-content' }}>
           <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><Code size={18}/> Danh sách Prompts</h3>
           <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {Object.entries(prompts).map(([key, p]) => (
                <button 
                  key={key} 
                  onClick={() => setActivePrompt(key)}
                  style={{ textAlign: 'left', padding: '12px 16px', borderRadius: 12, border: 'none', background: activePrompt === key ? '#eef2ff' : 'transparent', color: activePrompt === key ? '#4338ca' : '#475569', fontWeight: activePrompt === key ? 700 : 500, cursor: 'pointer', transition: 'all 0.2s' }}
                >
                  {p.name}
                </button>
              ))}
           </div>
        </div>

        {/* Main Editor */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Header Info */}
          <div style={{ background: 'white', borderRadius: 20, padding: 24, border: '1px solid #e2e8f0' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#1e293b', marginBottom: 8 }}>{currentConfig.name}</h2>
            <p style={{ color: '#64748b', fontSize: '0.95rem' }}>{currentConfig.description}</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
             {/* System Instruction Editor */}
             <div style={{ background: '#1e293b', borderRadius: 20, overflow: 'hidden', border: '1px solid #334155', display: 'flex', flexDirection: 'column' }}>
                <div style={{ background: '#0f172a', padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #334155' }}>
                  <span style={{ color: '#e2e8f0', fontSize: '0.9rem', fontWeight: 600, fontFamily: 'monospace' }}>System Instruction</span>
                  <button style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><RefreshCw size={16}/></button>
                </div>
                <textarea 
                  value={currentConfig.system_instruction}
                  onChange={(e) => handleConfigChange('system_instruction', e.target.value)}
                  style={{ width: '100%', height: 300, background: 'transparent', border: 'none', color: '#38bdf8', padding: '20px', fontSize: '1rem', fontFamily: '"Fira Code", monospace', outline: 'none', resize: 'vertical', lineHeight: 1.6 }}
                />
             </div>

             {/* Parameters Config */}
             <div style={{ background: 'white', borderRadius: 20, padding: 24, border: '1px solid #e2e8f0' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}><Settings size={18}/> Model Parameters</h3>
                
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '0.9rem', fontWeight: 600, color: '#475569' }}>
                    <span>Model</span>
                  </label>
                  <select value={currentConfig.model} onChange={(e) => handleConfigChange('model', e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #e2e8f0', outline: 'none', background: '#f8fafc' }}>
                    <option value="gpt-4-turbo">gpt-4-turbo</option>
                    <option value="gpt-4o">gpt-4o</option>
                    <option value="gpt-3.5-turbo">gpt-3.5-turbo</option>
                  </select>
                </div>

                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '0.9rem', fontWeight: 600, color: '#475569' }}>
                    <span>Temperature</span>
                    <span style={{ color: '#4f46e5' }}>{currentConfig.temperature}</span>
                  </label>
                  <input type="range" min="0" max="2" step="0.1" value={currentConfig.temperature} onChange={(e) => handleConfigChange('temperature', parseFloat(e.target.value))} style={{ width: '100%', accentColor: '#4f46e5' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: '0.75rem', color: '#94a3b8' }}>
                    <span>Chính xác</span>
                    <span>Sáng tạo</span>
                  </div>
                </div>

                <div style={{ marginBottom: 30 }}>
                  <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '0.9rem', fontWeight: 600, color: '#475569' }}>
                    <span>Max Tokens</span>
                    <span style={{ color: '#4f46e5' }}>{currentConfig.max_tokens}</span>
                  </label>
                  <input type="range" min="256" max="8000" step="256" value={currentConfig.max_tokens} onChange={(e) => handleConfigChange('max_tokens', parseInt(e.target.value))} style={{ width: '100%', accentColor: '#4f46e5' }} />
                </div>

                <button style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px', borderRadius: 10, border: '1px solid #e2e8f0', background: '#f8fafc', color: '#475569', fontWeight: 600, cursor: 'pointer' }}>
                  <Play size={18} color="#10b981" /> Chạy thử Prompt
                </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromptManager;
