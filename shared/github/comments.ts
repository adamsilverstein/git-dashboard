import type { Octokit } from '@octokit/rest';

/**
 * Logins to skip when determining the "last commenter" — GitHub Actions
 * workflows post automated comments on nearly every PR/issue, which drowns
 * out real human/review activity. Other bots (CodeRabbit, Codecov, etc.)
 * are intentionally kept since their comments reflect meaningful signal.
 */
const EXCLUDED_LOGINS: ReadonlySet<string> = new Set(['github-actions[bot]']);

/**
 * Fetch the login of the user who most recently commented on an issue or PR,
 * skipping automated `github-actions[bot]` comments. Works for both issues and
 * PRs — GitHub's issue-comments endpoint covers conversation comments on both
 * (PR review comments are a separate endpoint and are intentionally excluded
 * here).
 *
 * Returns `null` if there are no non-excluded commenters among the most recent
 * 100 comments.
 */
export async function getLastCommenter(
  octokit: Octokit,
  owner: string,
  repo: string,
  issueNumber: number
): Promise<string | null> {
  const { data } = await octokit.issues.listComments({
    owner,
    repo,
    issue_number: issueNumber,
    per_page: 100,
    sort: 'created',
    direction: 'desc',
  });
  for (const comment of data) {
    const login = comment.user?.login;
    if (!login) continue;
    if (EXCLUDED_LOGINS.has(login)) continue;
    return login;
  }
  return null;
}
