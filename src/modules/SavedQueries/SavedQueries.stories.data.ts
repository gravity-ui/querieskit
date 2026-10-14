import type {QueryListItem} from '../../types/queryList';
import type {SavedQuery} from '../../types/savedQueries';

const QUERY = `SELECT
    session_id,
    COUNT(*) AS sessions_count
FROM visits
GROUP BY session_id;`;

export const BASE_ITEMS: QueryListItem<SavedQuery>[] = [
    {
        id: 1,
        title: 'New Query',
        savedAt: '2026-04-29T12:00:00.000Z',
        engine: 'SQL',
        author: 'Anna Petrova',
        query: QUERY,
        height: 52,
    },
    {
        id: 2,
        title: 'Daily conversion report',
        savedAt: '2026-04-29T11:00:00.000Z',
        engine: 'YQL',
        author: 'Pavel Sidorov',
        query: QUERY,
        height: 52,
    },
    {
        id: 3,
        title: 'Product funnel',
        savedAt: '2026-04-28T09:00:00.000Z',
        engine: 'SQL',
        author: 'Maria Volkova',
        query: 'SELECT 1;',
        height: 52,
    },
];
