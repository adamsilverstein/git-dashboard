import chalk from 'chalk';
import type { CIStatus, ReviewState } from '../types.js';

export function ciIcon(status: CIStatus): string {
  switch (status) {
    case 'success':
      return chalk.green('●');
    case 'failure':
      return chalk.red('●');
    case 'pending':
      return chalk.yellow('●');
    case 'mixed':
      return chalk.yellow('◐');
    case 'none':
      return chalk.gray('○');
  }
}

export function reviewIcons(state: ReviewState): string {
  const parts: string[] = [];
  if (state.approvals > 0) {
    parts.push(chalk.green(`✓${state.approvals}`));
  }
  if (state.changesRequested > 0) {
    parts.push(chalk.red('✗'));
  }
  if (state.commentCount > 0) {
    parts.push(chalk.cyan(`💬${state.commentCount}`));
  }
  return parts.join(' ');
}
