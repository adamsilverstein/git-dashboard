import React from 'react';
import { Box, Text } from 'ink';
import type { FilterMode, SortMode } from '../types.js';

interface StatusBarProps {
  filter: FilterMode;
  sort: SortMode;
  error: string | null;
}

export function StatusBar({ filter, sort, error }: StatusBarProps) {
  return (
    <Box flexDirection="row" justifyContent="space-between" paddingX={1}>
      <Box>
        {error ? (
          <Text color="red">Error: {error}</Text>
        ) : (
          <>
            <Text color="gray">Filter: </Text>
            <Text color={filter === 'all' ? 'gray' : 'yellow'} bold={filter !== 'all'}>
              {filter}
            </Text>
            <Text color="gray"> | Sort: </Text>
            <Text color="gray">{sort}</Text>
          </>
        )}
      </Box>
      <Box>
        <Text color="gray">? help · r refresh · c repos · q quit</Text>
      </Box>
    </Box>
  );
}
