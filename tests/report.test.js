const test = require('node:test');
const assert = require('node:assert/strict');
const { hasMinimumData, validateScenarioCompatibility } = require('../scripts/benchmark/report');

test('hasMinimumData rejects empty aggregate list', () => {
  assert.equal(hasMinimumData({ aggregateResults: [] }), false);
  assert.equal(hasMinimumData({ aggregateResults: [{ framework: 'react', scenario: 'home' }] }), true);
});

test('validateScenarioCompatibility detects incompatible scenarios', () => {
  const valid = [
    { framework: 'react', scenario: 'home' },
    { framework: 'vue', scenario: 'home' },
  ];
  const invalid = [
    { framework: 'react', scenario: 'home' },
    { framework: 'vue', scenario: 'home' },
    { framework: 'react', scenario: 'login' },
  ];
  assert.equal(validateScenarioCompatibility(valid), true);
  assert.equal(validateScenarioCompatibility(invalid), false);
});
