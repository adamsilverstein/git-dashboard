import type { DashboardItem, MilestoneInfo } from '../types.js';

export interface MilestoneGroup {
  /** null represents the "No Milestone" group */
  milestone: MilestoneInfo | null;
  items: DashboardItem[];
}

/**
 * Group a list of dashboard items by milestone.
 * Issues are grouped by their milestone; PRs and issues without milestones
 * fall into a "No Milestone" group placed at the end.
 */
export function groupByMilestone(items: DashboardItem[]): MilestoneGroup[] {
  const milestoneMap = new Map<string, { info: MilestoneInfo; items: DashboardItem[] }>();
  const noMilestone: DashboardItem[] = [];

  for (const item of items) {
    const ms = item.kind === 'issue' ? item.milestone : null;
    if (ms) {
      const existing = milestoneMap.get(ms.title);
      if (existing) {
        existing.items.push(item);
        // Keep the most recent milestone info (highest counts)
        if (ms.openIssues + ms.closedIssues > existing.info.openIssues + existing.info.closedIssues) {
          existing.info = ms;
        }
      } else {
        milestoneMap.set(ms.title, { info: ms, items: [item] });
      }
    } else {
      noMilestone.push(item);
    }
  }

  // Sort milestone groups: those with due dates first (earliest first), then those without
  const groups: MilestoneGroup[] = [...milestoneMap.values()]
    .sort((a, b) => {
      const aDue = a.info.dueOn;
      const bDue = b.info.dueOn;
      if (aDue && bDue) return new Date(aDue).getTime() - new Date(bDue).getTime();
      if (aDue) return -1;
      if (bDue) return 1;
      return a.info.title.localeCompare(b.info.title);
    })
    .map(({ info, items: groupItems }) => ({ milestone: info, items: groupItems }));

  // Add the "No Milestone" group at the end
  if (noMilestone.length > 0) {
    groups.push({ milestone: null, items: noMilestone });
  }

  return groups;
}
