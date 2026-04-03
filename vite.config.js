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
        // ✅ تأكد من أن الملفات تنشأ بشكل صحيح
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]'
      }
    },
    // ✅ تأكد من تحويل CSS بشكل صحيح
    cssCodeSplit: true,
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  base: '/',
});