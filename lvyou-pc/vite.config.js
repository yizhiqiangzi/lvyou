import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path';
const pathResolve = (dir) => resolve(__dirname, '.', dir);

// https://vitejs.dev/config/
export default defineConfig({
  // publicPath:'./',
  // base: '/lvyou/',
  base: './', // 设置为相对路径
  plugins: [vue()],
  resolve: {
    alias: [
      { find: '@', replacement: pathResolve('src') },
      { find: '*', replacement: pathResolve('./') }
    ],
  },
})
