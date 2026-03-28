import React, { useRef, useEffect, useMemo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { DashboardItem, SortMode, SortDirection } from '../types.js';
import { DEFAULT_COLUMNS } from '../columns.js';
import { PRRow } from './PRRow.js';
import { SortableHeader } from './SortableHeader.js';
import { ColumnSettingsDropdown } from './ColumnSettingsDropdown.js';
import { isStale } from '../utils/staleness.js';

const ROW_HEIGHT_ESTIMATE = 37;

interface PRTableProps {
  items: DashboardItem[];
  cursorIndex: number;
  sort: SortMode;
  sortDirection: SortDirection;
  onSort: (key: SortMode) => void;
  onPreview: (item: DashboardItem) => void;
  isUnseen: (item: DashboardItem) => boolean;
  onOpen: (item: DashboardItem) => void;
  onHideRepo?: (owner: string, name: string) => void;
  staleDays: number;
  visibleColumns: string[];
  columnOrder: string[];
  onToggleColumn: (id: string) => void;
  onReorderColumns: (fromIndex: number, toIndex: number) => void;
  onResetColumns: () => void;
}

export function PRTable({ items, cursorIndex, sort, sortDirection, onSort, onPreview, isUnseen, onOpen, onHideRepo, staleDays, visibleColumns, columnOrder, onToggleColumn, onReorderColumns, onResetColumns }: PRTableProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => scrollContainerRef.current,
    estimateSize: () => ROW_HEIGHT_ESTIMATE,
    overscan: 10,
  });

  // Scroll to keep the selected row visible when cursor moves
  useEffect(() => {
    if (items.length > 0) {
      virtualizer.scrollToIndex(cursorIndex, { align: 'auto' });
    }
  }, [cursorIndex, virtualizer, items.length]);

  const colMap = useMemo(() => new Map(DEFAULT_COLUMNS.map((c) => [c.id, c])), []);

  const orderedVisibleColumns = useMemo(
    () => columnOrder.filter((id) => visibleColumns.includes(id)).map((id) => colMap.get(id)!).filter(Boolean),
    [columnOrder, visibleColumns, colMap]
  );

  if (items.length === 0) {
    return (
      <div className="empty-state">
        No items found. Press <kbd>c</kbd> to configure repos, or <kbd>r</kbd> to
        refresh.
      </div>
    );
  }

  const headerProps = {
    activeSort: sort,
    sortDirection,
    onSort,
  };

  const virtualRows = virtualizer.getVirtualItems();
  const totalHeight = virtualizer.getTotalSize();

  const paddingTop = virtualRows.length > 0 ? virtualRows[0].start : 0;
  const paddingBottom = virtualRows.length > 0 ? totalHeight - virtualRows[virtualRows.length - 1].end : 0;

  // +1 for the settings column
  const colSpan = orderedVisibleColumns.length + 1;

  return (
    <div className="table-container" ref={scrollContainerRef}>
      <table className="pr-table" aria-label="Pull requests and issues">
        <thead>
          <tr>
            {orderedVisibleColumns.map((col) =>
              col.sortKey ? (
                <SortableHeader key={col.id} label={col.label} sortKey={col.sortKey} className={col.className} {...headerProps} />
              ) : (
                <th key={col.id} className={col.className} scope="col">{col.label}</th>
              )
            )}
            <th className="col-settings" scope="col">
              <ColumnSettingsDropdown
                visibleColumns={visibleColumns}
                columnOrder={columnOrder}
                onToggleColumn={onToggleColumn}
                onReorderColumns={onReorderColumns}
                onReset={onResetColumns}
              />
            </th>
          </tr>
        </thead>
        <tbody>
          {paddingTop > 0 && (
            <tr><td style={{ height: paddingTop, padding: 0, border: 'none' }} colSpan={colSpan} /></tr>
          )}
          {virtualRows.map((virtualRow) => {
            const item = items[virtualRow.index];
            return (
              <PRRow
                key={`${item.kind}-${item.id}`}
                item={item}
                selected={virtualRow.index === cursorIndex}
                unseen={isUnseen(item)}
                stale={isStale(item, staleDays)}
                onPreview={onPreview}
                onOpen={onOpen}
                onHideRepo={onHideRepo}
                visibleColumns={orderedVisibleColumns.map((c) => c.id)}
              />
            );
          })}
          {paddingBottom > 0 && (
            <tr><td style={{ height: paddingBottom, padding: 0, border: 'none' }} colSpan={colSpan} /></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
