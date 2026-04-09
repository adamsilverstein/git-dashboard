import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { PRDetail, CheckRun, Reviewer, TimelineEvent } from '../../shared/types.js';
import { getPRDetails } from '../../shared/github/details.js';
import { timeAgo } from '../../shared/utils/timeAgo.js';
import { useApp } from '../context/AppContext';
import type { DashboardStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<DashboardStackParamList, 'PRDetail'>;

const CHECK_ICONS: Record<string, { symbol: string; color: string }> = {
  success: { symbol: '✓', color: '#3fb950' },
  failure: { symbol: '✗', color: '#f85149' },
  neutral: { symbol: '—', color: '#7d8590' },
  skipped: { symbol: '⊘', color: '#7d8590' },
  cancelled: { symbol: '⊘', color: '#7d8590' },
  timed_out: { symbol: '⏱', color: '#f85149' },
  action_required: { symbol: '!', color: '#d29922' },
};

const REVIEW_COLORS: Record<string, string> = {
  APPROVED: '#3fb950',
  CHANGES_REQUESTED: '#f85149',
  COMMENTED: '#d29922',
  DISMISSED: '#7d8590',
};

function CheckRunRow({ check }: { check: CheckRun }) {
  const icon = CHECK_ICONS[check.conclusion ?? ''] ?? { symbol: '●', color: '#d29922' };
  const isInProgress = check.status !== 'completed';

  return (
    <View style={styles.checkRow}>
      {isInProgress ? (
        <ActivityIndicator size="small" color="#d29922" style={styles.checkSpinner} />
      ) : (
        <Text style={[styles.checkIcon, { color: icon.color }]}>{icon.symbol}</Text>
      )}
      <Text style={styles.checkName} numberOfLines={1}>{check.name}</Text>
    </View>
  );
}

function ReviewerRow({ reviewer }: { reviewer: Reviewer }) {
  const color = REVIEW_COLORS[reviewer.state] ?? '#7d8590';
  const label = reviewer.state.replace('_', ' ').toLowerCase();
  return (
    <View style={styles.reviewerRow}>
      <Text style={styles.reviewerLogin}>{reviewer.login}</Text>
      <Text style={[styles.reviewerState, { color }]}>{label}</Text>
    </View>
  );
}

function TimelineEventRow({ event }: { event: TimelineEvent }) {
  const descriptions: Record<string, string> = {
    commented: `${event.actor} commented`,
    reviewed: `${event.actor} ${event.reviewState?.toLowerCase() ?? 'reviewed'}`,
    committed: `${event.actor} committed ${event.commitSha ?? ''}`,
    'force-pushed': `${event.actor} force-pushed`,
    merged: `${event.actor} merged`,
    closed: `${event.actor} closed`,
    reopened: `${event.actor} reopened`,
    renamed: `${event.actor} renamed`,
    labeled: `${event.actor} added ${event.label ?? ''}`,
    unlabeled: `${event.actor} removed ${event.label ?? ''}`,
    assigned: `${event.actor} assigned ${event.assignee ?? ''}`,
    unassigned: `${event.actor} unassigned ${event.assignee ?? ''}`,
    review_requested: `${event.actor} requested review from ${event.requestedReviewer ?? ''}`,
    ready_for_review: `${event.actor} marked ready for review`,
    convert_to_draft: `${event.actor} converted to draft`,
    head_ref_deleted: `Branch deleted`,
  };

  return (
    <View style={styles.timelineRow}>
      <Text style={styles.timelineDesc}>
        {descriptions[event.type] ?? `${event.actor} ${event.type}`}
      </Text>
      <Text style={styles.timelineTime}>{timeAgo(event.createdAt)}</Text>
    </View>
  );
}

export function PRDetailScreen({ route, navigation }: Props) {
  const { octokit } = useApp();
  const { item } = route.params;
  const [detail, setDetail] = useState<PRDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    navigation.setOptions({ title: `#${item.number} ${item.title}` });
  }, [navigation, item]);

  useEffect(() => {
    if (!octokit) return;
    setLoading(true);
    setError(null);
    getPRDetails(octokit, item)
      .then(setDetail)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load details'))
      .finally(() => setLoading(false));
  }, [octokit, item]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#58a6ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!detail) return null;

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.section}>
        <Text style={styles.prTitle}>{item.title}</Text>
        <Text style={styles.branchInfo}>
          {detail.headBranch} → {detail.baseBranch}
        </Text>
        <View style={styles.statsRow}>
          <Text style={styles.additions}>+{detail.additions}</Text>
          <Text style={styles.deletions}>-{detail.deletions}</Text>
          <Text style={styles.statLabel}>{detail.changedFiles} files</Text>
        </View>
      </View>

      {/* Open in GitHub */}
      <TouchableOpacity
        style={styles.openButton}
        onPress={() => Linking.openURL(item.url)}
      >
        <Text style={styles.openButtonText}>Open in GitHub</Text>
      </TouchableOpacity>

      {/* Checks */}
      {detail.checkRuns.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Checks ({detail.checkRuns.length})
          </Text>
          {detail.checkRuns.map((check, i) => (
            <CheckRunRow key={`${check.name}-${i}`} check={check} />
          ))}
        </View>
      )}

      {/* Reviewers */}
      {detail.reviewers.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Reviewers ({detail.reviewers.length})
          </Text>
          {detail.reviewers.map((r) => (
            <ReviewerRow key={r.login} reviewer={r} />
          ))}
        </View>
      )}

      {/* Timeline */}
      {detail.timeline.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Timeline ({detail.timeline.length})
          </Text>
          {detail.timeline.map((ev) => (
            <TimelineEventRow key={ev.id} event={ev} />
          ))}
        </View>
      )}

      {/* Body */}
      {detail.body ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.bodyText}>{detail.body}</Text>
        </View>
      ) : null}

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d1117',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0d1117',
  },
  errorText: {
    color: '#f85149',
    fontSize: 16,
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#21262d',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#7d8590',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  prTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#e6edf3',
    marginBottom: 6,
  },
  branchInfo: {
    fontSize: 13,
    color: '#58a6ff',
    fontFamily: 'Menlo',
    marginBottom: 10,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  additions: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3fb950',
  },
  deletions: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f85149',
  },
  statLabel: {
    fontSize: 14,
    color: '#7d8590',
  },
  openButton: {
    marginHorizontal: 16,
    marginVertical: 10,
    backgroundColor: '#21262d',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#30363d',
  },
  openButtonText: {
    color: '#58a6ff',
    fontSize: 15,
    fontWeight: '600',
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  checkIcon: {
    fontSize: 16,
    fontWeight: '700',
    width: 24,
    textAlign: 'center',
  },
  checkSpinner: {
    width: 24,
  },
  checkName: {
    fontSize: 13,
    color: '#e6edf3',
    flex: 1,
    marginLeft: 4,
  },
  reviewerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  reviewerLogin: {
    fontSize: 14,
    color: '#e6edf3',
    fontWeight: '500',
  },
  reviewerState: {
    fontSize: 13,
  },
  timelineRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    alignItems: 'flex-start',
  },
  timelineDesc: {
    fontSize: 13,
    color: '#e6edf3',
    flex: 1,
    marginRight: 8,
  },
  timelineTime: {
    fontSize: 12,
    color: '#484f58',
  },
  bodyText: {
    fontSize: 14,
    color: '#e6edf3',
    lineHeight: 22,
  },
  bottomPadding: {
    height: 40,
  },
});
