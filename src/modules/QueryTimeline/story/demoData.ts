import type {QueryTimelineItem, QueryTimelineStatus} from '../../../types/queryTimeline';

export const start = Date.UTC(2026, 8, 25, 10);
export const timelineStatuses: QueryTimelineStatus[] = [
    {id: 'queued', label: 'Queued', color: 'var(--g-color-base-neutral-heavy)'},
    {id: 'executing', label: 'Executing', color: 'var(--g-color-base-info-heavy)'},
    {id: 'done', label: 'Done', color: 'var(--g-color-base-positive-heavy)'},
    {id: 'error', label: 'Error', color: 'var(--g-color-base-danger-heavy)'},
];
export const timelineItems: QueryTimelineItem[] = [
    {id: 'prepare', label: 'Prepare', status: 'done', interval: {start, end: start + 8000}},
    {
        id: 'fetch',
        label: 'Fetch source',
        status: 'done',
        href: 'https://gravity-ui.com',
        interval: {start: start + 8000, end: start + 50000},
        stages: [
            {id: 'connect', label: 'Connect', interval: {start: start + 8000, end: start + 15000}},
            {id: 'read', label: 'Read', interval: {start: start + 18000, end: start + 45000}},
            {id: 'decode', label: 'Decode', interval: {start: start + 40000, end: start + 50000}},
        ],
    },
    {
        id: 'aggregate',
        label: 'Aggregate',
        status: 'executing',
        progress: {completed: 72, total: 100},
        interval: {start: start + 50000},
        stages: [{id: 'reduce', label: 'Reduce', interval: {start: start + 52000}}],
    },
    {id: 'publish', label: 'Publish', status: 'queued'},
];
