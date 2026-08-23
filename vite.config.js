import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/uni-football-hackathon/', // GitHub Pages repository base path
  server: {
    port: 3000,
    host: true
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React runtime — long-lived, rarely changes
          'vendor-react': ['react', 'react-dom'],
          // Icon library — large, separate chunk for better caching
          'vendor-lucide': ['lucide-react'],
          // Socket.IO client — only needed for auction pages
          'vendor-socket': ['socket.io-client'],
        }
      }
    }
  }
})
