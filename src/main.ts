import './assets/main.css';

import { createApp } from 'vue';
import { createPinia } from 'pinia';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';
import App from './App.vue';
import router from './router';

const app = createApp(App);
Object.entries(ElementPlusIconsVue).forEach(([key, component]) => {
  app.component(key, component);
});
app.use(ElementPlus);
app.use(createPinia());
app.use(router);

app.mount('#app');
