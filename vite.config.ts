import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: "/",
  resolve: {
    // 关键配置在这里！
    // 告诉 Vite 优先查找哪个字段。
    // 默认是 ['module', 'main']，我们强制把 module 放在第一位，并排除 exports 避免冲突
    mainFields: ['module', 'main'],
  },
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
