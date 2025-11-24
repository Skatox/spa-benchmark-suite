import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

export default defineConfig({
  plugins: [svelte()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: 'src/setupTests.js'
  },
  server: {
    port: 4174,
    host: true,
    proxy: {
      '/api': {
        target: 'https://api.realworld.show',
        changeOrigin: true,
        secure: true
      }
    }
  }
})
