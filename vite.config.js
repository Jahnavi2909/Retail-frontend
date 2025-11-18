import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // All requests starting with /api will be forwarded
      '/api': {
        target: 'http://ec2-13-203-206-179.ap-south-1.compute.amazonaws.com:9090',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '/api') // optional, can keep the same
      }
    }
  }
})