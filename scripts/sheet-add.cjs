#!/usr/bin/env node
// scripts/sheet-add.cjs
// CLI helper for adding vocab to Google Sheet via /api/admin/vocab/save.
//
// Usage:
//   node scripts/sheet-add.cjs --de 'der Tisch' --en 'table' --pos noun --level A1 --gender m --plural 'die Tische' [--example-de 'Der Tisch ist groß.' --example-en 'The table is big.'] [--dry-run] [--url <baseUrl>] [--id <noun-0010>]
//
// Auth: Bearer CRON_SECRET (default: dd-2026-migrate-9x8y7z) or env var CRON_SECRET.
//   Override with: CRON_SECRET=xxx node scripts/sheet-add.cjs --de ...
//   Override URL: --url https://dein-deutsch.vercel.app

const https = require('https');

const args = process.argv.slice(2);

function printHelp() {
  console.log(`Usage: node sheet-add.cjs --de <german> --en <english> --pos <pos> --level <A1..C2> [--gender m|f|n] [--plural <str>] [--example-de <str>] [--example-en <str>] [--id <id>] [--auto-suggest] [--dry-run] [--url <baseUrl>]`);
  console.log(`  --auto-suggest: if noun and gender/plural missing, auto-fill via /api/admin/vocab/suggest`);
  process.exit(0);
}

const opts = {};
let dryRun = false;
let baseUrl = process.env.DEIN_DEUTSCH_URL || 'https://dein-deutsch.vercel.app';

for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a.startsWith('--')) {
    const k = a.slice(2);
    if (k === 'dry-run') { dryRun = true; continue; }
    if (k === 'auto-suggest') { opts['auto-suggest'] = true; continue; }
    if (k === 'help' || k === 'h') { printHelp(); }
    if (k === 'url') {
      baseUrl = args[++i];
      continue;
    }
    opts[k] = args[++i];
  }
}

if (!opts.de || !opts.en || !opts.pos) {
  console.error('Error: --de, --en, --pos are required');
  printHelp();
}

const prefix = opts.pos;

function fetchMaxId() {
  return new Promise((resolve, reject) => {
    const url = new URL('/api/admin/vocab/list', baseUrl);
    const secret = process.env.CRON_SECRET || 'dd-2026-migrate-9x8y7z';
    https.get(
      { hostname: url.hostname, path: url.pathname, headers: { Authorization: `Bearer ${secret}` } },
      (res) => {
        let data = '';
        res.on('data', (c) => (data += c));
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            if (!parsed.ok) return reject(new Error('list endpoint returned ok=false: ' + JSON.stringify(parsed)));
            const ids = (parsed.vocab || []).map((r) => r.id).filter((i) => i.startsWith(prefix + '-'));
            const nums = ids.map((i) => parseInt(i.slice(prefix.length + 1), 10)).filter((n) => !isNaN(n));
            resolve(nums.length === 0 ? 0 : Math.max(...nums));
          } catch (e) { reject(e); }
        });
      }
    ).on('error', reject);
  });
}

function suggest(word) {
  return new Promise((resolve, reject) => {
    const url = new URL('/api/admin/vocab/suggest', baseUrl);
    const secret = process.env.CRON_SECRET || 'dd-2026-migrate-9x8y7z';
    const body = JSON.stringify({ word });
    const req = https.request(
      {
        method: 'POST',
        hostname: url.hostname,
        path: url.pathname,
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body),
          Authorization: `Bearer ${secret}`,
        },
      },
      (res) => {
        let data = '';
        res.on('data', (c) => (data += c));
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            resolve(parsed.ok ? parsed : null);
          } catch (e) { reject(e); }
        });
      }
    );
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function saveRow(row) {
  return new Promise((resolve, reject) => {
    const url = new URL('/api/admin/vocab/save', baseUrl);
    const secret = process.env.CRON_SECRET || 'dd-2026-migrate-9x8y7z';
    const body = JSON.stringify(row);
    const req = https.request(
      {
        method: 'POST',
        hostname: url.hostname,
        path: url.pathname,
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body),
          Authorization: `Bearer ${secret}`,
        },
      },
      (res) => {
        let data = '';
        res.on('data', (c) => (data += c));
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) { reject(new Error('Non-JSON: ' + data)); }
        });
      }
    );
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

(async () => {
  let id = opts.id;
  if (!id) {
    try {
      const maxId = await fetchMaxId();
      const nextNum = maxId + 1;
      id = `${prefix}-${String(nextNum).padStart(4, '0')}`;
    } catch (e) {
      console.error('Failed to fetch max id:', e.message);
      console.error('Use --id to specify manually');
      process.exit(1);
    }
  }

  const today = new Date().toISOString().slice(0, 10);
  const row = {
    id,
    level: opts.level || 'A1',
    topic: opts.topic || 'starter',
    is_active: 'TRUE',
    de: opts.de,
    pos: opts.pos,
    en: opts.en,
    pronunciation: opts.pronunciation || '',
    ipa: opts.ipa || '',
    updated_at: today,
  };
  if (opts.gender) row.gender = opts.gender;
  if (opts.plural) row.plural = opts.plural;
  if (opts.genitive) row.genitive = opts.genitive;
  if (opts['example-de']) row.example_de = opts['example-de'];
  if (opts['example-en']) row.example_en = opts['example-en'];
  if (opts.notes) row.notes = opts.notes;

  // Auto-suggest: if noun and missing gender/plural, call /api/admin/vocab/suggest
  if (opts['auto-suggest'] && row.pos === 'noun' && (!row.gender || !row.plural)) {
    try {
      const sug = await suggest(opts.de);
      if (sug) {
        if (!row.gender) row.gender = sug.gender;
        if (!row.plural) row.plural = sug.plural;
        console.error(`[auto-suggest] ${opts.de} → ${sug.article} (confidence ${sug.confidence}%)`);
      } else {
        console.error('[auto-suggest] no prediction available');
      }
    } catch (e) {
      console.error('[auto-suggest] error:', e.message);
    }
  }

  // Validation
  const errors = [];
  if (!row.level) errors.push('level required');
  if (!row.de) errors.push('de required');
  if (!row.pos) errors.push('pos required');
  if (row.pos === 'noun' && !row.gender) errors.push('noun missing gender');
  if (row.pos === 'noun' && !row.plural) errors.push('noun missing plural');
  if (errors.length > 0) {
    console.error('Validation errors:');
    errors.forEach((e) => console.error('  -', e));
    process.exit(1);
  }

  if (dryRun) {
    console.log(JSON.stringify(row, null, 2));
    process.exit(0);
  }

  try {
    const result = await saveRow(row);
    console.log(JSON.stringify(result, null, 2));
    if (result.ok) {
      console.error(`\n✓ Saved ${row.id} (${result.action}, row ${result.rowNumber})`);
    } else {
      console.error('\n✗ Save failed');
      process.exit(1);
    }
  } catch (e) {
    console.error('Save error:', e.message);
    process.exit(1);
  }
})();