import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import AutoImport from 'unplugin-auto-import/vite'


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      imports: [
        'vue',
      ],
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, "./src"),
    },
  },

  base: './',
  publicDir: 'static',
  build: {
    outDir:"./docs",
    emptyOutDir: 1,
    assetsDir: './static',
    chunkSizeWarningLimit: 500,
    minify: 'terser',
    // cssCodeSplit: false, // 如果设置为false，整个项目中的所有 CSS 将被提取到一个 CSS 文件中
    terserOptions: {
      compress: {
        drop_console: true,  //打包时删除console
        drop_debugger: true, //打包时删除 debugger
        // pure_funcs: ['console.log'],
      },
      output: {
        // 去掉注释内容
        comments: false,
      },
    },
  },
})
