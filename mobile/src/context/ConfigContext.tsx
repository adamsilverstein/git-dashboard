import React, { createContext, useContext } from 'react';
import { useConfig } from '../../../shared/hooks/useConfig.js';
import { asyncStorageAdapter } from '../storage/asyncStorageAdapter';

type ConfigContextValue = ReturnType<typeof useConfig>;

const ConfigContext = createContext<ConfigContextValue | null>(null);

export function useConfigContext(): ConfigContextValue {
  const ctx = useContext(ConfigContext);
  if (!ctx) throw new Error('useConfigContext must be used within ConfigProvider');
  return ctx;
}

export function ConfigProvider({ children }: { children: React.ReactNode }) {
  const config = useConfig(asyncStorageAdapter);
  return <ConfigContext.Provider value={config}>{children}</ConfigContext.Provider>;
}
