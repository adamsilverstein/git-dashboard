import { useState, useCallback, useEffect } from 'react';
import type { Octokit } from '@octokit/rest';
import type { PRItem, RepoConfig } from '../types.js';
import { fetchPullsForRepo } from '../github/pulls.js';
import { getCheckStatus, getReviewState } from '../github/checks.js';

interface UseGithubDataResult {
  items: PRItem[];
  loading: boolean;
  error: string | null;
  lastRefresh: Date | null;
  refresh: () => void;
}

export function useGithubData(
  octokit: Octokit | null,
  repos: RepoConfig[],
  maxPerRepo: number
): UseGithubDataResult {
  const [items, setItems] = useState<PRItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const refresh = useCallback(async () => {
    if (!octokit || repos.length === 0) return;
    setLoading(true);
    setError(null);

    try {
      // Fetch PRs from all repos in parallel
      const results = await Promise.allSettled(
        repos.map((repo) => fetchPullsForRepo(octokit, repo, maxPerRepo))
      );

      let allPRs: PRItem[] = [];
      for (const result of results) {
        if (result.status === 'fulfilled') {
          allPRs = allPRs.concat(result.value);
        }
      }

      // Enrich with CI status and reviews in parallel
      const enriched = await Promise.allSettled(
        allPRs.map(async (pr) => {
          const [ciResult, reviewResult] = await Promise.allSettled([
            getCheckStatus(octokit, pr.repo.owner, pr.repo.name, `refs/pull/${pr.number}/head`),
            getReviewState(octokit, pr.repo.owner, pr.repo.name, pr.number),
          ]);

          return {
            ...pr,
            ciStatus:
              ciResult.status === 'fulfilled' ? ciResult.value : pr.ciStatus,
            reviewState:
              reviewResult.status === 'fulfilled'
                ? reviewResult.value
                : pr.reviewState,
          };
        })
      );

      const finalItems: PRItem[] = enriched
        .filter(
          (r): r is PromiseFulfilledResult<PRItem> => r.status === 'fulfilled'
        )
        .map((r) => r.value);

      setItems(finalItems);
      setLastRefresh(new Date());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [octokit, repos, maxPerRepo]);

  // Auto-fetch on mount and when repos change
  useEffect(() => {
    refresh();
  }, [refresh]);

  return { items, loading, error, lastRefresh, refresh };
}
