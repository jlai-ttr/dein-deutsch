const fs = require('fs');
const f = 'app/woerter/page.tsx';
const txt = fs.readFileSync(f, 'utf8');
const lines = txt.split('\n');

let total = 0, both = 0, exOnly = 0, enOnly = 0, none = 0;
let missing = [];

for (const line of lines) {
  const idM = line.match(/id:\s*'([^']+)'/);
  if (!idM) continue;
  total++;
  const exM = line.match(/example:\s*'([^']*)'/);
  const enM = line.match(/exampleEn:\s*'([^']*)'/);
  const ex = exM ? exM[1] : null;
  const en = enM ? enM[1] : null;
  if (ex === null || en === null) {
    // field missing entirely
    if (ex === null && en === null) { none++; missing.push(idM[1] + ' [no fields]'); }
    else if (ex === null) { enOnly++; missing.push(idM[1] + ' [no example]'); }
    else { exOnly++; missing.push(idM[1] + ' [no exampleEn]'); }
  } else if (ex === '' && en === '') both++;
  else if (ex === '' && en !== '') exOnly++;
  else if (ex !== '' && en === '') enOnly++;
  else {
    // both filled
  }
}

console.log('total cards:', total);
console.log('both empty:', both);
console.log('example only empty:', exOnly);
console.log('exampleEn only empty:', enOnly);
console.log('both fields missing entirely:', none);