import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import cn from 'bem-cn-lite';

import {useDebouncedValue} from '../../helpers/useDebouncedValue';
import type {QueryStatisticsColumn, QueryStatisticsProps} from '../../types/queryStatistics';
import {
    collectQueryStatisticsGroupIds,
    filterQueryStatistics,
    flattenQueryStatistics,
} from './helpers';
import {QueryStatisticsTable} from './internal/QueryStatisticsTable';
import {QueryStatisticsToolbar} from './internal/QueryStatisticsToolbar';

import './QueryStatistics.scss';

const block = cn('qp-query-statistics');
const DEFAULT_VISIBLE_COLUMNS: QueryStatisticsColumn[] = ['min', 'max', 'avg', 'sum', 'count'];
const DEFAULT_SEARCH_DEBOUNCE_MS = 500;

function setsEqual(left: Set<string>, right: Set<string>) {
    return left.size === right.size && Array.from(left).every((value) => right.has(value));
}

export function QueryStatistics({
    data,
    visibleColumns = DEFAULT_VISIBLE_COLUMNS,
    columnConfig,
    extraColumns,
    className,
    virtual = false,
    fixedHeader = false,
    formatValue,
    search: controlledSearch,
    defaultSearch = '',
    onSearchUpdate,
    expandedIds: controlledExpandedIds,
    defaultExpandedIds,
    onExpandedIdsChange,
    searchDebounceMs = DEFAULT_SEARCH_DEBOUNCE_MS,
}: QueryStatisticsProps) {
    const groupIds = useMemo(() => collectQueryStatisticsGroupIds(data), [data]);
    const knownGroupIdsRef = useRef(new Set(groupIds));
    const [uncontrolledExpandedIds, setUncontrolledExpandedIds] = useState(
        () => new Set(defaultExpandedIds ?? groupIds),
    );
    const [uncontrolledSearch, setUncontrolledSearch] = useState(defaultSearch);
    const search = controlledSearch ?? uncontrolledSearch;
    const expandedIds = useMemo(
        () => new Set(controlledExpandedIds ?? uncontrolledExpandedIds),
        [controlledExpandedIds, uncontrolledExpandedIds],
    );
    const debouncedSearch = useDebouncedValue(search, searchDebounceMs);

    const updateSearch = useCallback(
        (value: string) => {
            if (controlledSearch === undefined) setUncontrolledSearch(value);
            onSearchUpdate?.(value);
        },
        [controlledSearch, onSearchUpdate],
    );
    const updateExpandedIds = useCallback(
        (next: Set<string>) => {
            if (controlledExpandedIds === undefined) setUncontrolledExpandedIds(next);
            onExpandedIdsChange?.(Array.from(next));
        },
        [controlledExpandedIds, onExpandedIdsChange],
    );

    useEffect(() => {
        const currentGroupIds = new Set(groupIds);
        const previousGroupIds = knownGroupIdsRef.current;
        const next = new Set(Array.from(expandedIds).filter((id) => currentGroupIds.has(id)));
        groupIds.forEach((id) => {
            if (!previousGroupIds.has(id)) next.add(id);
        });
        if (!setsEqual(expandedIds, next)) updateExpandedIds(next);
        knownGroupIdsRef.current = currentGroupIds;
    }, [expandedIds, groupIds, updateExpandedIds]);

    const filtered = useMemo(
        () => filterQueryStatistics(data, debouncedSearch),
        [data, debouncedSearch],
    );
    const effectiveExpandedIds = useMemo(
        () => new Set([...expandedIds, ...filtered.forcedExpandedIds]),
        [expandedIds, filtered.forcedExpandedIds],
    );
    const rows = useMemo(
        () => flattenQueryStatistics(filtered.data, effectiveExpandedIds),
        [effectiveExpandedIds, filtered.data],
    );
    const toggleGroup = useCallback(
        (id: string) => {
            const next = new Set(expandedIds);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            updateExpandedIds(next);
        },
        [expandedIds, updateExpandedIds],
    );

    return (
        <div className={block(null, className)}>
            <QueryStatisticsToolbar
                search={search}
                hasGroups={Boolean(groupIds.length)}
                onSearchUpdate={updateSearch}
                onExpandAll={() => updateExpandedIds(new Set(groupIds))}
                onCollapseAll={() => updateExpandedIds(new Set())}
            />
            <QueryStatisticsTable
                rows={rows}
                visibleColumns={visibleColumns}
                columnConfig={columnConfig}
                extraColumns={extraColumns}
                expandedIds={effectiveExpandedIds}
                fixedHeader={fixedHeader}
                virtual={virtual}
                formatValue={formatValue}
                isSearching={Boolean(search)}
                onToggleGroup={toggleGroup}
            />
        </div>
    );
}
