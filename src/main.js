import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

import { i18n } from './locales/i18n'

import CKEditor from '@ckeditor/ckeditor5-vue'

const app = createApp(App)

app
  .use(router)
  .use(createPinia())
  .use(ElementPlus)
  .use(i18n)
  .use(CKEditor)                                
  .mount('#app')
