import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import type { Config } from './types.js';

const DEFAULT_CONFIG: Config = {
  repos: [],
  defaults: {
    sort: 'updated',
    filter: 'all',
    maxPrsPerRepo: 10,
  },
};

export function getConfigPath(customPath?: string): string {
  return customPath ?? join(homedir(), '.git-dashboard.json');
}

export function loadConfig(customPath?: string): Config {
  const path = getConfigPath(customPath);
  if (!existsSync(path)) {
    return { ...DEFAULT_CONFIG, repos: [] };
  }
  try {
    const raw = readFileSync(path, 'utf-8');
    const parsed = JSON.parse(raw);
    return {
      repos: parsed.repos ?? [],
      defaults: { ...DEFAULT_CONFIG.defaults, ...parsed.defaults },
    };
  } catch {
    return { ...DEFAULT_CONFIG, repos: [] };
  }
}

export function saveConfig(config: Config, customPath?: string): void {
  const path = getConfigPath(customPath);
  writeFileSync(path, JSON.stringify(config, null, 2) + '\n', 'utf-8');
}
