import {useEffect, useState} from 'react';
import {QueryStatus} from '../../types/history';
import {CompletedQueryStates} from '../../constants/query';
import {durationDates} from '../../helpers/time';

const calculateDuration = (
    state: QueryStatus,
    startTime?: string | number,
    endTime?: string | number,
) => {
    if (state === 'draft' || startTime === undefined) {
        return '--:--';
    }

    if (CompletedQueryStates.includes(state)) {
        return endTime === undefined ? '--:--' : durationDates(startTime, endTime);
    }

    return durationDates(startTime, endTime ?? Date.now());
};

export const useQueryDuration = (
    state: QueryStatus,
    startTime?: string | number,
    endTime?: string | number,
) => {
    const [duration, setDuration] = useState(() => calculateDuration(state, startTime, endTime));

    useEffect(() => {
        setDuration(calculateDuration(state, startTime, endTime));

        let timer: ReturnType<typeof setInterval> | undefined;

        if (!(
            state === 'draft' ||
            startTime === undefined ||
            CompletedQueryStates.includes(state) ||
            endTime !== undefined
        )) {
            timer = setInterval(() => setDuration(durationDates(startTime, Date.now())), 1000);
        }

        return () => {
            if (timer !== undefined) {
                clearInterval(timer);
            }
        };
    }, [state, startTime, endTime]);

    return duration;
};
