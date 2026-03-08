const test = require('node:test');
const assert = require('node:assert/strict');
const { summarize } = require('../scripts/benchmark/stats');

test('summarize computes descriptive statistics', () => {
  const result = summarize([1, 2, 3, 4]);
  assert.equal(result.n, 4);
  assert.equal(result.mean, 2.5);
  assert.equal(result.median, 2.5);
  assert.equal(result.min, 1);
  assert.equal(result.max, 4);
  assert.equal(result.range, 3);
  assert.ok(result.stdDev > 1.28 && result.stdDev < 1.30);
});
