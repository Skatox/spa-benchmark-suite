const test = require('node:test');
const assert = require('node:assert/strict');
const { validateRunEntry } = require('../scripts/benchmark/pipeline');

test('validateRunEntry flags missing required fields and metrics', () => {
  const result = validateRunEntry({ framework: 'react', metrics: {} });
  assert.ok(result.missingTopLevel.includes('scenario'));
  assert.ok(result.missingMetrics.includes('fcpMs'));
});
