import type {QueryListRow} from './queryList';

export type TutorialHistoryRow = QueryListRow & {
    /** Stable lesson number, independent of its identifier and position in search results. */
    number?: number;
};
