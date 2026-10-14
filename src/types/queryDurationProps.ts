import type {QueryStatus} from './history';

export type QueryDurationProps = {
    startTime?: string | number;
    endTime?: string | number;
    status: QueryStatus;
    className?: string;
};
