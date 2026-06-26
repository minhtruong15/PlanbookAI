import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Listen on all interfaces
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://api-gateway:8000',
        changeOrigin: true,
      }
    }
  }
})
// Trigger Vite Dev Server Restart (Hotfix 8)
