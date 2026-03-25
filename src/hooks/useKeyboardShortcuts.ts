import { useInput } from 'ink';
import type { ViewMode } from '../types.js';

interface ShortcutActions {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  moveCursor: (delta: number) => void;
  openSelected: () => void;
  cycleFilter: () => void;
  cycleSort: () => void;
  refresh: () => void;
  exit: () => void;
}

export function useKeyboardShortcuts(actions: ShortcutActions) {
  useInput((input, key) => {
    const { viewMode, setViewMode } = actions;

    // Help overlay: only ? and Escape close it
    if (viewMode === 'help') {
      if (input === '?' || key.escape) setViewMode('list');
      return;
    }

    // Repo manager: Escape returns to list
    if (viewMode === 'repos') {
      if (key.escape) setViewMode('list');
      return;
    }

    // Main list shortcuts
    if (input === '?') {
      setViewMode('help');
      return;
    }
    if (input === 'q') {
      actions.exit();
      return;
    }
    if (input === 'j' || key.downArrow) {
      actions.moveCursor(1);
      return;
    }
    if (input === 'k' || key.upArrow) {
      actions.moveCursor(-1);
      return;
    }
    if (key.return) {
      actions.openSelected();
      return;
    }
    if (input === 'f') {
      actions.cycleFilter();
      return;
    }
    if (input === 's') {
      actions.cycleSort();
      return;
    }
    if (input === 'r') {
      actions.refresh();
      return;
    }
    if (input === 'c') {
      setViewMode('repos');
      return;
    }
  });
}
