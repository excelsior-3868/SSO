import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(),react()],
  server: {
    port: 5174,   // 👈 fixed port
    strictPort: true, // 👈 ensures Vite fails if port is taken (optional)
  },
})
