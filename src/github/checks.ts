import type { Octokit } from '@octokit/rest';
import type { CIStatus, ReviewState } from '../types.js';

export async function getCheckStatus(
  octokit: Octokit,
  owner: string,
  repo: string,
  ref: string
): Promise<CIStatus> {
  try {
    const { data } = await octokit.checks.listForRef({
      owner,
      repo,
      ref,
      per_page: 100,
    });
    const allRuns = data.check_runs;
    if (allRuns.length === 0) return 'none';

    // Keep only the latest run per check name (reruns create duplicate entries)
    const latestByName = new Map<string, (typeof allRuns)[number]>();
    for (const run of allRuns) {
      const existing = latestByName.get(run.name);
      if (!existing || new Date(run.started_at ?? 0) > new Date(existing.started_at ?? 0)) {
        latestByName.set(run.name, run);
      }
    }
    const runs = [...latestByName.values()];

    const failConclusions = new Set(['failure', 'timed_out', 'cancelled', 'action_required']);
    if (runs.some((r) => r.conclusion && failConclusions.has(r.conclusion)))
      return 'failure';
    if (runs.some((r) => r.status === 'in_progress' || r.status === 'queued'))
      return 'pending';
    if (runs.every((r) => r.conclusion === 'success' || r.conclusion === 'skipped' || r.conclusion === 'neutral'))
      return 'success';
    return 'mixed';
  } catch (e) {
    console.warn('Failed to fetch check status:', e);
    return 'none';
  }
}

export async function isRequestedReviewer(
  octokit: Octokit,
  owner: string,
  repo: string,
  prNumber: number,
  username: string
): Promise<boolean> {
  try {
    const { data } = await octokit.pulls.listRequestedReviewers({
      owner,
      repo,
      pull_number: prNumber,
    });
    return data.users.some(
      (u) => u.login.toLowerCase() === username.toLowerCase()
    );
  } catch (e) {
    console.warn('Failed to fetch requested reviewers:', e);
    return false;
  }
}

export async function getReviewState(
  octokit: Octokit,
  owner: string,
  repo: string,
  prNumber: number
): Promise<ReviewState> {
  try {
    const { data: reviews } = await octokit.pulls.listReviews({
      owner,
      repo,
      pull_number: prNumber,
      per_page: 100,
    });

    const latestByReviewer = new Map<string, string>();
    for (const review of reviews) {
      if (review.user && review.state !== 'COMMENTED') {
        latestByReviewer.set(review.user.login, review.state);
      }
    }

    const approvals = [...latestByReviewer.values()].filter(
      (s) => s === 'APPROVED'
    ).length;
    const changesRequested = [...latestByReviewer.values()].filter(
      (s) => s === 'CHANGES_REQUESTED'
    ).length;
    const commentCount = reviews.filter(
      (r) => r.state === 'COMMENTED'
    ).length;

    return { approvals, changesRequested, commentCount };
  } catch (e) {
    console.warn('Failed to fetch review state:', e);
    return { approvals: 0, changesRequested: 0, commentCount: 0 };
  }
}
