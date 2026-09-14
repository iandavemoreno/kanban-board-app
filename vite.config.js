import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:3003',
      '/socket.io': {
        target: 'http://localhost:3003',
        ws: true,
      },
    },
  },
})