import { useState, useCallback } from 'react';
import { loadConfig, saveConfig } from '../config.js';
import type { Config, RepoConfig } from '../types.js';

export function useConfig(configPath?: string) {
  const [config, setConfig] = useState<Config>(() => loadConfig(configPath));

  const persist = useCallback(
    (updated: Config) => {
      setConfig(updated);
      saveConfig(updated, configPath);
    },
    [configPath]
  );

  const addRepo = useCallback(
    (owner: string, name: string) => {
      const exists = config.repos.some(
        (r) => r.owner === owner && r.name === name
      );
      if (exists) return;
      const updated = {
        ...config,
        repos: [...config.repos, { owner, name, enabled: true }],
      };
      persist(updated);
    },
    [config, persist]
  );

  const removeRepo = useCallback(
    (index: number) => {
      const updated = {
        ...config,
        repos: config.repos.filter((_, i) => i !== index),
      };
      persist(updated);
    },
    [config, persist]
  );

  const toggleRepo = useCallback(
    (index: number) => {
      const updated = {
        ...config,
        repos: config.repos.map((r, i) =>
          i === index ? { ...r, enabled: !r.enabled } : r
        ),
      };
      persist(updated);
    },
    [config, persist]
  );

  const enabledRepos = config.repos.filter((r) => r.enabled);

  return { config, enabledRepos, addRepo, removeRepo, toggleRepo };
}
