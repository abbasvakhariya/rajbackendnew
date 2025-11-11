import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Increase chunk size warning limit (optional - can remove if you want stricter warnings)
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        // Manual chunk splitting for better performance
        manualChunks: {
          // Separate vendor chunks
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // PDF library is large, separate it
          'pdf-vendor': ['jspdf', 'jspdf-autotable'],
          // Icons library
          'icons-vendor': ['lucide-react']
        }
      }
    }
  }
})
