import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  
  // CRÍTICO: './' asegura que la aplicación cargue sus recursos correctamente
  // tanto en un servidor web como en un ejecutable local (Electron).
  base: './', 
  
  define: {
    // Definimos process.env.API_KEY para que esté disponible en Reports.tsx
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY || ''),
    // Proporcionamos un objeto process.env básico para evitar errores en librerías externas
    'process.env': {} 
  },
  
  server: {
    port: 5173,
    host: true,
    open: true,
  },
  
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    target: 'esnext',
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom', 'lucide-react'],
          charts: ['recharts'],
          ai: ['@google/genai']
        }
      }
    }
  }
});