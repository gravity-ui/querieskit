import type {QueryListItem} from '../../types/queryList';
import type {TutorialHistoryRow} from '../../types/tutorial';

export const QUERY = `use test;

SELECT
    "test_session" AS session_id,
    "test_task" AS task_id,
    SUBSTRING("test", 1, 1) AS truncated_char`;

export const BASE_ITEMS: QueryListItem<TutorialHistoryRow>[] = [
    {
        id: 1,
        title: 'Getting started with YQL',
        query: QUERY,
        height: 28,
    },
    {
        id: 2,
        title: 'Working with tables',
        query: QUERY,
        height: 28,
    },
    {
        id: 3,
        title: 'Window functions',
        query: QUERY,
        height: 28,
    },
];
