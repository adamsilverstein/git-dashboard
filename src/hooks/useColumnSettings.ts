import { useState, useCallback } from 'react';
import { STORAGE_KEYS } from '../constants.js';
import { DEFAULT_COLUMN_ORDER, DEFAULT_VISIBLE } from '../columns.js';

export interface ColumnSettings {
  visibleColumns: string[];
  columnOrder: string[];
}

function loadSettings(): ColumnSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.COLUMN_SETTINGS);
    if (raw) {
      const parsed = JSON.parse(raw) as ColumnSettings;
      const allIds = new Set(DEFAULT_COLUMN_ORDER);
      const validOrder = parsed.columnOrder.filter((id) => allIds.has(id));
      for (const id of DEFAULT_COLUMN_ORDER) {
        if (!validOrder.includes(id)) validOrder.push(id);
      }
      const validVisible = parsed.visibleColumns.filter((id) => allIds.has(id));
      return { columnOrder: validOrder, visibleColumns: validVisible.length > 0 ? validVisible : [...DEFAULT_VISIBLE] };
    }
  } catch { /* ignore corrupt data */ }
  return { columnOrder: [...DEFAULT_COLUMN_ORDER], visibleColumns: [...DEFAULT_VISIBLE] };
}

function saveSettings(settings: ColumnSettings) {
  try {
    localStorage.setItem(STORAGE_KEYS.COLUMN_SETTINGS, JSON.stringify(settings));
  } catch { /* quota exceeded or unavailable — state still works in-memory */ }
}

export function useColumnSettings() {
  const [settings, setSettings] = useState<ColumnSettings>(loadSettings);

  const toggleColumn = useCallback((id: string) => {
    setSettings((prev) => {
      // Prevent hiding the last visible column
      if (prev.visibleColumns.length === 1 && prev.visibleColumns.includes(id)) {
        return prev;
      }
      const visible = prev.visibleColumns.includes(id)
        ? prev.visibleColumns.filter((c) => c !== id)
        : [...prev.visibleColumns, id];
      const next = { ...prev, visibleColumns: visible };
      saveSettings(next);
      return next;
    });
  }, []);

  const reorderColumns = useCallback((fromIndex: number, toIndex: number) => {
    setSettings((prev) => {
      if (fromIndex === toIndex) return prev;
      const order = [...prev.columnOrder];
      const [moved] = order.splice(fromIndex, 1);
      order.splice(toIndex, 0, moved);
      const next = { ...prev, columnOrder: order };
      saveSettings(next);
      return next;
    });
  }, []);

  const resetColumns = useCallback(() => {
    const next: ColumnSettings = {
      columnOrder: [...DEFAULT_COLUMN_ORDER],
      visibleColumns: [...DEFAULT_VISIBLE],
    };
    saveSettings(next);
    setSettings(next);
  }, []);

  return {
    visibleColumns: settings.visibleColumns,
    columnOrder: settings.columnOrder,
    toggleColumn,
    reorderColumns,
    resetColumns,
  };
}
