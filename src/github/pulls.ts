import type { Octokit } from '@octokit/rest';
import type { PRItem, PRState, RepoConfig } from '../types.js';

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export async function fetchPullsForRepo(
  octokit: Octokit,
  repo: RepoConfig,
  maxPerRepo: number
): Promise<PRItem[]> {
  const perPage = Math.max(1, Math.min(maxPerRepo, 100));
  const cutoff = new Date(Date.now() - THIRTY_DAYS_MS).toISOString();

  // Fetch all PRs sorted by updated descending — includes open, closed, and merged
  const { data } = await octokit.pulls.list({
    owner: repo.owner,
    repo: repo.name,
    state: 'all',
    sort: 'updated',
    direction: 'desc',
    per_page: perPage,
  });

  // Filter to only PRs with activity in the last 30 days
  const recent = data.filter((pr) => pr.updated_at >= cutoff);

  return recent.map((pr) => {
    let state: PRState = 'open';
    if (pr.merged_at) {
      state = 'merged';
    } else if (pr.state === 'closed') {
      state = 'closed';
    }

    return {
      id: pr.id,
      number: pr.number,
      title: pr.title,
      author: pr.user?.login ?? 'unknown',
      repo: { owner: repo.owner, name: repo.name },
      url: pr.html_url,
      updatedAt: pr.updated_at,
      createdAt: pr.created_at,
      ciStatus: 'none' as const,
      reviewState: { approvals: 0, changesRequested: 0, commentCount: 0 },
      draft: pr.draft ?? false,
      state,
    };
  });
}
