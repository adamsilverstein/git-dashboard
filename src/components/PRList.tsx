import React from 'react';
import { Box, Text, useStdout } from 'ink';
import type { PRItem } from '../types.js';
import { PRRow } from './PRRow.js';

interface PRListProps {
  items: PRItem[];
  cursorIndex: number;
}

export function PRList({ items, cursorIndex }: PRListProps) {
  const { stdout } = useStdout();
  const termHeight = stdout?.rows ?? 24;
  // Reserve lines for header, status bar, and padding
  const visibleCount = Math.max(1, termHeight - 6);

  // Compute scroll window
  let scrollOffset = 0;
  if (cursorIndex >= visibleCount) {
    scrollOffset = cursorIndex - visibleCount + 1;
  }

  const visibleItems = items.slice(scrollOffset, scrollOffset + visibleCount);

  if (items.length === 0) {
    return (
      <Box paddingX={1} paddingY={1}>
        <Text color="gray">
          No PRs found. Press 'c' to configure repos, or 'r' to refresh.
        </Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column">
      {visibleItems.map((item, i) => (
        <PRRow
          key={item.id}
          item={item}
          selected={scrollOffset + i === cursorIndex}
        />
      ))}
      {items.length > visibleCount && (
        <Box paddingX={1}>
          <Text color="gray">
            {scrollOffset + visibleCount < items.length
              ? `↓ ${items.length - scrollOffset - visibleCount} more`
              : ''}
            {scrollOffset > 0 ? ` ↑ ${scrollOffset} above` : ''}
          </Text>
        </Box>
      )}
    </Box>
  );
}
