// scripts/inject-topic.mjs
// Injects a topic deck (from app/lib/topic-<name>.ts) into woerter/page.tsx
// Adds an import line + spreads the entries into SEED_VOCAB.

import fs from 'node:fs';

const TARGET = 'app/woerter/page.tsx';
const TOPIC_FILE = process.argv[2] || 'app/lib/topic-business.ts';
const TOPIC_NAME = TOPIC_FILE.match(/topic-([\w-]+)/)?.[1] || 'business';
const IMPORT_NAME = `TOPIC_${TOPIC_NAME.toUpperCase().replace(/-/g, '_')}`;
const SPREAD_NAME = `...${IMPORT_NAME}`;

console.log(`Importing ${IMPORT_NAME} from ${TOPIC_FILE}`);

const file = fs.readFileSync(TARGET, 'utf-8');

// 1. Add import
const importLine = `import { ${IMPORT_NAME} } from '../lib/topic-${TOPIC_NAME}';\n`;
if (file.includes(importLine)) {
  console.log('Import already exists, skipping');
} else {
  // Find a good spot — after the last import
  const lines = file.split('\n');
  let lastImport = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('import ')) lastImport = i;
  }
  lines.splice(lastImport + 1, 0, importLine.trim());
  fs.writeFileSync(TARGET, lines.join('\n'));
  console.log(`Added import at line ${lastImport + 2}`);
}

// 2. Spread topic entries into SEED_VOCAB
const file2 = fs.readFileSync(TARGET, 'utf-8');
const spreadLine = `  ...${IMPORT_NAME},`;
if (file2.includes(spreadLine)) {
  console.log('Spread already exists, skipping');
} else {
  // Find the closing of SEED_VOCAB
  const startMarker = 'const SEED_VOCAB';
  const startIdx = file2.indexOf(startMarker);
  if (startIdx < 0) {
    console.error('SEED_VOCAB not found');
    process.exit(1);
  }
  // Find the first entry after the opening [
  const openBracketIdx = file2.indexOf('[', startIdx);
  // The next non-comment, non-empty line should be a card entry or the auto-generated block
  // Insert spread right after the opening [
  const before = file2.slice(0, openBracketIdx + 1);
  const after = file2.slice(openBracketIdx + 1);
  const newFile = before + '\n' + spreadLine + '\n' + after;
  fs.writeFileSync(TARGET, newFile);
  console.log(`Spread ${IMPORT_NAME} into SEED_VOCAB`);
}

console.log('Done.');