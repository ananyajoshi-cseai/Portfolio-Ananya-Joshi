import { formatProfile } from './stats-format.js';

const latest = {};
for (const provider of ['github', 'leetcode']) {
  latest[provider] = document.querySelector(`time[data-stat="${provider}.updatedAt"]`)?.dateTime;
}
function apply(snapshot) {
  for (const provider of ['github', 'leetcode']) {
    try {
      const value = snapshot[provider];
      const fields = formatProfile(provider, value);
      if (latest[provider] && Date.parse(value.updatedAt) <= Date.parse(latest[provider])) continue;
      document.querySelectorAll('[data-stat]').forEach(element => {
        if (element.dataset.stat in fields) {
          element.textContent = fields[element.dataset.stat];
          if (element.tagName === 'TIME') element.dateTime = value.updatedAt;
        }
      });
      document.querySelectorAll('[data-progress]').forEach(element => {
        if (element.dataset.progress in fields) element.style.width = fields[element.dataset.progress];
      });
      latest[provider] = value.updatedAt;
    } catch {
      // Keep the previous provider's values and timestamp on invalid/partial data.
    }
  }
}

async function load(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(10000), cache: 'no-cache' });
  if (!response.ok) throw new Error('Stats unavailable');
  apply(await response.json());
}

// The built snapshot is the fallback. Raw GitHub serves the daily snapshot even
// when a bot commit does not trigger a new Vercel deployment.
await load(new URL('./data/profile-stats.json', import.meta.url)).catch(() => {});
await load('https://raw.githubusercontent.com/ananyajoshi-cseai/Portfolio-Ananya-Joshi/main/src/data/profile-stats.json').catch(() => {});
