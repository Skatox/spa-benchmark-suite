const path = require('path');
const { initTemplate } = require('./molin');

const target = process.argv[2] || path.resolve(__dirname, '..', '..', 'results', 'molin-evaluation.json');
initTemplate(target);
console.log(`Molin template created at ${target}`);
