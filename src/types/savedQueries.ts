import {QueryListRow, QueryTimestamp} from './queryList';

export type SavedQuery = QueryListRow & {
    savedAt?: QueryTimestamp;
    engine?: string;
    author?: string;
};
