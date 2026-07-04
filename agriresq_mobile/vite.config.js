import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // 1. ESP32-CAM Proxy (More specific path first)
      '/api/camera': {
        target: 'http://192.168.100.214',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/camera/, ''),
      },
      // 2. Django Backend Proxy
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
})