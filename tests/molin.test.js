const test = require('node:test');
const assert = require('node:assert/strict');
const { validateMolinMatrix } = require('../scripts/benchmark/molin');

const base = {
  criteria: ['documentación'],
  frameworks: {
    react: [
      {
        criterion: 'documentación',
        score: 4,
        justification: 'Documentación extensa.',
        evidence: ['https://react.dev'],
      },
    ],
  },
};

test('molin validation requires justification', () => {
  const invalid = JSON.parse(JSON.stringify(base));
  invalid.frameworks.react[0].justification = '';
  const errors = validateMolinMatrix(invalid);
  assert.ok(errors.some((item) => item.includes('justification is required')));
});

test('molin validation requires evidence', () => {
  const invalid = JSON.parse(JSON.stringify(base));
  invalid.frameworks.react[0].evidence = [];
  const errors = validateMolinMatrix(invalid);
  assert.ok(errors.some((item) => item.includes('evidence is required')));
});
