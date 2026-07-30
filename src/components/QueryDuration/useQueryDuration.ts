import {useEffect, useState} from 'react';
import {QueryStatus} from '../../types/history';
import {CompletedQueryStates} from '../../constants/query';
import {durationDates} from '../../helpers/time';

export const useQueryDuration = (
    state: QueryStatus,
    startTime: string | number,
    endTime?: string | number,
) => {
    const [duration, setDuration] = useState(durationDates(startTime, endTime));

    useEffect(() => {
        if (state === 'draft') {
            setDuration('--:--');
            return;
        }
        if (CompletedQueryStates.includes(state)) {
            setDuration(endTime ? durationDates(startTime, endTime) : '--:--');
            return;
        }
        setDuration(durationDates(startTime, endTime));
        if (endTime) {
            return;
        }
        const timer = setInterval(() => setDuration(durationDates(startTime, endTime)), 1000);

        return () => {
            clearInterval(timer);
        };
    }, [state, startTime, endTime]);

    return duration;
};
