import React from 'react';
import { render, Box, Text } from 'ink';
import { program } from 'commander';
import { createClient } from './github/client.js';
import { App } from './app.js';

program
  .name('git-dashboard')
  .description('Terminal-based GitHub PR dashboard')
  .option('-t, --token <token>', 'GitHub personal access token')
  .option('-c, --config <path>', 'Path to config file')
  .action((opts) => {
    let octokit;
    try {
      octokit = createClient(opts.token);
    } catch (err) {
      render(
        <Box paddingX={1}>
          <Text color="red">
            {err instanceof Error ? err.message : 'Failed to authenticate'}
          </Text>
        </Box>
      );
      process.exit(1);
      return; // unreachable but helps TypeScript narrow the type
    }

    render(<App octokit={octokit} configPath={opts.config} />);
  });

program.parse();
