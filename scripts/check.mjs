import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = resolve(root, 'dist');
const html = readFileSync(resolve(output, 'index.html'), 'utf8');
let checked = 0;
function checkReferences(text, base) {
  for (const [, reference] of text.matchAll(/(?:href|src)="([^"]+)"/g)) {
    if (/^(?:[a-z]+:|\/\/)/i.test(reference)) continue;
    if (reference.startsWith('#')) {
      if (reference !== '#') assert(html.includes(`id="${reference.slice(1)}"`), `Missing anchor: ${reference}`);
      continue;
    }
    const relative = decodeURIComponent(reference.split(/[?#]/)[0]);
    let current = base;
    for (const segment of relative.split('/')) {
      assert(readdirSync(current).includes(segment), `Missing file or incorrect case: ${reference}`);
      current = resolve(current, segment);
    }
    assert(statSync(current).isFile(), `Not a file: ${reference}`);
    checked++;
  }
}
checkReferences(html, output);
checkReferences(readFileSync(resolve(root, 'README.md'), 'utf8'), root);
for (const directory of ['certificates', 'assets', 'screenshots']) {
  for (const name of readdirSync(resolve(root, directory))) {
    const original = readFileSync(resolve(root, directory, name));
    assert.deepEqual(readFileSync(resolve(output, directory, name)), original, `Changed asset: ${name}`);
    if (directory !== 'screenshots') {
      assert.deepEqual(readFileSync(resolve(output, name)), original, `Broken legacy URL: ${name}`);
    }
  }
}
// CSS currently has no file URLs; validate any added relative ones as well.
const css = readFileSync(resolve(output, 'styles.css'), 'utf8');
for (const [, reference] of css.matchAll(/url\(\s*['"]?([^'"\s)]+)['"]?\s*\)/g)) {
  checkReferences(`src="${reference}"`, dirname(resolve(output, 'styles.css')));
}
console.log(`Checked ${checked} local references, anchor targets, all deployed assets and legacy URLs.`);
