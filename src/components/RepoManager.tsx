import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import TextInput from 'ink-text-input';
import type { RepoConfig } from '../types.js';

interface RepoManagerProps {
  repos: RepoConfig[];
  onToggle: (index: number) => void;
  onRemove: (index: number) => void;
  onAdd: (owner: string, name: string) => void;
  onExit: () => void;
}

export function RepoManager({
  repos,
  onToggle,
  onRemove,
  onAdd,
  onExit,
}: RepoManagerProps) {
  const [cursor, setCursor] = useState(0);
  const [adding, setAdding] = useState(false);
  const [input, setInput] = useState('');

  useInput(
    (char, key) => {
      if (adding) {
        if (key.escape) {
          setAdding(false);
          setInput('');
        }
        return;
      }

      if (key.escape) {
        onExit();
        return;
      }
      if (char === 'j' || key.downArrow) {
        setCursor((c) => Math.min(c + 1, repos.length - 1));
        return;
      }
      if (char === 'k' || key.upArrow) {
        setCursor((c) => Math.max(c - 1, 0));
        return;
      }
      if (char === ' ' && repos.length > 0) {
        onToggle(cursor);
        return;
      }
      if (char === 'd' && repos.length > 0) {
        onRemove(cursor);
        if (cursor >= repos.length - 1) setCursor(Math.max(0, repos.length - 2));
        return;
      }
      if (char === 'a') {
        setAdding(true);
        return;
      }
    },
    { isActive: true }
  );

  const handleSubmit = (value: string) => {
    const trimmed = value.trim();
    const parts = trimmed.split('/');
    if (parts.length === 2 && parts[0] && parts[1]) {
      onAdd(parts[0], parts[1]);
    }
    setAdding(false);
    setInput('');
  };

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
        Repository Manager
      </Text>
      <Text> </Text>

      {repos.length === 0 ? (
        <Text color="gray">No repos configured. Press 'a' to add one.</Text>
      ) : (
        repos.map((repo, i) => (
          <Box key={`${repo.owner}/${repo.name}`} flexDirection="row">
            <Text>{i === cursor ? '▸ ' : '  '}</Text>
            <Text color={repo.enabled ? 'green' : 'gray'}>
              {repo.enabled ? '[✓]' : '[ ]'}{' '}
            </Text>
            <Text color={repo.enabled ? 'white' : 'gray'}>
              {repo.owner}/{repo.name}
            </Text>
          </Box>
        ))
      )}

      <Text> </Text>

      {adding ? (
        <Box>
          <Text color="yellow">Add repo (owner/name): </Text>
          <TextInput value={input} onChange={setInput} onSubmit={handleSubmit} />
        </Box>
      ) : (
        <Text color="gray">
          Space: toggle · a: add · d: delete · Esc: back
        </Text>
      )}
    </Box>
  );
}
