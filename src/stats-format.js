// Shared by the static build and the browser. No credentials belong in this file.
export const USERNAME = 'ananyajoshi-cseai';
export function validateProfile(provider, value) {
  if (!value || value.username !== USERNAME || !/^\d{4}-\d{2}-\d{2}T[\d:.]+Z$/.test(value.updatedAt) || !Number.isFinite(Date.parse(value.updatedAt))) throw new Error(`Invalid ${provider} snapshot`);
  const fields = provider === 'leetcode'
    ? ['solved', 'easy', 'medium', 'hard', 'badges', 'maxStreak', 'activeDays', 'submissions']
    : ['commits', 'pullRequests', 'mergedPRs', 'stars', 'issues', 'contributedRepos', 'contributions', 'currentStreak', 'longestStreak'];
  for (const key of fields) if (!Number.isSafeInteger(value[key]) || value[key] < 0) throw new Error(`Invalid ${provider}.${key}`);
  if (provider === 'leetcode') {
    if (value.solved !== value.easy + value.medium + value.hard) throw new Error('Inconsistent solved counts');
    for (const key of ['rating', 'topPercentage']) {
      if (value[key] !== null && (!Number.isFinite(value[key]) || value[key] < 0)) throw new Error(`Invalid ${key}`);
    }
    if (value.topPercentage > 100 || (value.level !== null && typeof value.level !== 'string')) throw new Error('Invalid contest ranking');
  } else if (value.mergedPRs > value.pullRequests) throw new Error('Inconsistent PR counts');
  return value;
}

export function formatProfile(provider, value) {
  validateProfile(provider, value);
  const date = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Kolkata' }).format(new Date(value.updatedAt));
  const fields = Object.fromEntries(Object.entries(value).map(([key, val]) => [`${provider}.${key}`, String(val)]));
  fields[`${provider}.updatedAt`] = date;
  if (provider === 'leetcode') {
    fields['leetcode.rating'] = value.rating === null ? 'Unrated' : String(Math.round(value.rating));
    fields['leetcode.topPercentage'] = value.topPercentage === null ? '—' : `${value.topPercentage.toFixed(2)}%`;
    fields['leetcode.level'] = value.level || 'Unranked';
    fields['leetcode.heroLabel'] = `LeetCode Solved · ${value.medium} Medium`;
    fields['leetcode.maxStreak'] = `${value.maxStreak} Days 🔥`;
    fields['leetcode.activeDays'] = `${value.activeDays} Days`;
    for (const key of ['easy', 'medium', 'hard']) fields[`leetcode.${key}Width`] = `${value.solved ? (100 * value[key] / value.solved).toFixed(2) : 0}%`;
  } else {
    fields['github.mergedPRs'] = `${value.mergedPRs} (${value.pullRequests ? (100 * value.mergedPRs / value.pullRequests).toFixed(2) : '0.00'}%)`;
    fields['github.contributedRepos'] = `${value.contributedRepos} Repos (last yr)`;
    fields['github.currentStreak'] = `${value.currentStreak} days`;
    fields['github.longestStreak'] = `${value.longestStreak} days`;
  }
  return fields;
}

export function renderSnapshot(html, snapshot) {
  for (const provider of ['github', 'leetcode']) {
    const fields = formatProfile(provider, snapshot[provider]);
    html = html.replace(/<([a-z0-9]+)([^>]*\bdata-stat="([^"]+)"[^>]*)>[^<]*<\/\1>/gi, (whole, tag, attrs, key) => {
      if (!(key in fields)) return whole;
      const text = fields[key].replace(/[&<>"']/g, char => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[char]));
      if (tag === 'time') attrs = attrs.replace(/datetime="[^"]*"/, `datetime="${snapshot[provider].updatedAt}"`);
      return `<${tag}${attrs}>${text}</${tag}>`;
    });
    html = html.replace(/(<div[^>]*data-progress="([^"]+)"[^>]*style=")([^"]*)(")/g, (whole, start, key, style, end) => key in fields ? start + style.replace(/width:\s*[^;]+/, `width: ${fields[key]}`) + end : whole);
  }
  return html;
}
