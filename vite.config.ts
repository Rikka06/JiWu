import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // 关键配置：设置为相对路径 './'，这样应用可以部署在 GitHub Pages 的任何子路径下
  // 如果你知道仓库名，也可以设置为 '/仓库名/'
  base: './',
})