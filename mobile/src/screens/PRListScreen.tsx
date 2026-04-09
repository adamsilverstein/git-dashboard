import React, { useCallback, useMemo } from 'react';
import { View, FlatList, Text, StyleSheet, RefreshControl, Linking } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { DashboardItem, OwnershipFilter } from '../../shared/types.js';
import { useGithubData } from '../../shared/hooks/useGithubData.js';
import { useFilteredItems } from '../../shared/hooks/useFilteredItems.js';
import { useConfig } from '../../shared/hooks/useConfig.js';
import { useLastSeen } from '../../shared/hooks/useLastSeen.js';
import { useAutoRefresh } from '../../shared/hooks/useAutoRefresh.js';
import { asyncStorageAdapter } from '../storage/asyncStorageAdapter';
import { useApp } from '../context/AppContext';
import { PRListItem } from '../components/PRListItem';
import type { DashboardStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<DashboardStackParamList, 'PRList'>;

export function PRListScreen({ navigation }: Props) {
  const { octokit, username, rateLimit } = useApp();
  const { config, enabledRepos } = useConfig(asyncStorageAdapter);
  const { markSeen, isUnseen } = useLastSeen(asyncStorageAdapter);
  const ownershipFilter: OwnershipFilter = 'created';

  const { items, loading, error, lastRefresh, refresh } = useGithubData(
    octokit,
    enabledRepos,
    config.defaults.maxPrsPerRepo,
    ownershipFilter !== 'everyone' ? username : null,
    username,
    ownershipFilter
  );

  const {
    filtered, filter,
  } = useFilteredItems({
    items,
    defaultFilter: config.defaults.filter,
    defaultSort: config.defaults.sort,
    isUnseen,
    staleDays: config.defaults.staleDays,
    storage: asyncStorageAdapter,
  });

  const { reset: resetAutoRefresh } = useAutoRefresh({
    intervalSeconds: config.defaults.autoRefreshInterval,
    paused: false,
    onRefresh: refresh,
  });

  const handleRefresh = useCallback(() => {
    refresh();
    resetAutoRefresh();
  }, [refresh, resetAutoRefresh]);

  const handlePress = useCallback((item: DashboardItem) => {
    markSeen(item);
    if (item.kind === 'pr') {
      navigation.navigate('PRDetail', { item });
    } else {
      Linking.openURL(item.url);
    }
  }, [markSeen, navigation]);

  const handleLongPress = useCallback((item: DashboardItem) => {
    markSeen(item);
    Linking.openURL(item.url);
  }, [markSeen]);

  const renderItem = useCallback(({ item }: { item: DashboardItem }) => (
    <PRListItem
      item={item}
      isUnseen={isUnseen(item)}
      onPress={() => handlePress(item)}
      onLongPress={() => handleLongPress(item)}
    />
  ), [isUnseen, handlePress, handleLongPress]);

  const keyExtractor = useCallback((item: DashboardItem) => `${item.kind}-${item.id}`, []);

  const headerInfo = useMemo(() => {
    const parts: string[] = [];
    if (enabledRepos.length > 0) parts.push(`${enabledRepos.length} repos`);
    parts.push(`${filtered.length} items`);
    if (filter !== 'all') parts.push(`filter: ${filter}`);
    if (rateLimit) parts.push(`API: ${rateLimit.remaining}/${rateLimit.limit}`);
    return parts.join(' · ');
  }, [enabledRepos.length, filtered.length, filter, rateLimit]);

  return (
    <View style={styles.container}>
      <Text style={styles.headerInfo}>{headerInfo}</Text>

      {error && <Text style={styles.error}>{error}</Text>}

      {enabledRepos.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No repositories configured</Text>
          <Text style={styles.emptySubtitle}>
            Go to Settings to add repositories to monitor.
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={handleRefresh}
              tintColor="#58a6ff"
            />
          }
          ListEmptyComponent={
            !loading ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyTitle}>No items found</Text>
                <Text style={styles.emptySubtitle}>
                  Pull to refresh or adjust your filters.
                </Text>
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d1117',
  },
  headerInfo: {
    fontSize: 12,
    color: '#7d8590',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#161b22',
    borderBottomWidth: 1,
    borderBottomColor: '#21262d',
  },
  error: {
    color: '#f85149',
    fontSize: 13,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f8514920',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#e6edf3',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#7d8590',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});
