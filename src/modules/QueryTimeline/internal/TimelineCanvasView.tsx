import React, {useEffect, useRef, useState} from 'react';
import {ComponentType, TimelineState} from '@gravity-ui/timeline';
import type {TimeLineConfig, TimelineMarker, TimelineSection} from '@gravity-ui/timeline';
import {useTimeline, useTimelineEvent} from '@gravity-ui/timeline/react';
import {EventPopup, GravityTimelineCanvas} from '@gravity-ui/timeline/react/uikit';
import cn from 'bem-cn-lite';
import type {
    QueryTimelineProps,
    QueryTimelineRange,
    QueryTimelineStatus,
} from '../../../types/queryTimeline';
import {
    DEFAULT_COLOR,
    MAX_RANGE,
    MIN_RANGE,
    type TimelineRow,
    resolveInterval,
    sameRange,
} from '../helpers/model';
import {type QueryTimelineCanvasEvent, TimelineEventRenderer} from './TimelineEventRenderer';
import {TimelineDetails} from './TimelineDetails';
import i18n from '../i18n';
import './TimelineCanvasView.scss';

const block = cn('qp-timeline-canvas-view');
const renderer = new TimelineEventRenderer();

type Props = Pick<QueryTimelineProps, 'onEventClick' | 'renderEventPopup' | 'timeZone'> & {
    rows: TimelineRow[];
    offset: number;
    rowHeight: number;
    scrollTop: number;
    range: QueryTimelineRange;
    controlled: boolean;
    onRangeChange: (range: QueryTimelineRange) => void;
    statuses: ReadonlyMap<string, QueryTimelineStatus>;
    formatDuration: (milliseconds: number) => string;
    now: number;
    selectedIds: string[];
    onSelectionChange: (ids: string[]) => void;
};

