import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'


// 1. 定义一个变量，通过类型断言强制获取 __dirname
// @ts-ignore - 忽略下一行的类型检查
// const rootDir = typeof __dirname !== 'undefined' ? __dirname : (globalThis as any).__dirname || '/';

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: "/",
  // resolve: {
  //   alias: {
  //     // 这里的逻辑：
  //     // 1. import.meta.url 获取当前 vite.config.ts 的文件路径
  //     // 2. new URL(...).pathname 转换为系统绝对路径
  //     // 3. replace(...) 去掉文件名，只保留目录
  //     // 4. 拼接上 node_modules 的真实路径
  //     'v-code-diff': rootDir  + '/node_modules/v-code-diff/dist/index.es.js'
  //   }
  // },
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