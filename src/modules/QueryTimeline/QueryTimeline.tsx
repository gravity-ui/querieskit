import React, {useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState} from 'react';
import {Flex, Text} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';
import type {
    QueryTimelineProps,
    QueryTimelineRange,
    QueryTimelineStatus,
} from '../../types/queryTimeline';
import {
    createRows,
    extent,
    filterItems,
    formatTimelineDuration,
    getWindow,
    hasOpenIntervals,
    normalizeRange,
    preserveScroll,
    resolveInterval,
    sameRange,
    statusOptions,
    validateTimeline,
} from './helpers/model';
import {TimelinePlot} from './internal/TimelinePlot';
import {TimelineItemRow} from './internal/TimelineItemRow';
import {TimelineRangeSelector} from './internal/TimelineRangeSelector';
import {TimelineState} from './internal/TimelineState';
import {TimelineToolbar} from './internal/TimelineToolbar';
import i18n from './i18n';
import './QueryTimeline.scss';

const block = cn('qp-query-timeline');
const emptyStatuses: readonly QueryTimelineStatus[] = [];

export function QueryTimeline({
    items,
    statuses = emptyStatuses,
    range: controlledRange,
    defaultRange,
    onRangeChange,
    bounds,
    now: externalNow,
    loading,
    errorContent,
    emptyContent,
    onError,
    className,
    rowHeight = 32,
    listWidth = 360,
    active = true,
    renderItemLabel,
    renderItemStatus,
    renderEventPopup,
    formatDuration = formatTimelineDuration,
    timeZone,
    onItemClick,
    onEventClick,
    showSearch,
    showStatusFilter,
    showRangeSelector = true,
}: QueryTimelineProps) {
    const [clock, setClock] = useState(Date.now);
    const now = externalNow ?? clock;
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>();
    const [expanded, setExpanded] = useState<Set<string>>(() => new Set());
    const [savedRange, setSavedRange] = useState<QueryTimelineRange>();
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [scrollTop, setScrollTop] = useState(0);
    const [height, setHeight] = useState(0);
    const [scrollbarWidth, setScrollbarWidth] = useState(0);
    const scrollRef = useRef<HTMLDivElement>(null);
    const scrollFrame = useRef<number | undefined>(undefined);

    const error = useMemo(() => {
        try {
            validateTimeline(
                items,
                statuses,
                [controlledRange, defaultRange, bounds],
                externalNow ?? Date.now(),
                rowHeight,
                listWidth,
            );
            if (timeZone && !['default', 'system'].includes(timeZone)) {
                new Intl.DateTimeFormat('en', {timeZone}).format(0);
            }
            return undefined;
        } catch (cause) {
            return cause instanceof Error ? cause : new Error(String(cause));
        }
    }, [
        items,
        statuses,
        controlledRange,
        defaultRange,
        bounds,
        externalNow,
        rowHeight,
        listWidth,
        timeZone,
    ]);
    useEffect(() => {
        if (error) onError?.(error);
    }, [error, onError]);
    const open = useMemo(() => !error && hasOpenIntervals(items), [error, items]);
    useEffect(() => {
        if (!active || externalNow !== undefined || !open || loading || errorContent)
            return undefined;
        setClock(Date.now());
        const timer = setInterval(() => setClock(Date.now()), 1000);
        return () => clearInterval(timer);
    }, [active, externalNow, open, loading, errorContent]);

    const fullRange = useMemo(() => {
        if (error) return undefined;
        const value =
            bounds ??
            extent(
                items.flatMap((item) => [
                    item.interval ? resolveInterval(item.interval, now) : undefined,
                    ...(item.stages ?? []).map((stage) => resolveInterval(stage.interval, now)),
                ]),
            );
        return value ? normalizeRange(value) : undefined;
    }, [bounds, error, items, now]);
    const range = useMemo(() => {
        if (error) return undefined;
        const value = controlledRange ?? savedRange ?? defaultRange ?? fullRange;
        return value ? normalizeRange(value) : undefined;
    }, [error, controlledRange, savedRange, defaultRange, fullRange]);
    useEffect(() => {
        if (range && !savedRange && controlledRange === undefined) setSavedRange(range);
    }, [range, savedRange, controlledRange]);
    const lastNotified = useRef<QueryTimelineRange | undefined>(undefined);
    useEffect(() => {
        lastNotified.current = undefined;
    }, [range]);
    const updateRange = useCallback(
        (next: QueryTimelineRange) => {
            if (!Number.isFinite(next.from) || !Number.isFinite(next.to) || next.to < next.from)
                return;
            const normalized = normalizeRange(next);
            if (sameRange(range, normalized) || sameRange(lastNotified.current, normalized)) return;
            lastNotified.current = normalized;
            if (controlledRange === undefined) setSavedRange(normalized);
            onRangeChange?.(normalized);
        },
        [controlledRange, onRangeChange, range],
    );

    const filtered = useMemo(
        () => (error ? [] : filterItems(items, search, statusFilter)),
        [error, items, search, statusFilter],
    );
    const rows = useMemo(() => createRows(filtered, expanded, now), [filtered, expanded, now]);
    const statusMap = useMemo(
        () => new Map(statuses.map((status) => [status.id, status])),
        [statuses],
    );
    const options = useMemo(() => statusOptions(items, statuses), [items, statuses]);
    const expandable = useMemo(
        () => filtered.filter((item) => item.stages?.length).map((item) => item.id),
        [filtered],
    );
    const allExpanded = expandable.length > 0 && expandable.every((id) => expanded.has(id));
    const toggle = (id: string) =>
        setExpanded((previous) => {
            const next = new Set(previous);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    const toggleAll = () =>
        setExpanded((previous) => {
            const next = new Set(previous);
            for (const id of expandable) {
                if (allExpanded) next.delete(id);
                else next.add(id);
            }
            return next;
        });

    const previousLayout = useRef({rows, rowHeight, search, statusFilter});
    useLayoutEffect(() => {
        const previous = previousLayout.current;
        const node = scrollRef.current;
        if (!node) return;
        const reset = previous.search !== search || previous.statusFilter !== statusFilter;
        const next = reset
            ? 0
            : preserveScroll(previous.rows, rows, scrollTop, height, previous.rowHeight, rowHeight);
        previousLayout.current = {rows, rowHeight, search, statusFilter};
        node.scrollTop = next;
        if (next !== scrollTop) setScrollTop(next);
    }, [rows, rowHeight, search, statusFilter, height, scrollTop, active, loading]);
    const showBody = !loading && !error && !errorContent && rows.length > 0;
    useLayoutEffect(() => {
        const node = scrollRef.current;
        if (!node || !active || !showBody) return undefined;
        const measure = () => {
            setHeight(node.clientHeight);
            setScrollbarWidth(node.offsetWidth - node.clientWidth);
        };
        measure();
        const observer = new ResizeObserver(measure);
        observer.observe(node);
        return () => observer.disconnect();
    }, [active, showBody]);
    useEffect(
        () => () => {
            if (scrollFrame.current !== undefined) cancelAnimationFrame(scrollFrame.current);
        },
        [],
    );
    const window = getWindow(rows.length, scrollTop, height, rowHeight);
    const visibleRows = useMemo(
        () => rows.slice(window.start, window.end),
        [rows, window.start, window.end],
    );
    const hasIntervals = rows.some((row) => row.interval);

    return (
        <Flex
            direction="column"
            gap={2}
            className={block(null, className)}
            style={{'--qp-timeline-list-width': `${listWidth}px`} as React.CSSProperties}
        >
            <TimelineToolbar
                search={search}
                onSearchChange={setSearch}
                status={statusFilter}
                onStatusChange={setStatusFilter}
                options={options}
                range={range}
                fullRange={fullRange}
                onRangeChange={updateRange}
                canExpand={expandable.length > 0}
                allExpanded={allExpanded}
                onToggleAll={toggleAll}
                showSearch={showSearch}
                showStatusFilter={showStatusFilter}
                showRangeSelector={showRangeSelector}
            />
            {showBody ? (
                <React.Fragment>
                    <div className={block('header')} style={{paddingRight: scrollbarWidth}}>
                        <Text className={block('heading')} variant="subheader-1">
                            {i18n('field_status')}
                        </Text>
                        <div className={block('ruler')}>
                            {showRangeSelector && range && active && hasIntervals && (
                                <TimelineRangeSelector
                                    range={range}
                                    timeZone={timeZone}
                                    onChange={updateRange}
                                />
                            )}
                        </div>
                    </div>
                    <div
                        ref={scrollRef}
                        className={block('scroll')}
                        onScroll={() => {
                            if (scrollFrame.current !== undefined)
                                cancelAnimationFrame(scrollFrame.current);
                            scrollFrame.current = requestAnimationFrame(() => {
                                scrollFrame.current = undefined;
                                setScrollTop(scrollRef.current?.scrollTop ?? 0);
                            });
                        }}
                    >
                        <div className={block('spacer')} style={{height: rows.length * rowHeight}}>
                            <div
                                className={block('rows')}
                                role="list"
                                aria-label={i18n('title_timeline')}
                            >
                                {visibleRows.map((row, index) => (
                                    <div
                                        key={row.id}
                                        className={block('row')}
                                        style={{
                                            height: rowHeight,
                                            top: (window.start + index) * rowHeight,
                                        }}
                                    >
                                        <TimelineItemRow
                                            row={row}
                                            status={statusMap.get(row.item.status ?? '')}
                                            expanded={expanded.has(row.item.id)}
                                            onToggle={() => toggle(row.item.id)}
                                            onFit={() => {
                                                if (row.interval)
                                                    updateRange({
                                                        from: row.interval.from - 500,
                                                        to: row.interval.to + 500,
                                                    });
                                            }}
                                            renderItemLabel={renderItemLabel}
                                            renderItemStatus={renderItemStatus}
                                            onItemClick={onItemClick}
                                            onEventClick={onEventClick}
                                            formatDuration={formatDuration}
                                            timeZone={timeZone}
                                        />
                                    </div>
                                ))}
                            </div>
                            <div className={block('canvas')} style={{height}}>
                                <TimelinePlot
                                    active={active}
                                    height={height}
                                    hasIntervals={hasIntervals}
                                    rows={visibleRows}
                                    offset={window.start}
                                    rowHeight={rowHeight}
                                    scrollTop={scrollTop}
                                    range={range}
                                    controlled={controlledRange !== undefined}
                                    onRangeChange={updateRange}
                                    statuses={statusMap}
                                    formatDuration={formatDuration}
                                    now={now}
                                    selectedIds={selectedIds}
                                    onSelectionChange={setSelectedIds}
                                    onEventClick={onEventClick}
                                    renderEventPopup={renderEventPopup}
                                    timeZone={timeZone}
                                />
                            </div>
                        </div>
                    </div>
                </React.Fragment>
            ) : (
                <Flex
                    alignItems="center"
                    justifyContent="center"
                    className={block('state')}
                    role={error || errorContent ? 'alert' : 'status'}
                >
                    <TimelineState
                        loading={loading}
                        errorContent={errorContent}
                        emptyContent={emptyContent}
                        invalid={Boolean(error)}
                        empty={!items.length}
                    />
                </Flex>
            )}
        </Flex>
    );
}
