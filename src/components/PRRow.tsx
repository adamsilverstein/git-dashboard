import React from 'react';
import { Box, Text } from 'ink';
import type { PRItem } from '../types.js';
import { ciIcon, reviewIcons } from '../utils/statusIcons.js';
import { timeAgo } from '../utils/timeAgo.js';

interface PRRowProps {
  item: PRItem;
  selected: boolean;
}

export function PRRow({ item, selected }: PRRowProps) {
  const repoLabel = `${item.repo.owner}/${item.repo.name}`;
  const reviews = reviewIcons(item.reviewState);
  const time = timeAgo(item.updatedAt);

  return (
    <Box flexDirection="row" paddingX={1}>
      <Text>{selected ? '▸ ' : '  '}</Text>
      <Text>{ciIcon(item.ciStatus)} </Text>
      <Text color="gray" dimColor>
        [{repoLabel}]{' '}
      </Text>
      <Text color="magenta">#{item.number} </Text>
      <Box flexGrow={1}>
        <Text wrap="truncate">
          {item.draft ? <Text color="gray">[draft] </Text> : null}
          {item.title}
        </Text>
      </Box>
      <Text color="gray"> @{item.author}</Text>
      <Text color="gray"> {time}</Text>
      {reviews ? <Text> {reviews}</Text> : null}
    </Box>
  );
}
