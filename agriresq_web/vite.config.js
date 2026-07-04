import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    port: 5173,
    proxy: {
      // 1. ESP32-CAM Proxy (Change this IP to your ESP32's current IP)
      '/api/camera': {
        target: 'http://192.168.254.115', // <-- CRITICAL: Update this if your ESP32 IP changed in the Serial Monitor!
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