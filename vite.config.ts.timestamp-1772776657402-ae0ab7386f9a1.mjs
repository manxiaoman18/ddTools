// vite.config.ts
import { defineConfig } from "file:///D:/MyProfile/ddTools/node_modules/.pnpm/vite@5.4.21/node_modules/vite/dist/node/index.js";
import vue from "file:///D:/MyProfile/ddTools/node_modules/.pnpm/@vitejs+plugin-vue@5.2.4_vite@5.4.21_vue@3.5.26_typescript@5.6.3_/node_modules/@vitejs/plugin-vue/dist/index.mjs";
var vite_config_default = defineConfig({
  plugins: [vue()],
  base: "/ddTools/",
  define: {
    // 注入构建时间变量（格式：YYYY-MM-DD HH:mm:ss）
    "import.meta.env.BUILD_TIME": JSON.stringify(
      (/* @__PURE__ */ new Date()).toLocaleString("zh-CN", {
        hour12: false,
        timeZone: "Asia/Shanghai"
        // 指定时区
      })
    )
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxNeVByb2ZpbGVcXFxcZGRUb29sc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRDpcXFxcTXlQcm9maWxlXFxcXGRkVG9vbHNcXFxcdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0Q6L015UHJvZmlsZS9kZFRvb2xzL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSdcbmltcG9ydCB2dWUgZnJvbSAnQHZpdGVqcy9wbHVnaW4tdnVlJ1xuXG4vLyBodHRwczovL3ZpdGUuZGV2L2NvbmZpZy9cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIHBsdWdpbnM6IFt2dWUoKV0sXG4gIGJhc2U6IFwiL2RkVG9vbHMvXCIsXG4gIGRlZmluZToge1xuICAgIC8vIFx1NkNFOFx1NTE2NVx1Njc4NFx1NUVGQVx1NjVGNlx1OTVGNFx1NTNEOFx1OTFDRlx1RkYwOFx1NjgzQ1x1NUYwRlx1RkYxQVlZWVktTU0tREQgSEg6bW06c3NcdUZGMDlcbiAgICAnaW1wb3J0Lm1ldGEuZW52LkJVSUxEX1RJTUUnOiBKU09OLnN0cmluZ2lmeShcbiAgICAgIG5ldyBEYXRlKCkudG9Mb2NhbGVTdHJpbmcoJ3poLUNOJywge1xuICAgICAgICBob3VyMTI6IGZhbHNlLFxuICAgICAgICB0aW1lWm9uZTogJ0FzaWEvU2hhbmdoYWknIC8vIFx1NjMwN1x1NUI5QVx1NjVGNlx1NTMzQVxuICAgICAgfSlcbiAgICApXG4gIH1cbn0pIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFvUCxTQUFTLG9CQUFvQjtBQUNqUixPQUFPLFNBQVM7QUFHaEIsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsU0FBUyxDQUFDLElBQUksQ0FBQztBQUFBLEVBQ2YsTUFBTTtBQUFBLEVBQ04sUUFBUTtBQUFBO0FBQUEsSUFFTiw4QkFBOEIsS0FBSztBQUFBLE9BQ2pDLG9CQUFJLEtBQUssR0FBRSxlQUFlLFNBQVM7QUFBQSxRQUNqQyxRQUFRO0FBQUEsUUFDUixVQUFVO0FBQUE7QUFBQSxNQUNaLENBQUM7QUFBQSxJQUNIO0FBQUEsRUFDRjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
