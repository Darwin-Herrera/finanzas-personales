import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Para GitHub Pages cambia "/" por "/NOMBRE-DEL-REPOSITORIO/"
  // Ejemplo: base: "/finanzas-personales/"
  base: "/"
})
