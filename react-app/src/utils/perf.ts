import type { Metric } from 'web-vitals';

export type MetricDetail = Record<string, unknown> | undefined;

export interface MetricEntry {
  name: string;
  duration: number;
  timestamp: number;
  detail?: MetricDetail;
}

export interface AppMetrics {
  buffer: MetricEntry[];
  webVitals: Record<string, number>;
  getAndReset: () => { metrics: MetricEntry[]; webVitals: Record<string, number> };
}

declare global {
  interface Window {
    __appMetrics: AppMetrics;
  }
}

let measureObserver: PerformanceObserver | null = null;
const detailRegistry = new Map<string, MetricDetail[]>();

export const METRICS = {
  APP_START: 'app_start',
  FIRST_ROUTE_MOUNTED: 'first_route_mounted',
  ITEMS_TABLE_FIRST_PAINT: 'items_table_first_paint',
  FILTER_APPLIED: 'filter_applied',
  SORT_APPLIED: 'sort_applied',
  PAGE_CHANGED: 'page_changed',
  FORM_SUBMIT_SUCCESS: 'form_submit_success',
};

function ensureMetricsContainer(): void {
  if (typeof window === 'undefined') {
    return;
  }

  if (!window.__appMetrics) {
    const buffer: MetricEntry[] = [];
    const webVitals: Record<string, number> = {};
    window.__appMetrics = {
      buffer,
      webVitals,
      getAndReset: () => {
        const snapshot = { metrics: [...buffer], webVitals: { ...webVitals } };
        buffer.splice(0, buffer.length);
        Object.keys(webVitals).forEach((key) => delete webVitals[key]);
        return snapshot;
      },
    };
  }
}

function logMetricEntry(entry: PerformanceEntry, detail?: MetricDetail): void {
  ensureMetricsContainer();
  const payload: MetricEntry = {
    name: entry.name,
    duration: entry.duration,
    timestamp: Date.now(),
    detail,
  };
  window.__appMetrics.buffer.push(payload);
  console.log(
    JSON.stringify({
      __METRIC__: true,
      name: payload.name,
      duration: payload.duration,
      timestamp: payload.timestamp,
      detail: payload.detail,
    }),
  );
}

export function mark(markName: string): void {
  if (typeof performance === 'undefined') {
    return;
  }
  performance.mark(markName);
}

export function measure(
  name: string,
  startMark: string,
  endMark: string = `${name}:end`,
  detail?: MetricDetail,
): void {
  if (typeof performance === 'undefined') {
    return;
  }
  performance.mark(endMark);
  performance.measure(name, startMark, endMark);
  if (detail) {
    const queue = detailRegistry.get(name) ?? [];
    queue.push(detail);
    detailRegistry.set(name, queue);
  }

  if (typeof PerformanceObserver === 'undefined') {
    const entry = performance.getEntriesByName(name).pop();
    if (entry) {
      logMetricEntry(entry, detail);
    }
  }
}

export function registerPerformanceObservers(): void {
  if (typeof window === 'undefined' || typeof PerformanceObserver === 'undefined') {
    return;
  }
  ensureMetricsContainer();
  if (!measureObserver) {
    measureObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'measure') {
          const queue = detailRegistry.get(entry.name);
          const detail = queue?.shift();
          if (queue && queue.length === 0) {
            detailRegistry.delete(entry.name);
          }
          logMetricEntry(entry, detail);
        }
      });
    });
    try {
      measureObserver.observe({ type: 'measure', buffered: true });
    } catch (error) {
      console.warn('PerformanceObserver error', error);
    }
  }
}

export async function captureWebVitals(): Promise<void> {
  if (typeof window === 'undefined') {
    return;
  }
  ensureMetricsContainer();
  const { onCLS, onFCP, onLCP } = await import('web-vitals');

  const register = (metricName: string) => (metric: Metric) => {
    window.__appMetrics.webVitals[metricName] = metric.value;
  };

  onCLS(register('CLS'));
  onFCP(register('FCP'));
  onLCP(register('LCP'));
}

export function recordMetric(name: string, detail?: MetricDetail): void {
  mark(`${name}:start`);
  measure(name, `${name}:start`, `${name}:end`, detail);
}

ensureMetricsContainer();
