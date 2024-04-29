import App from './App'
import { createSSRApp } from 'vue'
import xhAi from './components/xh-ai.vue'
// 创建实例
import { createPinia } from 'pinia';

const pinia = createPinia();
export function createApp() {
  const app = createSSRApp(App)
  app.use(pinia);
  // 注册全局组件
  app.component('xh-ai', xhAi);
  return {
    app
  }
}