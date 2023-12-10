import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';
import { createHtmlPlugin } from 'vite-plugin-html';
import { autoComplete, Plugin as importToCDN } from 'vite-plugin-cdn-import';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    importToCDN({
      modules: [
        autoComplete('vue'),
        {
          name: 'echarts',
          var: 'echarts',
          path: 'https://unpkg.com/echarts@5.4.3/dist/echarts.min.js'
        }
      ]
    }),
    createHtmlPlugin({
      minify: true
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  base: './',
  publicDir: 'static',
  build: {
    outDir: './docs',
    emptyOutDir: 1,
    assetsInlineLimit: 0,
    assetsDir: './static',
    chunkSizeWarningLimit: 500,
    minify: 'terser',
    // cssCodeSplit: false, // 如果设置为false，整个项目中的所有 CSS 将被提取到一个 CSS 文件中
    terserOptions: {
      compress: {
        drop_console: true, //打包时删除console
        drop_debugger: true //打包时删除 debugger
        // pure_funcs: ['console.log'],
      },
      output: {
        // 去掉注释内容
        comments: false
      }
    }
  }
});
