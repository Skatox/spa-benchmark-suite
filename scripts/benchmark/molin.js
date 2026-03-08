const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const TEMPLATE_PATH = path.join(ROOT, 'config', 'molin-template.json');

function validateMolinMatrix(matrix) {
  const errors = [];
  const criteria = matrix.criteria || [];

  for (const [framework, entries] of Object.entries(matrix.frameworks || {})) {
    const seen = new Set();
    for (const entry of entries) {
      if (!criteria.includes(entry.criterion)) {
        errors.push(`${framework}: criterion not allowed (${entry.criterion})`);
      }
      if (!Number.isInteger(entry.score) || entry.score < 1 || entry.score > 5) {
        errors.push(`${framework}/${entry.criterion}: score must be integer 1-5`);
      }
      if (!entry.justification || !entry.justification.trim()) {
        errors.push(`${framework}/${entry.criterion}: justification is required`);
      }
      if (!Array.isArray(entry.evidence) || entry.evidence.length === 0) {
        errors.push(`${framework}/${entry.criterion}: evidence is required`);
      }
      seen.add(entry.criterion);
    }

    for (const criterion of criteria) {
      if (!seen.has(criterion)) {
        errors.push(`${framework}: missing criterion ${criterion}`);
      }
    }
  }

  return errors;
}

function summarizeMolin(matrix) {
  const summary = [];
  for (const [framework, entries] of Object.entries(matrix.frameworks || {})) {
    const scores = entries.map((item) => item.score);
    const average = scores.reduce((sum, value) => sum + value, 0) / (scores.length || 1);
    summary.push({ framework, criteriaCount: entries.length, averageScore: Number(average.toFixed(3)) });
  }
  return summary;
}

function initTemplate(targetPath) {
  const template = JSON.parse(fs.readFileSync(TEMPLATE_PATH, 'utf8'));
  fs.writeFileSync(targetPath, JSON.stringify(template, null, 2));
}

module.exports = { validateMolinMatrix, summarizeMolin, initTemplate };
