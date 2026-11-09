import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    reportCompressedSize: false,
    chunkSizeWarningLimit: 1200,
    modulePreload: {
      resolveDependencies(filename, deps) {
        return deps.filter((dep) => !dep.includes('parsers') && !dep.includes('resume-templates') && !dep.includes('Editor'));
      },
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('pdfjs-dist') || id.includes('tesseract.js') || id.includes('mammoth')) {
              return 'parsers';
            }
            if (id.includes('groq-sdk') || id.includes('openai') || id.includes('@google/generative-ai') || id.includes('@langchain')) {
              return 'ai-sdks';
            }
            if (id.includes('@clerk')) {
              return 'clerk';
            }
            if (id.includes('lucide-react') || id.includes('react-icons')) {
              return 'icons';
            }
            if (id.includes('framer-motion')) {
              return 'framer-motion';
            }
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'vendor-react';
            }
            return 'vendor';
          }
          if (/[\\/]src[\\/]components[\\/]templates[\\/]/.test(id) || /[\\/]src[\\/]components[\\/]resume[\\/]/.test(id)) {
            return 'resume-templates';
          }
        },
      },
    },
  },
})
