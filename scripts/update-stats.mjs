import { readFile, writeFile, rename } from 'node:fs/promises';
import { fetchGithub, graphql, LEETCODE_QUERY, parseLeetcode, refreshSnapshot } from './profile-sources.mjs';
import { USERNAME } from '../src/stats-format.js';

const file = new URL('../src/data/profile-stats.json', import.meta.url);
const previous = JSON.parse(await readFile(file, 'utf8'));
const now = new Date();
const loaders = {
  github: () => fetchGithub(process.env.GITHUB_TOKEN, now),
  leetcode: async () => parseLeetcode(await graphql('https://leetcode.com/graphql/', LEETCODE_QUERY,
    { username: USERNAME }, { Referer: `https://leetcode.com/u/${USERNAME}/` }), now),
};
const only = process.argv.find(arg => arg.startsWith('--provider='))?.split('=')[1];
if (only && !Object.hasOwn(loaders, only)) throw new Error('Unknown provider');
const { snapshot, errors } = await refreshSnapshot(previous, only ? { [only]: loaders[only] } : loaders);
if (!process.argv.includes('--check')) {
  const temporary = new URL(`${file.href}.tmp`);
  await writeFile(temporary, JSON.stringify(snapshot, null, 2) + '\n');
  await rename(temporary, file);
}
console.log(`Snapshot: ${JSON.stringify(snapshot)}`);
for (const error of errors) console.error(`${error.provider}: refresh failed; previous snapshot retained. ${error.message}`);
if (errors.length) process.exitCode = 1;
