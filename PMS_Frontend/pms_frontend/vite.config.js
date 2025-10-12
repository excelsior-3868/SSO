import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(),react()],
  server: {
    '/api': {
        target: 'http://web:8000',   // 'web' = service name of Django in docker-compose
        changeOrigin: true,
      },
    port: 5175,   // 👈 fixed port
    strictPort: true, // 👈 ensures Vite fails if port is taken (optional)
  },
})