export function TimelineCanvasView(props: Props) {
    const rootRef = useRef<HTMLDivElement>(null);
    const latest = useRef(props);
    latest.current = props;
    const syncing = useRef(false);
    const [config] = useState<
        TimeLineConfig<QueryTimelineCanvasEvent, TimelineMarker, TimelineSection>
    >(() => ({
        settings: {start: props.range.from, end: props.range.to, axes: [], events: []},
        viewConfiguration: {
            hideRuler: true,
            font: 'var(--g-text-body-1-font)',
            axes: {linePosition: 'between', color: {line: 'var(--g-color-line-generic)'}},
            grid: {
                color: {
                    primaryMarkColor: 'var(--g-color-line-generic)',
                    secondaryMarkColor: 'var(--g-color-line-generic)',
                    boundaryMarkColor: 'var(--g-color-line-generic)',
                },
            },
            camera: {
                minRange: MIN_RANGE,
                maxRange: MAX_RANGE,
                interactions: {
                    verticalWheel: 'pass-through',
                    horizontalWheel: 'pan',
                    pinch: 'zoom',
                },
            },
        },
    }));
    const {timeline} = useTimeline(config);

    // Keep the engine stable; only publish data after its child canvas has initialized.
    const synchronize = () => {
        if (timeline.state !== TimelineState.READY) return;
        const current = latest.current;
        syncing.current = true;
        try {
            // Empty old events before replacing axes: old rows may no longer exist.
            timeline.api.setEvents([]);
            timeline.api.setAxes(
                current.rows.map((row, index) => ({
                    id: row.id,
                    tracksCount: 1,
                    top: (current.offset + index) * current.rowHeight,
                    height: current.rowHeight,
                })),
            );
            const interval = timeline.api.getInterval();
            if (interval.start !== current.range.from || interval.end !== current.range.to) {
                timeline.api.setRange(current.range.from, current.range.to);
            }
            const minDuration =
                ((current.range.to - current.range.from) * 4) / Math.max(1, timeline.api.width);
            const events: QueryTimelineCanvasEvent[] = current.rows.flatMap((row) => {
                if (!row.interval) return [];
                const baseColor =
                    current.statuses.get(row.item.status ?? '')?.color ?? DEFAULT_COLOR;
                const stageIndex = row.stage ? (row.item.stages ?? []).indexOf(row.stage) : 0;
                const opacity = (index: number) => 1 - (index % 5) * 0.13;
                // The engine indexes timestamps, not renderer hitboxes. Extend the indexed
                // end to the visible minimum width. This also avoids its `to || end` at 0.
                const end = Math.max(row.interval.to, row.interval.from + minDuration);
                return [
                    {
                        id: row.id,
                        axisId: row.id,
                        trackIndex: 0,
                        from: row.interval.from,
                        to: end === 0 ? Number.EPSILON : end,
                        row,
                        color: row.stage?.color ?? baseColor,
                        opacity: row.stage?.color ? 1 : opacity(stageIndex),
                        duration: current.formatDuration(row.interval.to - row.interval.from),
                        cursor: current.onEventClick ? 'pointer' : undefined,
                        segments: row.stage
                            ? []
                            : (row.item.stages ?? []).map((stage, index) => ({
                                  ...resolveInterval(stage.interval, current.now),
                                  color: stage.color ?? baseColor,
                                  opacity: stage.color ? 1 : opacity(index),
                              })),
                        renderer,
                    },
                ];
            });
            timeline.api.setEvents(events, current.selectedIds);
            timeline.api.setCanvasScrollTop(current.scrollTop);
        } finally {
            syncing.current = false;
        }
    };
    const synchronizeRef = useRef(synchronize);
    synchronizeRef.current = synchronize;
    useTimelineEvent(timeline, 'on-ready', () => synchronizeRef.current());
    useEffect(() => {
        synchronizeRef.current();
    }, [props, timeline]);
    useEffect(() => {
        const observer = new ResizeObserver(() => synchronizeRef.current());
        if (rootRef.current) observer.observe(rootRef.current);
        return () => observer.disconnect();
    }, [timeline]);

    const updateRange = (range: QueryTimelineRange) => {
        if (syncing.current || timeline.state !== TimelineState.READY) return;
        const current = latest.current;
        if (!sameRange(current.range, range)) current.onRangeChange(range);
        if (current.controlled) {
            syncing.current = true;
            try {
                timeline.api.setRange(current.range.from, current.range.to);
            } finally {
                syncing.current = false;
            }
        }
    };
    useTimelineEvent(timeline, 'on-range-change', updateRange);
    useTimelineEvent(timeline, 'on-camera-change', updateRange);
    useTimelineEvent(timeline, 'on-select-change', ({events}) => {
        props.onSelectionChange(events.map((event) => event.id));
    });
    useTimelineEvent(timeline, 'on-click', ({canvasX, canvasY}) => {
        const events = timeline.api.getComponent<{
            getTopEventAtPoint: (x: number, y: number) => QueryTimelineCanvasEvent | undefined;
            render: () => void;
        }>(ComponentType.Events);
        const event = events?.getTopEventAtPoint(canvasX, canvasY);
        if (event) props.onEventClick?.({item: event.row.item, stage: event.row.stage});
    });

    return (
        <div ref={rootRef} className={block()} role="img" aria-label={i18n('title_timeline')}>
            <GravityTimelineCanvas timeline={timeline} />
            <EventPopup
                timeline={timeline}
                aria-label={i18n('title_timeline')}
                content={(event) => {
                    const row = event.row;
                    const defaultContent = (
                        <TimelineDetails
                            row={row}
                            status={props.statuses.get(row.item.status ?? '')}
                            formatDuration={props.formatDuration}
                            timeZone={props.timeZone}
                        />
                    );
                    return props.renderEventPopup
                        ? props.renderEventPopup({item: row.item, stage: row.stage, defaultContent})
                        : defaultContent;
                }}
            />
        </div>
    );
}
