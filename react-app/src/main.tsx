import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App';
import './styles/global.css';
import { METRICS, captureWebVitals, mark, measure, registerPerformanceObservers } from './utils/perf';

declare global {
  interface Performance {
    mark(name: string): void;
  }
}

mark(METRICS.APP_START);
registerPerformanceObservers();
captureWebVitals().catch((error) => console.error('Web Vitals failed to start', error));

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found.');
}

const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
