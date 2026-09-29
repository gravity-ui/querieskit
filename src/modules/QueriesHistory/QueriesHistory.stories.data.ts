import type {QueryListItem} from '../../types/queryList';
import type {QueryHistoryRow} from '../../types/history';

const now = Date.now();
export const min = 60 * 1000;

const QUERY = `use test;

SELECT
    "test_session" AS session_id,
    "test_task" AS task_id,
    SUBSTRING("test", 1, 1) AS truncated_char`;

export const BASE_ITEMS: QueryListItem<QueryHistoryRow>[] = [
    {header: 'Today', height: 28},
    {
        id: 1,
        title: 'Query 1',
        status: 'completed',
        engine: 'YQL',
        mode: 'Validation',
        startTime: now - 2 * min,
        endTime: now - min,
        query: QUERY,
        height: 52,
    },
    {
        id: 2,
        title: 'Query 2',
        status: 'failed',
        engine: 'YQL',
        mode: 'Test',
        startTime: now - 10 * min,
        endTime: now - 9 * min,
        query: QUERY,
        height: 52,
    },
    {
        id: 3,
        title: 'Query 3',
        status: 'running',
        engine: 'YQL',
        mode: 'Test',
        startTime: now - min,
        query: QUERY,
        height: 52,
    },
    {header: 'Yesterday', height: 28},
    {
        id: 4,
        title: 'Query 4',
        status: 'aborted',
        engine: 'YQL',
        mode: 'Validation',
        startTime: now - 25 * 60 * min,
        endTime: now - 24 * 60 * min,
        query: 'SELECT 1',
        height: 52,
    },
    {
        id: 5,
        title: 'Query 5',
        status: 'draft',
        engine: 'YQL',
        mode: 'Test',
        startTime: now - 30 * 60 * min,
        query: QUERY,
        height: 52,
    },
    {
        id: 6,
        title: 'Query 6',
        status: 'draft',
        engine: 'YQL',
        mode: 'Test',
        startTime: now - 30 * 60 * min,
        query: QUERY,
        height: 52,
    },
    {
        id: 7,
        title: 'Query 7',
        status: 'draft',
        engine: 'YQL',
        mode: 'Test',
        startTime: now - 30 * 60 * min,
        query: QUERY,
        height: 52,
    },
    {
        id: 8,
        title: 'Query 8',
        status: 'draft',
        engine: 'YQL',
        mode: 'Test',
        startTime: now - 30 * 60 * min,
        query: QUERY,
        height: 52,
    },
];
