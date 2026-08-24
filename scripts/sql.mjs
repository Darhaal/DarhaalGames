/**
 * Run SQL against the Supabase project via the Management API.
 *
 *   node sql.mjs "<sql>"           — run a query, print rows as a table
 *   node sql.mjs --file <path>     — run the contents of a file
 *
 * Reads credentials from .env.local in the current working directory.
 * Uses only Node built-ins, so it can live outside the project tree.
 */
import fs from 'node:fs';

const env = Object.fromEntries(
  fs
    .readFileSync('.env.local', 'utf8')
    .split(/\r?\n/)
    .filter((l) => l && !l.trimStart().startsWith('#') && l.includes('='))
    .map((l) => {
      const i = l.indexOf('=');
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    })
);

const token = env.SUPABASE_ACCESS_TOKEN;
const ref = env.SUPABASE_PROJECT_REF;
if (!token || !ref) {
  console.error('Missing SUPABASE_ACCESS_TOKEN or SUPABASE_PROJECT_REF in .env.local');
  process.exit(1);
}

const args = process.argv.slice(2);
const query = args[0] === '--file' ? fs.readFileSync(args[1], 'utf8') : args[0];
if (!query) {
  console.error('No SQL provided');
  process.exit(1);
}

const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ query })
});

const text = await res.text();
if (!res.ok) {
  console.error(`HTTP ${res.status}`);
  console.error(text.slice(0, 2000));
  process.exit(1);
}

let rows;
try {
  rows = JSON.parse(text);
} catch {
  console.log(text.slice(0, 2000));
  process.exit(0);
}

if (!Array.isArray(rows) || rows.length === 0) {
  console.log('(no rows)');
  process.exit(0);
}

// Simple column-aligned output
const cols = [...new Set(rows.flatMap((r) => Object.keys(r)))];
const cell = (v) => (v === null ? 'NULL' : typeof v === 'object' ? JSON.stringify(v) : String(v));
const widths = cols.map((c) => Math.max(c.length, ...rows.map((r) => cell(r[c]).length)));
const clamp = (s, w) => (s.length > w ? s.slice(0, w - 1) + '…' : s.padEnd(w));
const MAX = 70;

console.log(cols.map((c, i) => clamp(c, Math.min(widths[i], MAX))).join('  '));
console.log(cols.map((_, i) => '-'.repeat(Math.min(widths[i], MAX))).join('  '));
for (const r of rows) {
  console.log(cols.map((c, i) => clamp(cell(r[c]), Math.min(widths[i], MAX))).join('  '));
}
console.log(`\n(${rows.length} row${rows.length === 1 ? '' : 's'})`);
