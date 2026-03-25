import React from 'react';
import { Box, Text } from 'ink';

const SHORTCUTS = [
  ['j / ↓', 'Move down'],
  ['k / ↑', 'Move up'],
  ['Enter', 'Open PR in browser'],
  ['f', 'Cycle filter (all / failing / needs-review)'],
  ['s', 'Cycle sort (updated / created / repo / status)'],
  ['r', 'Refresh data'],
  ['c', 'Configure repos'],
  ['?', 'Toggle this help'],
  ['q', 'Quit'],
];

export function HelpOverlay() {
  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor="cyan"
      paddingX={2}
      paddingY={1}
      marginX={2}
      marginY={1}
    >
      <Text bold color="cyan">
        Keyboard Shortcuts
      </Text>
      <Text> </Text>
      {SHORTCUTS.map(([key, desc]) => (
        <Box key={key} flexDirection="row">
          <Box width={16}>
            <Text bold color="yellow">
              {key}
            </Text>
          </Box>
          <Text>{desc}</Text>
        </Box>
      ))}
      <Text> </Text>
      <Text color="gray">Press ? or Esc to close</Text>
    </Box>
  );
}
