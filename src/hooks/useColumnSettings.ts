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
      // Validate: ensure all default columns are represented in order
      const allIds = new Set(DEFAULT_COLUMN_ORDER);
      const validOrder = parsed.columnOrder.filter((id) => allIds.has(id));
      // Add any new columns that weren't in saved settings
      for (const id of DEFAULT_COLUMN_ORDER) {
        if (!validOrder.includes(id)) validOrder.push(id);
      }
      const validVisible = parsed.visibleColumns.filter((id) => allIds.has(id));
      return { columnOrder: validOrder, visibleColumns: validVisible };
    }
  } catch { /* ignore */ }
  return { columnOrder: [...DEFAULT_COLUMN_ORDER], visibleColumns: [...DEFAULT_VISIBLE] };
}

function saveSettings(settings: ColumnSettings) {
  localStorage.setItem(STORAGE_KEYS.COLUMN_SETTINGS, JSON.stringify(settings));
}

export function useColumnSettings() {
  const [settings, setSettings] = useState<ColumnSettings>(loadSettings);

  const toggleColumn = useCallback((id: string) => {
    setSettings((prev) => {
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
