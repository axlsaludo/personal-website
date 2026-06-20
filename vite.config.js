import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      '/api/badges': {
        target: 'https://www.credly.com',
        changeOrigin: true,
        rewrite: () => '/users/kurt-axl-saludo/badges.json'
      }
    }
  }
})
