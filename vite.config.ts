import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: "/ddTools/",
  define: {
    // 注入构建时间变量（格式：YYYY-MM-DD HH:mm:ss）
    'import.meta.env.BUILD_TIME': JSON.stringify(
      new Date().toLocaleString('zh-CN', {
        hour12: false,
        timeZone: 'Asia/Shanghai' // 指定时区
      })
    )
  }
})