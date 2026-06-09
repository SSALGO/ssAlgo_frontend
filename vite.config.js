import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

const projectRoot = fileURLToPath(new URL('.', import.meta.url))

// https://vitejs.dev/config/
export default defineConfig({
  root: projectRoot,
  plugins: [react()],
  server: {
    historyApiFallback: true,
  },
  preview: {
    allowedHosts: ['app.ssalgo.com'],
  },
  build: {
    rollupOptions: {
      input: 'index.html',
    },
  },
})
