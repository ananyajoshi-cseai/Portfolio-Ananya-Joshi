import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fetchGithub, graphql, parseLeetcode, refreshSnapshot, streaks } from '../scripts/profile-sources.mjs';
import { formatProfile, renderSnapshot, validateProfile } from '../src/stats-format.js';

const saved = JSON.parse(readFileSync(new URL('../src/data/profile-stats.json', import.meta.url), 'utf8'));
const now = new Date('2026-10-27T03:17:00Z');
const lc = () => ({ matchedUser: {
  username: 'ananyajoshi-cseai', badges: [{id:'a'}],
  submitStatsGlobal: { acSubmissionNum: [
    {difficulty:'All',count:6}, {difficulty:'Easy',count:1}, {difficulty:'Medium',count:2}, {difficulty:'Hard',count:3},
  ] },
  userCalendar: { streak:2,totalActiveDays:2,submissionCalendar:'{"1792972800":3,"1793059200":4}' },
}, userContestRanking: { rating:2075.34,topPercentage:1.77,badge:{name:'Knight'} } });
const days = values => values.map(([date,contributionCount]) => ({date,contributionCount}));

test('LeetCode distinguishes accepted problems from submission attempts', () => {
  const result = parseLeetcode(lc(), now);
  assert.equal(result.solved,6); assert.equal(result.submissions,7); assert.equal(result.updatedAt,now.toISOString());
  const fields = formatProfile('leetcode',result);
  assert.equal(fields['leetcode.mediumWidth'],'33.33%'); assert.equal(fields['leetcode.rating'],'2075');
});
test('unrated and zero-solved profiles render without NaN or invented rank', () => {
  const data=lc(); data.userContestRanking=null;
  data.matchedUser.submitStatsGlobal.acSubmissionNum.forEach(row=>row.count=0);
  const fields=formatProfile('leetcode',parseLeetcode(data,now));
  assert.equal(fields['leetcode.rating'],'Unrated'); assert.equal(fields['leetcode.topPercentage'],'—');
  assert.equal(fields['leetcode.easyWidth'],'0%');
});
test('missing or inconsistent fields are rejected instead of replacing valid stats', () => {
  const data=lc(); data.matchedUser.submitStatsGlobal.acSubmissionNum[0].count=999;
  assert.throws(()=>parseLeetcode(data,now),/Inconsistent/);
  assert.throws(()=>validateProfile('github',{...saved.github,stars:null}),/Invalid/);
  assert.throws(()=>parseLeetcode({matchedUser:null},now),/missing/);
});
test('current streak allows today to be unfinished, but not a gap yesterday', () => {
  const active=days([['2026-10-24',1],['2026-10-25',2],['2026-10-26',1],['2026-10-27',0]]);
  assert.deepEqual(streaks(active,now),{currentStreak:3,longestStreak:3});
  active[2].contributionCount=0;
  assert.deepEqual(streaks(active,now),{currentStreak:0,longestStreak:2});
  active[3].contributionCount=1;
  assert.deepEqual(streaks(active,now),{currentStreak:1,longestStreak:2});
});
test('calendar gaps and future placeholders do not extend a streak', () => {
  assert.deepEqual(streaks(days([['2026-10-23',1],['2026-10-25',1],['2026-10-26',1],['2026-10-28',10]]),now),{currentStreak:2,longestStreak:2});
});
test('GitHub stars include every repository page and merged percentages handle zero', async () => {
  const requests=[];
  const fetcher=async(url,options)=>{
    requests.push(JSON.parse(options.body));
    const after=requests.at(-1).variables.after;
    return {ok:true,json:async()=>({data:{user:{login:'ananyajoshi-cseai',
      pullRequests:{totalCount:0},mergedPRs:{totalCount:0},issues:{totalCount:0},
      repositories:{nodes:[{stargazerCount:after?3:2}],pageInfo:{hasNextPage:!after,endCursor:after?null:'page2'}},
      contributionsCollection:{totalCommitContributions:2,totalRepositoriesWithContributedCommits:1,
        contributionCalendar:{totalContributions:2,weeks:[{contributionDays:days([['2026-10-26',2]])}]}}
    }}})};
  };
  const result=await fetchGithub('test-token',now,fetcher);
  assert.equal(result.stars,5); assert.equal(requests.length,2);
  assert.equal(formatProfile('github',result)['github.mergedPRs'],'0 (0.00%)');
});
test('HTTP errors and GraphQL partial errors never count as a successful fetch', async () => {
  await assert.rejects(graphql('x','x',{}, {}, async()=>({ok:false,status:429})),/429/);
  await assert.rejects(graphql('x','x',{}, {}, async()=>({ok:true,json:async()=>({data:{},errors:[{message:'denied'}]})})),/errors/);
});
test('one provider can update without losing the failed provider or its date', async () => {
  const refreshed=parseLeetcode(lc(),now);
  const result=await refreshSnapshot(saved,{github:async()=>{throw Error('unavailable')},leetcode:async()=>refreshed});
  assert.deepEqual(result.snapshot.github,saved.github);
  assert.deepEqual(result.snapshot.leetcode,refreshed);
  assert.equal(result.errors.length,1);
});
test('both providers failing leave the complete previous snapshot intact', async () => {
  const fail=async()=>{throw Error('offline')};
  assert.deepEqual((await refreshSnapshot(saved,{github:fail,leetcode:fail})).snapshot,saved);
});
test('static build replaces every stat binding, date, hero value and progress bar', () => {
  const html=readFileSync(new URL('../src/index.html',import.meta.url),'utf8');
  const result=renderSnapshot(html,saved);
  const fields={...formatProfile('github',saved.github),...formatProfile('leetcode',saved.leetcode)};
  const matches=[...result.matchAll(/data-stat="([^"]+)"[^>]*>([^<]*)</g)];
  assert.equal(matches.length,24);
  for(const [,key,value] of matches) assert.equal(value,fields[key],key);
  for(const key of ['easy','medium','hard']) assert(result.includes(`width: ${fields[`leetcode.${key}Width`]};`));
  assert(result.includes(`datetime="${saved.leetcode.updatedAt}"`));
  assert(!result.includes('Current streak · Aug'));
});
