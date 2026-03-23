import { defineConfig } from 'vite'

// Configuração vital para que o GitHub Pages encontre o CSS e JS na subpasta /Facilit-Audit/
export default defineConfig({
  base: '/Facilit-Audit/', 
  build: {
    outDir: 'dist',
  }
})