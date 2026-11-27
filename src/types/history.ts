import {QueryListRow, QueryTimestamp} from './queryList';

export type QueryStatus = 'completed' | 'failed' | 'aborted' | 'draft' | 'running';

export type QueryHistoryRow = QueryListRow & {
    /** 1-based line in the full query to include in the SQL preview. */
    previewLineNumber?: number;
    startTime?: QueryTimestamp;
    endTime?: QueryTimestamp;
    engine?: string;
    mode?: string;
    isPrivate?: boolean;
    status: QueryStatus;
};
