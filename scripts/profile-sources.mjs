import { USERNAME, validateProfile } from '../src/stats-format.js';

export const LEETCODE_QUERY = `query($username:String!){
  matchedUser(username:$username){username badges{id}
    submitStatsGlobal{acSubmissionNum{difficulty count}}
    userCalendar{streak totalActiveDays submissionCalendar}}
  userContestRanking(username:$username){rating topPercentage badge{name}}
}`;
export const GITHUB_QUERY = `query($username:String!,$after:String){
  user(login:$username){login
    pullRequests{totalCount} mergedPRs:pullRequests(states:MERGED){totalCount}
    issues{totalCount}
    repositories(first:100,after:$after,ownerAffiliations:OWNER,privacy:PUBLIC,isFork:false){
      nodes{stargazerCount} pageInfo{hasNextPage endCursor}}
    contributionsCollection{
      totalCommitContributions totalRepositoriesWithContributedCommits
      contributionCalendar{totalContributions weeks{contributionDays{date contributionCount}}}}
  }
}`;

export async function graphql(url, query, variables, headers = {}, fetcher = fetch) {
  const response = await fetcher(url, {
    method: 'POST', headers: { 'Content-Type': 'application/json', 'User-Agent': 'Ananya-Portfolio-Stats', ...headers },
    body: JSON.stringify({ query, variables }), signal: AbortSignal.timeout(25000),
  });
  if (!response.ok) throw new Error(`Profile service returned HTTP ${response.status}`);
  const result = await response.json();
  if (result.errors?.length || !result.data) throw new Error('Profile query returned errors or no data');
  return result.data;
}

export function parseLeetcode(data, now = new Date()) {
  const user = data.matchedUser;
  if (user?.username?.toLowerCase() !== USERNAME || !Array.isArray(user.badges)) throw new Error('LeetCode profile missing');
  const counts = Object.fromEntries(user.submitStatsGlobal.acSubmissionNum.map(row => [row.difficulty, row.count]));
  const calendar = user.userCalendar;
  const submissions = JSON.parse(calendar.submissionCalendar);
  if (!submissions || typeof submissions !== 'object' || Array.isArray(submissions)) throw new Error('Invalid submission calendar');
  let total = 0;
  for (const [timestamp, count] of Object.entries(submissions)) {
    if (!/^\d+$/.test(timestamp) || !Number.isSafeInteger(count) || count < 0) throw new Error('Invalid submission count');
    total += count;
  }
  const contest = data.userContestRanking;
  return validateProfile('leetcode', {
    username: USERNAME, updatedAt: now.toISOString(), solved: counts.All,
    easy: counts.Easy, medium: counts.Medium, hard: counts.Hard,
    rating: contest === null ? null : contest.rating,
    topPercentage: contest === null ? null : contest.topPercentage,
    level: contest?.badge?.name ?? null, badges: user.badges.length,
    maxStreak: calendar.streak, activeDays: calendar.totalActiveDays, submissions: total,
  });
}

export function streaks(days, now = new Date()) {
  const today = now.toISOString().slice(0, 10);
  const sorted = [...days].filter(day => day.date <= today).sort((a, b) => a.date.localeCompare(b.date));
  let longest = 0, run = 0, previous = null;
  for (const day of sorted) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(day.date) || !Number.isSafeInteger(day.contributionCount) || day.contributionCount < 0) throw new Error('Invalid contribution calendar');
    const adjacent = previous !== null && Date.parse(day.date) - Date.parse(previous) === 86400000;
    run = day.contributionCount > 0 ? (adjacent ? run + 1 : 1) : 0;
    longest = Math.max(longest, run);
    previous = day.date;
  }
  const byDate = new Map(sorted.map(day => [day.date, day.contributionCount]));
  let cursor = Date.parse(today), current = 0;
  // Today's still in progress: a contribution yesterday keeps the streak alive.
  if (!byDate.get(today)) cursor -= 86400000;
  while ((byDate.get(new Date(cursor).toISOString().slice(0, 10)) || 0) > 0) {
    current++; cursor -= 86400000;
  }
  return { currentStreak: current, longestStreak: longest };
}

export async function fetchGithub(token, now = new Date(), fetcher = fetch) {
  if (!token) throw new Error('GITHUB_TOKEN is required for GitHub stats');
  let after = null, stars = 0, user;
  const cursors = new Set();
  do {
    const data = await graphql('https://api.github.com/graphql', GITHUB_QUERY,
      { username: USERNAME, after }, { Authorization: `Bearer ${token}` }, fetcher);
    if (data.user?.login?.toLowerCase() !== USERNAME) throw new Error('GitHub profile missing');
    user ??= data.user;
    const repos = data.user.repositories;
    for (const repo of repos.nodes) {
      if (!Number.isSafeInteger(repo.stargazerCount) || repo.stargazerCount < 0) throw new Error('Invalid star count');
      stars += repo.stargazerCount;
    }
    after = repos.pageInfo.hasNextPage ? repos.pageInfo.endCursor : null;
    if (repos.pageInfo.hasNextPage && (!after || cursors.has(after))) throw new Error('Invalid repository pagination');
    cursors.add(after);
  } while (after);
  const contributions = user.contributionsCollection;
  const days = contributions.contributionCalendar.weeks.flatMap(week => week.contributionDays);
  if (!days.length) throw new Error('Contribution calendar missing');
  return validateProfile('github', {
    username: USERNAME, updatedAt: now.toISOString(), commits: contributions.totalCommitContributions,
    pullRequests: user.pullRequests.totalCount, mergedPRs: user.mergedPRs.totalCount,
    issues: user.issues.totalCount, stars, contributedRepos: contributions.totalRepositoriesWithContributedCommits,
    contributions: contributions.contributionCalendar.totalContributions, ...streaks(days, now),
  });
}

export async function refreshSnapshot(previous, loaders) {
  const snapshot = { ...previous }, errors = [];
  for (const [provider, loader] of Object.entries(loaders)) {
    try { snapshot[provider] = validateProfile(provider, await loader()); }
    catch (error) { errors.push({ provider, message: error.message }); }
  }
  return { snapshot, errors };
}
