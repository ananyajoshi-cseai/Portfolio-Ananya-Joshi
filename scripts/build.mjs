import { cpSync, mkdirSync, readdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { renderSnapshot } from '../src/stats-format.js';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = resolve(root, 'dist');
// Only the generated dist directory is replaced; source files stay untouched.
if (output !== resolve(root, 'dist')) throw new Error('Unexpected output directory');
rmSync(output, { recursive: true, force: true });
mkdirSync(output, { recursive: true });
cpSync(resolve(root, 'src'), output, { recursive: true });
const snapshot = JSON.parse(readFileSync(resolve(root, 'src/data/profile-stats.json'), 'utf8'));
writeFileSync(resolve(output, 'index.html'), renderSnapshot(readFileSync(resolve(output, 'index.html'), 'utf8'), snapshot));
for (const directory of ['certificates', 'assets', 'screenshots']) {
  cpSync(resolve(root, directory), resolve(output, directory), { recursive: true });
}
// Keep previously shared root-level certificate/image URLs working.
// These compatibility copies exist only in the generated site, not in source.
for (const directory of ['certificates', 'assets']) {
  for (const name of readdirSync(resolve(root, directory))) {
    cpSync(resolve(root, directory, name), resolve(output, name));
  }
}
console.log('Built static site in dist/ (including legacy certificate URLs).');
