import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@services': path.resolve(__dirname, './src/services'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@assets': path.resolve(__dirname, './src/assets'),
      '@hooks': path.resolve(__dirname, './src/hooks')
    }
  },
  build: {
    // Optimisation du code splitting
    rollupOptions: {
      output: {
        manualChunks: {
          // Séparer les vendors des dépendances principales
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'mui-vendor': ['@mui/material', '@mui/icons-material', '@emotion/react', '@emotion/styled'],
          'redux-vendor': ['@reduxjs/toolkit', 'react-redux'],
          'date-vendor': ['date-fns', 'moment', '@mui/x-date-pickers'],
          'pdf-vendor': ['@react-pdf/renderer', 'pdfmake'],
          'stripe-vendor': ['@stripe/stripe-js', '@stripe/react-stripe-js'],
        },
      },
    },
    // Augmenter la limite d'avertissement pour les chunks
    chunkSizeWarningLimit: 1000,
    // Minification optimale
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Supprimer les console.log en production
        drop_debugger: true,
      },
    },
    // Source maps pour le debug en production (optionnel)
    sourcemap: false,
  },
  // Optimisation des dépendances
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@mui/material',
      '@emotion/react',
      '@emotion/styled',
    ],
  },
})