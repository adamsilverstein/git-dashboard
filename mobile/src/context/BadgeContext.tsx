import React, { createContext, useContext, useState, useCallback } from 'react';

interface BadgeContextValue {
  unseenCount: number;
  setUnseenCount: (count: number) => void;
}

const BadgeContext = createContext<BadgeContextValue>({
  unseenCount: 0,
  setUnseenCount: () => {},
});

export function useBadge() {
  return useContext(BadgeContext);
}

export function BadgeProvider({ children }: { children: React.ReactNode }) {
  const [unseenCount, setUnseenCountRaw] = useState(0);
  const setUnseenCount = useCallback((count: number) => setUnseenCountRaw(count), []);

  return (
    <BadgeContext.Provider value={{ unseenCount, setUnseenCount }}>
      {children}
    </BadgeContext.Provider>
  );
}
