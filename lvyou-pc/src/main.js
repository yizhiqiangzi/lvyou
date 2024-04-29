import { createApp } from 'vue'
import App from './App.vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import router from './router/index.js'


const app = createApp(App)

app.use(ElementPlus,{ locale: zhCn,size:'large' })
app.use(router)
app.mount('#app')
