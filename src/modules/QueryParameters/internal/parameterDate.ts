import {dateTime} from '@gravity-ui/date-utils';

const DATE_PREFIX = /^([+-]?\d{1,6}-\d{2}-\d{2})(.*)$/;

export function parameterDateFormat(kind: 'Date' | 'Datetime') {
    return kind === 'Date' ? 'YYYY-MM-DD' : 'YYYY-MM-DD[T]HH:mm:ss[Z]';
}

/** Only give the picker values it can represent without normalizing user input. */
export function getParameterPickerDate(value: string, kind: 'Date' | 'Datetime') {
    const pattern =
        kind === 'Date' ? /^\d{4}-\d{2}-\d{2}$/ : /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/;
    if (!pattern.test(value) || value.startsWith('0000')) return null;
    const date = dateTime({
        input: kind === 'Date' ? `${value}T00:00:00Z` : value,
        timeZone: 'UTC',
    });
    return date.isValid() && date.format(parameterDateFormat(kind)) === value ? date : null;
}

export function getParameterCalendarDate(value: string) {
    const prefix = DATE_PREFIX.exec(value)?.[1];
    if (!prefix) return null;
    const date = dateTime({input: `${prefix}T00:00:00Z`, timeZone: 'UTC'});
    return date.isValid() && date.format('YYYY-MM-DD') === prefix ? date : null;
}

/** Change the date without passing the time, microseconds or zone through JS Date. */
export function updateParameterDate(value: string, date: string, kind: string) {
    const existing = DATE_PREFIX.exec(value);
    if (existing) return date + existing[2];

    const zoned = kind.startsWith('Tz');
    const dateOnly = /^(Tz)?Date(32)?$/.test(kind);
    const time = dateOnly ? '' : 'T00:00:00' + (kind.includes('Timestamp') ? '.000000' : '');
    const utcSuffix = dateOnly ? '' : 'Z';
    const zone = zoned ? ',Etc/UTC' : utcSuffix;
    return date + time + zone;
}
