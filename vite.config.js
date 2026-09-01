import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  // Ruta base para GitHub Pages
  base: '/finanzas-personales/',
})