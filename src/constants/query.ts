import {QueryStatus} from '../types/history';

export const CompletedQueryStates: Partial<QueryStatus>[] = [
    'draft',
    'aborted',
    'completed',
    'failed',
];

export const ProgressQueryStatuses: Partial<QueryStatus>[] = ['running'];
