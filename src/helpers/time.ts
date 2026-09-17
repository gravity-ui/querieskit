import {DateTime, dateTimeParse} from '@gravity-ui/date-utils';

type Date = DateTime | string | number | undefined;

export const formatTime = (date: Date) => {
    return dateTimeParse(date)?.format('HH:mm');
};

export const durationDates = (date1: Date, date2: Date) => {
    if (date1 === undefined || date2 === undefined) return '--:--';

    const start = dateTimeParse(date1);
    const end = dateTimeParse(date2);

    if (!start || !end) return '--:--';

    const diffMs = Math.max(0, end.valueOf() - start.valueOf());
    const totalMinutes = Math.floor(diffMs / 60_000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

export const formatTimeCanonical = (ts: Date) => {
    return dateTimeParse(ts)?.format('DD.MM.YYYY, HH:mm');
};

export const formatDateCanonical = (ts: Date) => {
    return dateTimeParse(ts)?.format('DD.MM.YYYY');
};

export const getTimestampFromDate = (date: Date) => {
    return dateTimeParse(date)?.valueOf();
};
