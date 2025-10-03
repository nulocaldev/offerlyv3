import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@domains': path.resolve(__dirname, './src/domains'),
      '@shared': path.resolve(__dirname, './src/shared-kernel'),
      '@services': path.resolve(__dirname, './src/application-services'),
      '@interfaces': path.resolve(__dirname, './src/interfaces'),
      '@infrastructure': path.resolve(__dirname, './src/infrastructure')
    }
  },
  server: {
    port: 3000
  }
})
