import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import laravel from 'laravel-vite-plugin'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    laravel({
      input: ['resources/js/app.js'],
      refresh: true,
    }),
    vue()
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'resources/js'),
    },
  },
  server: {
    host: 'localhost',
    port: 3001,
    hmr: {
      host: 'localhost',
    },
  },
  build: {
    chunkSizeWarningLimit: 8000,
    rollupOptions: {
      output: {
        manualChunks: {
          pdfme: ['@pdfme/ui', '@pdfme/generator', '@pdfme/common', '@pdfme/schemas'],
          vendor: ['vue', 'vue-router', 'pinia', 'axios'],
        },
      },
    },
  },
}) 