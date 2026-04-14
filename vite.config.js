// vite.config.js

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        // ✅ تحسين تجزئة الملفات لتقليل حجم الحزمة
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'mui-vendor': ['@mui/material', '@mui/icons-material', '@emotion/react', '@emotion/styled'],
          'chart-vendor': ['recharts'],
          'map-vendor': ['mapbox-gl'],
          'form-vendor': ['formik', 'yup'],
          'query-vendor': ['react-query'],
        },
        // ✅ تأكد من أن الملفات تنشأ بشكل صحيح
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]'
      }
    },
    // ✅ تأكد من تحويل CSS بشكل صحيح
    cssCodeSplit: true,
    // ✅ تحسين حجم الملفات
    target: 'es2020',
    chunkSizeWarningLimit: 1000,
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  base: '/',
  // ✅ تحسين الأداء
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', '@mui/material', '@mui/icons-material'],
  },
});