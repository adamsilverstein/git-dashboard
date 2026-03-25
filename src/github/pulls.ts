import type { Octokit } from '@octokit/rest';
import type { PRItem, RepoConfig } from '../types.js';

export async function fetchPullsForRepo(
  octokit: Octokit,
  repo: RepoConfig,
  maxPerRepo: number
): Promise<PRItem[]> {
  const perPage = Math.max(1, Math.min(maxPerRepo, 100));
  const { data } = await octokit.pulls.list({
    owner: repo.owner,
    repo: repo.name,
    state: 'open',
    sort: 'updated',
    direction: 'desc',
    per_page: perPage,
  });

  return data.map((pr) => ({
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
  }));
}
