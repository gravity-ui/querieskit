const SECOND = 1_000_000n;
const DAY = 86400n * SECOND;

const ranges: Record<string, [bigint, bigint]> = {
    Date: [0n, 49672n],
    Date32: [-53375809n, 53375807n],
    Datetime: [0n, 4291747199n],
    Datetime64: [-4611669897600n, 4611638361599n],
    Timestamp: [0n, 4291747199999999n],
    Timestamp64: [-4611669897600000000n, 4611638361599999999n],
    Interval: [-4291747199999999n, 4291747199999999n],
    Interval64: [-9223339190399999999n, 9223339190399999999n],
};

export const isDateType = (name: string) => Object.prototype.hasOwnProperty.call(ranges, name);

export function isDateValue(value: string, name: string) {
    if (!/^-?\d+$/.test(value)) return false;
    const range = ranges[name];
    return Boolean(range && BigInt(value) >= range[0] && BigInt(value) <= range[1]);
}

const pad = (value: number, length = 2) => String(value).padStart(length, '0');

/** UTC conversion uses bigint for microseconds, including dates before the epoch. */
export function formatDate(value: string, name: string): string {
    if (!isDateValue(value, name)) return value;
    const integer = BigInt(value);
    if (name.startsWith('Interval')) {
        const absolute = integer < 0n ? -integer : integer;
        const seconds = absolute / SECOND;
        const fraction = String(absolute % SECOND).padStart(6, '0');
        return `${integer < 0n ? '-' : ''}PT${seconds}.${fraction}S`;
    }
    const micros = name.startsWith('Timestamp')
        ? integer
        : integer * (name === 'Date' || name === 'Date32' ? DAY : SECOND);
    const seconds = micros >= 0n ? micros / SECOND : (micros - SECOND + 1n) / SECOND;
    const date = new Date(Number(seconds) * 1000);
    // YQL has no year zero; JS uses astronomical year numbering.
    const year = date.getUTCFullYear();
    const yqlYear = year <= 0 ? year - 1 : year;
    const datePart = `${yqlYear < 0 ? '-' : ''}${pad(Math.abs(yqlYear), 4)}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
    if (name === 'Date' || name === 'Date32') return datePart;
    const time = `${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())}`;
    const fraction = name.startsWith('Timestamp')
        ? `.${String(micros - seconds * SECOND).padStart(6, '0')}`
        : '';
    return `${datePart}T${time}${fraction}Z`;
}

function parseInterval(text: string, name: string): string | undefined {
    const match =
        /^(-)?P(?:(\d+)W)?(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)(?:\.(\d{1,6}))?S)?)?$/.exec(
            text,
        );
    if (!match || !match.slice(2).some(Boolean) || text.endsWith('T')) return undefined;
    const [, negative, weeks, days, hours, minutes, seconds, fraction] = match;
    const micros =
        (BigInt(weeks || 0) * 7n * DAY +
            BigInt(days || 0) * DAY +
            BigInt(hours || 0) * 3600n * SECOND +
            BigInt(minutes || 0) * 60n * SECOND +
            BigInt(seconds || 0) * SECOND +
            BigInt((fraction || '').padEnd(6, '0'))) *
        (negative ? -1n : 1n);
    return isDateValue(String(micros), name) ? String(micros) : undefined;
}

export function parseDate(text: string, name: string): string | undefined {
    if (name.startsWith('Interval')) return parseInterval(text, name);
    const dateOnly = name === 'Date' || name === 'Date32';
    const match =
        /^(-?\d{4,6})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,6}))?Z)?$/.exec(text);
    if (!match || (dateOnly ? match[4] !== undefined : match[4] === undefined)) return undefined;
    const [, yearText, month, day, hour = '0', minute = '0', second = '0', fraction = ''] = match;
    const year = Number(yearText);
    if (year === 0 || (!name.startsWith('Timestamp') && fraction)) return undefined;
    const jsYear = year < 0 ? year + 1 : year;
    const date = new Date(0);
    date.setUTCFullYear(jsYear, Number(month) - 1, Number(day));
    date.setUTCHours(Number(hour), Number(minute), Number(second), 0);
    const actual = [
        date.getUTCFullYear(),
        date.getUTCMonth() + 1,
        date.getUTCDate(),
        date.getUTCHours(),
        date.getUTCMinutes(),
        date.getUTCSeconds(),
    ];
    const expected = [
        jsYear,
        Number(month),
        Number(day),
        Number(hour),
        Number(minute),
        Number(second),
    ];
    if (!actual.every((part, index) => part === expected[index])) return undefined;
    const seconds = BigInt(date.getTime() / 1000);
    let result = seconds;
    if (dateOnly) result = seconds / 86400n;
    else if (name.startsWith('Timestamp'))
        result = seconds * SECOND + BigInt(fraction.padEnd(6, '0'));
    return isDateValue(String(result), name) ? String(result) : undefined;
}
