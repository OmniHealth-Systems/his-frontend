import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import { fileURLToPath } from 'url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react()
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@/public': fileURLToPath(new URL('./public', import.meta.url)),
      '@/presentation': fileURLToPath(new URL('./src/presentation', import.meta.url)),
      '@/infrastructure': fileURLToPath(new URL('./src/infrastructure', import.meta.url)),
      '@/infraestructure': fileURLToPath(new URL('./src/infrastructure', import.meta.url)),
      '@/assets': fileURLToPath(new URL('./src/assets', import.meta.url)),
    }
  }
})