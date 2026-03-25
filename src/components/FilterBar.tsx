import React from 'react';
import { Box, Text } from 'ink';
import type { FilterMode } from '../types.js';

const FILTERS: FilterMode[] = ['all', 'failing', 'needs-review'];

interface FilterBarProps {
  active: FilterMode;
}

export function FilterBar({ active }: FilterBarProps) {
  if (active === 'all') return null;

  return (
    <Box paddingX={1}>
      <Text color="yellow">
        Showing: {active === 'failing' ? 'Failing CI only' : 'Needs review only'}
      </Text>
      <Text color="gray"> (press f to cycle)</Text>
    </Box>
  );
}
