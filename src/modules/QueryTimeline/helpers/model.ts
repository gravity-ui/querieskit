import type {
    QueryTimelineInterval,
    QueryTimelineItem,
    QueryTimelineRange,
    QueryTimelineStage,
    QueryTimelineStatus,
} from '../../../types/queryTimeline';

import i18n from '../i18n';

export const MIN_RANGE = 1000;
export const MAX_RANGE = 15 * 365 * 24 * 60 * 60 * 1000;
export const DEFAULT_COLOR = 'var(--g-color-base-neutral-heavy)';

export type TimelineRow = {
    id: string;
    item: QueryTimelineItem;
    stage?: QueryTimelineStage;
    interval?: QueryTimelineRange;
    open: boolean;
};

export function validateTimeline(
    items: readonly QueryTimelineItem[],
    statuses: readonly QueryTimelineStatus[],
    ranges: (QueryTimelineRange | undefined)[],
    now: number,
    rowHeight: number,
    listWidth: number,
) {
    const unique = (ids: string[], context: string) => {
        if (new Set(ids).size !== ids.length) throw new Error(`Duplicate ${context} IDs`);
    };
    const interval = (value: QueryTimelineInterval, context: string) => {
        if (
            !Number.isFinite(value.start) ||
            Math.abs(value.start) > 8.64e15 - MAX_RANGE ||
            (value.end !== undefined &&
                (!Number.isFinite(value.end) ||
                    Math.abs(value.end) > 8.64e15 - MAX_RANGE ||
                    value.end < value.start))
        ) {
            throw new Error(`Invalid interval: ${context}`);
        }
    };
    unique(
        items.map((item) => item.id),
        'item',
    );
    unique(
        statuses.map((status) => status.id),
        'status',
    );
    for (const item of items) {
        if (item.interval) interval(item.interval, item.id);
        unique(
            (item.stages ?? []).map((stage) => stage.id),
            `stage in ${item.id}`,
        );
        for (const stage of item.stages ?? []) interval(stage.interval, `${item.id}/${stage.id}`);
    }
    for (const range of ranges) {
        if (range) interval({start: range.from, end: range.to}, 'range');
    }
    if (!Number.isFinite(now) || Math.abs(now) > 8.64e15 - MAX_RANGE)
        throw new Error('Invalid current time');
    if (!Number.isFinite(rowHeight) || rowHeight < 24) throw new Error('rowHeight must be >= 24');
    if (!Number.isFinite(listWidth) || listWidth < 160) throw new Error('listWidth must be >= 160');
}

export function resolveInterval(interval: QueryTimelineInterval, now: number): QueryTimelineRange {
    return {from: interval.start, to: interval.end ?? Math.max(interval.start, now)};
}

export function itemInterval(item: QueryTimelineItem, now: number): QueryTimelineRange | undefined {
    if (item.interval) return resolveInterval(item.interval, now);
    return extent((item.stages ?? []).map((stage) => resolveInterval(stage.interval, now)));
}

export function extent(ranges: (QueryTimelineRange | undefined)[]): QueryTimelineRange | undefined {
    let from = Infinity;
    let to = -Infinity;
    for (const range of ranges) {
        if (range) {
            from = Math.min(from, range.from);
            to = Math.max(to, range.to);
        }
    }
    return Number.isFinite(from) && Number.isFinite(to) ? {from, to} : undefined;
}

export function normalizeRange(range: QueryTimelineRange): QueryTimelineRange {
    const duration = Math.min(MAX_RANGE, Math.max(MIN_RANGE, range.to - range.from));
    const middle = range.from + (range.to - range.from) / 2;
    return {from: Math.round(middle - duration / 2), to: Math.round(middle + duration / 2)};
}

export function sameRange(a?: QueryTimelineRange, b?: QueryTimelineRange) {
    return a?.from === b?.from && a?.to === b?.to;
}

export function hasOpenIntervals(items: readonly QueryTimelineItem[]) {
    return items.some(
        (item) =>
            (item.interval && item.interval.end === undefined) ||
            item.stages?.some((stage) => stage.interval.end === undefined),
    );
}

export function filterItems(items: readonly QueryTimelineItem[], search: string, status?: string) {
    const query = search.trim().toLowerCase();
    return items.filter(
        (item) =>
            (!query || item.label.toLowerCase().includes(query)) &&
            (status === undefined || item.status === status),
    );
}

export function statusOptions(
    items: readonly QueryTimelineItem[],
    statuses: readonly QueryTimelineStatus[],
) {
    const counts = new Map<string, number>();
    for (const item of items) {
        if (item.status !== undefined) counts.set(item.status, (counts.get(item.status) ?? 0) + 1);
    }
    const labels = new Map(statuses.map((status) => [status.id, status.label]));
    for (const id of counts.keys()) if (!labels.has(id)) labels.set(id, id);
    return Array.from(labels, ([value, label]) => ({
        value,
        content: `${label} (${counts.get(value) ?? 0})`,
    }));
}

export function createRows(
    items: readonly QueryTimelineItem[],
    expanded: ReadonlySet<string>,
    now: number,
): TimelineRow[] {
    return items.flatMap((item) => {
        const rows: TimelineRow[] = [
            {
                id: JSON.stringify([item.id]),
                item,
                interval: itemInterval(item, now),
                open: Boolean(
                    item.interval ? item.interval.end === undefined : hasOpenIntervals([item]),
                ),
            },
        ];
        if (expanded.has(item.id)) {
            for (const stage of item.stages ?? []) {
                rows.push({
                    id: JSON.stringify([item.id, stage.id]),
                    item,
                    stage,
                    interval: resolveInterval(stage.interval, now),
                    open: stage.interval.end === undefined,
                });
            }
        }
        return rows;
    });
}

export function getWindow(count: number, scrollTop: number, height: number, rowHeight: number) {
    return {
        start: Math.max(0, Math.floor(scrollTop / rowHeight) - 10),
        end: Math.min(count, Math.ceil((scrollTop + height) / rowHeight) + 10),
    };
}

export function preserveScroll(
    previous: readonly TimelineRow[],
    next: readonly TimelineRow[],
    scrollTop: number,
    height: number,
    previousRowHeight: number,
    rowHeight: number,
) {
    const anchor = previous[Math.floor(scrollTop / previousRowHeight)];
    const index = anchor ? next.findIndex((row) => row.id === anchor.id) : -1;
    const desired = index < 0 ? scrollTop : index * rowHeight + (scrollTop % previousRowHeight);
    return Math.max(0, Math.min(desired, next.length * rowHeight - height));
}

export function progressFraction(progress: QueryTimelineItem['progress']) {
    if (!progress) return undefined;
    const fraction =
        progress.fraction ??
        (progress.total && progress.total > 0 && progress.completed !== undefined
            ? progress.completed / progress.total
            : undefined);
    return fraction !== undefined && Number.isFinite(fraction)
        ? Math.min(1, Math.max(0, fraction))
        : undefined;
}

export function formatTimelineDuration(milliseconds: number) {
    if (milliseconds < 1000) return i18n('value_milliseconds', {count: Math.round(milliseconds)});
    const seconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor(seconds / 60) % 60;
    return [hours, minutes, seconds % 60].map((value) => String(value).padStart(2, '0')).join(':');
}
