import { Octokit } from '@octokit/rest';
import { execSync } from 'node:child_process';

let cachedToken: string | undefined;

function resolveToken(cliToken?: string): string {
  if (cliToken) return cliToken;
  if (process.env.GITHUB_TOKEN) return process.env.GITHUB_TOKEN;
  try {
    const token = execSync('gh auth token', { encoding: 'utf-8' }).trim();
    if (token) return token;
  } catch {
    // gh CLI not available or not authenticated
  }
  throw new Error(
    'No GitHub token found. Set GITHUB_TOKEN env var, pass --token, or authenticate with `gh auth login`.'
  );
}

export function createClient(cliToken?: string): Octokit {
  if (!cachedToken) {
    cachedToken = resolveToken(cliToken);
  }
  return new Octokit({ auth: cachedToken });
}
