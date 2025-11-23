import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 4172,
    proxy: {
      '/api': {
        target: 'https://api.realworld.show',
        changeOrigin: true,
        secure: true,
      },
    },
  },
})
