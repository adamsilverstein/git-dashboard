import type { Octokit } from '@octokit/rest';

/**
 * Logins to skip when determining the "last commenter" — GitHub Actions
 * workflows post automated comments on nearly every PR/issue, which drowns
 * out real human/review activity. Other bots (CodeRabbit, Codecov, etc.)
 * are intentionally kept since their comments reflect meaningful signal.
 */
const EXCLUDED_LOGINS: ReadonlySet<string> = new Set(['github-actions[bot]']);

/**
 * Maximum comments fetched in a single page when looking for the most recent
 * non-excluded commenter. 100 is GitHub's per-page cap and gives the
 * walk-back enough headroom to skip long runs of `github-actions[bot]`
 * comments on noisy CI repos.
 */
export const LAST_COMMENTER_PAGE_SIZE = 100;

/**
 * Extract the page number of the `rel="last"` entry from a GitHub
 * `Link` response header. Returns `null` when the header is missing or
 * does not advertise a last page (single-page result).
 */
export function parseLastPage(linkHeader: string | undefined): number | null {
  if (!linkHeader) return null;
  const match = linkHeader.match(/<[^>]*[?&]page=(\d+)[^>]*>;\s*rel="last"/);
  return match ? parseInt(match[1], 10) : null;
}

/**
 * Fetch the login of the user who most recently commented on an issue or PR,
 * skipping automated `github-actions[bot]` comments. Works for both issues and
 * PRs — GitHub's issue-comments endpoint covers conversation comments on both
 * (PR review comments are a separate endpoint and are intentionally excluded
 * here).
 *
 * GitHub's per-issue comments endpoint returns comments in ascending
 * chronological order and ignores `sort`/`direction` params, so we fetch the
 * last page (via the `Link: rel="last"` header) and walk backwards.
 *
 * Returns `null` if there are no non-excluded commenters on the last page.
 */
export async function getLastCommenter(
  octokit: Octokit,
  owner: string,
  repo: string,
  issueNumber: number
): Promise<string | null> {
  const firstPage = await octokit.issues.listComments({
    owner,
    repo,
    issue_number: issueNumber,
    per_page: LAST_COMMENTER_PAGE_SIZE,
  });

  const lastPage = parseLastPage(firstPage.headers?.link);
  const comments =
    lastPage != null && lastPage > 1
      ? (
          await octokit.issues.listComments({
            owner,
            repo,
            issue_number: issueNumber,
            per_page: LAST_COMMENTER_PAGE_SIZE,
            page: lastPage,
          })
        ).data
      : firstPage.data;

  for (let i = comments.length - 1; i >= 0; i--) {
    const login = comments[i].user?.login;
    if (!login) continue;
    if (EXCLUDED_LOGINS.has(login)) continue;
    return login;
  }
  return null;
}
