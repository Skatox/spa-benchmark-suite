import App from './App.svelte';
import './styles/global.css';
import { METRICS, captureWebVitals, mark, registerPerformanceObservers } from './utils/perf';

mark(METRICS.APP_START);
registerPerformanceObservers();
captureWebVitals().catch((error) => console.error('Web Vitals failed to start', error));

const target = document.getElementById('app');

if (!target) {
  throw new Error('Root element not found.');
}

const app = new App({ target });

export default app;
