function asNumbers(values) {
  return values.filter((value) => Number.isFinite(value));
}

function mean(values) {
  const items = asNumbers(values);
  if (!items.length) return null;
  return items.reduce((sum, value) => sum + value, 0) / items.length;
}

function median(values) {
  const items = asNumbers(values).sort((a, b) => a - b);
  if (!items.length) return null;
  const mid = Math.floor(items.length / 2);
  return items.length % 2 === 0 ? (items[mid - 1] + items[mid]) / 2 : items[mid];
}

function stdDev(values) {
  const items = asNumbers(values);
  if (items.length < 2) return 0;
  const avg = mean(items);
  const variance = items.reduce((sum, value) => sum + (value - avg) ** 2, 0) / (items.length - 1);
  return Math.sqrt(variance);
}

function min(values) {
  const items = asNumbers(values);
  return items.length ? Math.min(...items) : null;
}

function max(values) {
  const items = asNumbers(values);
  return items.length ? Math.max(...items) : null;
}

function range(values) {
  const lo = min(values);
  const hi = max(values);
  if (lo === null || hi === null) return null;
  return hi - lo;
}

function summarize(values) {
  return {
    n: asNumbers(values).length,
    mean: mean(values),
    median: median(values),
    stdDev: stdDev(values),
    min: min(values),
    max: max(values),
    range: range(values),
  };
}

module.exports = { summarize };
