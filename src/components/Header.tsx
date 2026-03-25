import React from 'react';
import { Box, Text } from 'ink';
import Spinner from 'ink-spinner';

interface HeaderProps {
  loading: boolean;
  lastRefresh: Date | null;
  repoCount: number;
  itemCount: number;
}

export function Header({ loading, lastRefresh, repoCount, itemCount }: HeaderProps) {
  return (
    <Box flexDirection="row" justifyContent="space-between" paddingX={1}>
      <Box>
        <Text bold color="cyan">
          Git Dashboard
        </Text>
        <Text color="gray">
          {' '}
          — {repoCount} repo{repoCount !== 1 ? 's' : ''}, {itemCount} PR
          {itemCount !== 1 ? 's' : ''}
        </Text>
      </Box>
      <Box>
        {loading ? (
          <Text color="yellow">
            <Spinner type="dots" /> Refreshing…
          </Text>
        ) : lastRefresh ? (
          <Text color="gray">
            Last refresh: {lastRefresh.toLocaleTimeString()}
          </Text>
        ) : null}
      </Box>
    </Box>
  );
}
