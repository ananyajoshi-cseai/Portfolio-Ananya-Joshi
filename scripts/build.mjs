import { cpSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = resolve(root, 'dist');
// Only the generated dist directory is replaced; source files stay untouched.
if (output !== resolve(root, 'dist')) throw new Error('Unexpected output directory');
rmSync(output, { recursive: true, force: true });
mkdirSync(output, { recursive: true });
cpSync(resolve(root, 'src'), output, { recursive: true });
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
