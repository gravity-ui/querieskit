import {DateTime, dateTime, dateTimeParse} from '@gravity-ui/date-utils';

type Date = DateTime | string | number | undefined;

export const formatTime = (date: Date) => {
    return dateTimeParse(date)?.format('HH:mm');
};

export const durationDates = (date1: Date, date2: Date) => {
    if (!date1 && !date2) return '--:--';

    const start = dateTimeParse(date1) || dateTime();
    const end = dateTimeParse(date2) || dateTime();
    const diff = end?.diff(start);

    return dateTimeParse(diff)?.format('HH:mm');
};

export const formatTimeCanonical = (ts: Date) => {
    return dateTimeParse(ts)?.format('DD.MM.YYYY, HH:mm');
};

export const getTimestampFromDate = (date: Date) => {
    return dateTimeParse(date)?.valueOf();
};
