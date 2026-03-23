import { defineConfig } from 'vite'

export default defineConfig({
  // Isso garante que o site funcione em carminelouis.github.io/Facilit-Audit/
  base: '/Facilit-Audit/', 
  build: {
    // Garante que o arquivo gerado não perca as referências de estilo
    assetsDir: 'assets',
  }
})