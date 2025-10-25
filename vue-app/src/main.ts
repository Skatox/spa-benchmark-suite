import { createApp } from 'vue';
import { createPinia } from 'pinia';

import App from './App.vue';
import router from './router';
import './styles/global.css';
import { METRICS, captureWebVitals, mark, registerPerformanceObservers } from './utils/perf';

mark(METRICS.APP_START);
registerPerformanceObservers();
captureWebVitals().catch((error) => console.error('Web Vitals failed to start', error));

const app = createApp(App);

app.use(createPinia());
app.use(router);

app.mount('#app');
