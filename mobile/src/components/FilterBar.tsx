import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import type { FilterMode, SortMode } from '../../shared/types.js';

const FILTERS: { key: FilterMode; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'failing', label: 'Failing' },
  { key: 'needs-review', label: 'Needs Review' },
  { key: 'review-requested', label: 'Requested' },
  { key: 'new-activity', label: 'New' },
  { key: 'merge-ready', label: 'Ready' },
  { key: 'stale', label: 'Stale' },
];

const SORTS: { key: SortMode; label: string }[] = [
  { key: 'updated', label: 'Updated' },
  { key: 'created', label: 'Created' },
  { key: 'repo', label: 'Repo' },
  { key: 'status', label: 'Status' },
  { key: 'author', label: 'Author' },
  { key: 'reviews', label: 'Reviews' },
];

interface FilterBarProps {
  activeFilter: FilterMode;
  activeSort: SortMode;
  onFilterChange: (filter: FilterMode) => void;
  onSortChange: (sort: SortMode) => void;
}

export function FilterBar({ activeFilter, activeSort, onFilterChange, onSortChange }: FilterBarProps) {
  return (
    <View style={styles.container}>
      {/* Filter chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.row}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[styles.chip, f.key === activeFilter && styles.chipActive]}
            onPress={() => onFilterChange(f.key)}
          >
            <Text style={[styles.chipText, f.key === activeFilter && styles.chipTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Sort chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.row}>
        <Text style={styles.sortLabel}>Sort:</Text>
        {SORTS.map((s) => (
          <TouchableOpacity
            key={s.key}
            style={[styles.sortChip, s.key === activeSort && styles.sortChipActive]}
            onPress={() => onSortChange(s.key)}
          >
            <Text style={[styles.sortChipText, s.key === activeSort && styles.sortChipTextActive]}>
              {s.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#161b22',
    borderBottomWidth: 1,
    borderBottomColor: '#21262d',
    paddingVertical: 8,
  },
  row: {
    paddingHorizontal: 12,
    marginBottom: 4,
  },
  chip: {
    backgroundColor: '#21262d',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 6,
    borderWidth: 1,
    borderColor: '#30363d',
  },
  chipActive: {
    backgroundColor: '#388bfd26',
    borderColor: '#58a6ff',
  },
  chipText: {
    fontSize: 13,
    color: '#7d8590',
    fontWeight: '500',
  },
  chipTextActive: {
    color: '#58a6ff',
  },
  sortLabel: {
    fontSize: 12,
    color: '#484f58',
    alignSelf: 'center',
    marginRight: 6,
  },
  sortChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 4,
    borderRadius: 4,
  },
  sortChipActive: {
    backgroundColor: '#30363d',
  },
  sortChipText: {
    fontSize: 12,
    color: '#484f58',
  },
  sortChipTextActive: {
    color: '#e6edf3',
  },
});
