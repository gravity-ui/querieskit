import {QueryListRow, QueryTimestamp} from './queryList';

export type QueryStatus = 'completed' | 'failed' | 'aborted' | 'draft' | 'running';

export type QueryHistoryRow = QueryListRow & {
    startTime?: QueryTimestamp;
    endTime?: QueryTimestamp;
    engine?: string;
    mode?: string;
    isPrivate?: boolean;
    status: QueryStatus;
};
