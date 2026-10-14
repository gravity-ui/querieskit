import type React from 'react';

/** Unix timestamps in milliseconds. */
export type QueryTimelineRange = {from: number; to: number};
export type QueryTimelineInterval = {start: number; end?: number};

export type QueryTimelineStage = {
    id: string;
    label: string;
    interval: QueryTimelineInterval;
    color?: string;
    data?: unknown;
};

export type QueryTimelineItem = {
    id: string;
    label: string;
    status?: string;
    /** An omitted end means the interval is still running, regardless of status. */
    interval?: QueryTimelineInterval;
    stages?: readonly QueryTimelineStage[];
    progress?: {fraction?: number; completed?: number; total?: number};
    href?: string;
    data?: unknown;
};

export type QueryTimelineStatus = {
    id: string;
    label: string;
    color?: string;
    icon?: React.ReactNode;
};

export type QueryTimelineEventContext = {
    item: QueryTimelineItem;
    stage?: QueryTimelineStage;
};
export type QueryTimelineRenderContext = QueryTimelineEventContext & {
    defaultContent: React.ReactNode;
};

export type QueryTimelineProps = {
    items: readonly QueryTimelineItem[];
    statuses?: readonly QueryTimelineStatus[];
    range?: QueryTimelineRange;
    defaultRange?: QueryTimelineRange;
    onRangeChange?: (range: QueryTimelineRange) => void;
    /** Full extent used by “Fit all”; does not constrain panning. */
    bounds?: QueryTimelineRange;
    /** External clock in Unix milliseconds. Omit to update open intervals every second. */
    now?: number;
    loading?: boolean;
    errorContent?: React.ReactNode;
    emptyContent?: React.ReactNode;
    onError?: (error: Error) => void;
    className?: string;
    /** Fixed row height, in pixels. Minimum: 24. Default: 32. */
    rowHeight?: number;
    /** Width of the list, in pixels. Minimum: 160. Default: 360. */
    listWidth?: number;
    /** Suspend the canvas and clock while retaining interaction state. */
    active?: boolean;
    renderItemLabel?: (context: QueryTimelineRenderContext) => React.ReactNode;
    renderItemStatus?: (context: QueryTimelineRenderContext) => React.ReactNode;
    renderEventPopup?: (context: QueryTimelineRenderContext) => React.ReactNode;
    formatDuration?: (milliseconds: number) => string;
    timeZone?: string;
    onItemClick?: (item: QueryTimelineItem, event: React.MouseEvent<HTMLElement>) => void;
    onEventClick?: (context: QueryTimelineEventContext) => void;
    showSearch?: boolean;
    showStatusFilter?: boolean;
    showRangeSelector?: boolean;
};
