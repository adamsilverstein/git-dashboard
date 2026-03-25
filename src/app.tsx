import React, { useState, useCallback, useMemo } from 'react';
import { Box, useApp } from 'ink';
import type { ViewMode, FilterMode, SortMode, PRItem } from './types.js';
import type { Octokit } from '@octokit/rest';
import { useConfig } from './hooks/useConfig.js';
import { useGithubData } from './hooks/useGithubData.js';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts.js';
import { Header } from './components/Header.js';
import { PRList } from './components/PRList.js';
import { StatusBar } from './components/StatusBar.js';
import { HelpOverlay } from './components/HelpOverlay.js';
import { FilterBar } from './components/FilterBar.js';
import { RepoManager } from './components/RepoManager.js';
import { openUrl } from './utils/openUrl.js';

const FILTER_CYCLE: FilterMode[] = ['all', 'failing', 'needs-review'];
const SORT_CYCLE: SortMode[] = ['updated', 'created', 'repo', 'status'];

interface AppProps {
  octokit: Octokit;
  configPath?: string;
}

export function App({ octokit, configPath }: AppProps) {
  const { exit } = useApp();
  const { config, enabledRepos, addRepo, removeRepo, toggleRepo } =
    useConfig(configPath);

  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [cursorIndex, setCursorIndex] = useState(0);
  const [filter, setFilter] = useState<FilterMode>(config.defaults.filter);
  const [sort, setSort] = useState<SortMode>(config.defaults.sort);

  const { items, loading, error, lastRefresh, refresh } = useGithubData(
    octokit,
    enabledRepos,
    config.defaults.maxPrsPerRepo
  );

  // Filter items
  const filtered = useMemo(() => {
    let result = [...items];

    if (filter === 'failing') {
      result = result.filter((pr) => pr.ciStatus === 'failure');
    } else if (filter === 'needs-review') {
      result = result.filter(
        (pr) =>
          pr.reviewState.changesRequested > 0 || pr.reviewState.commentCount > 0
      );
    }

    // Sort
    result.sort((a, b) => {
      switch (sort) {
        case 'updated':
          return (
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
        case 'created':
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case 'repo': {
          const repoA = `${a.repo.owner}/${a.repo.name}`;
          const repoB = `${b.repo.owner}/${b.repo.name}`;
          return repoA.localeCompare(repoB);
        }
        case 'status': {
          const priority: Record<string, number> = {
            failure: 0,
            pending: 1,
            mixed: 2,
            none: 3,
            success: 4,
          };
          return (priority[a.ciStatus] ?? 3) - (priority[b.ciStatus] ?? 3);
        }
        default:
          return 0;
      }
    });

    return result;
  }, [items, filter, sort]);

  const moveCursor = useCallback(
    (delta: number) => {
      setCursorIndex((prev) => {
        const next = prev + delta;
        if (next < 0) return 0;
        if (next >= filtered.length) return Math.max(0, filtered.length - 1);
        return next;
      });
    },
    [filtered.length]
  );

  const openSelected = useCallback(() => {
    const item = filtered[cursorIndex];
    if (item) {
      openUrl(item.url);
    }
  }, [filtered, cursorIndex]);

  const cycleFilter = useCallback(() => {
    setFilter((prev) => {
      const idx = FILTER_CYCLE.indexOf(prev);
      return FILTER_CYCLE[(idx + 1) % FILTER_CYCLE.length];
    });
    setCursorIndex(0);
  }, []);

  const cycleSort = useCallback(() => {
    setSort((prev) => {
      const idx = SORT_CYCLE.indexOf(prev);
      return SORT_CYCLE[(idx + 1) % SORT_CYCLE.length];
    });
  }, []);

  useKeyboardShortcuts({
    viewMode,
    setViewMode,
    moveCursor,
    openSelected,
    cycleFilter,
    cycleSort,
    refresh,
    exit,
  });

  return (
    <Box flexDirection="column">
      <Header
        loading={loading}
        lastRefresh={lastRefresh}
        repoCount={enabledRepos.length}
        itemCount={filtered.length}
      />

      {viewMode === 'help' ? (
        <HelpOverlay />
      ) : viewMode === 'repos' ? (
        <RepoManager
          repos={config.repos}
          onToggle={toggleRepo}
          onRemove={removeRepo}
          onAdd={addRepo}
          onExit={() => setViewMode('list')}
        />
      ) : (
        <>
          <FilterBar active={filter} />
          <PRList items={filtered} cursorIndex={cursorIndex} />
        </>
      )}

      <StatusBar filter={filter} sort={sort} error={error} />
    </Box>
  );
}
