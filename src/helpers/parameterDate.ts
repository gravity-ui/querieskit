function validateInterval(value: string): boolean {
    const match =
        /^-?P(?:(\d+)W)?(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)(?:\.(\d{1,6}))?S)?)?$/.exec(
            value,
        );
    return Boolean(match && match.slice(1).some(Boolean) && !value.endsWith('T'));
}

/** Validate UI date text; engine-specific date and interval ranges belong to the application. */
export function validateDateValue(value: string, kind: string): boolean {
    if (kind === 'Interval' || kind === 'Interval64') return validateInterval(value);
    if (!/^(Date(?:32)?|Datetime(?:64)?|Timestamp(?:64)?)$/.test(kind)) return false;

    const extended = /(?:32|64)$/.test(kind);
    const yearPattern = extended ? '[+-]?\\d{1,6}' : '\\d{4}';
    const dateOnly = /^Date(?:32)?$/.test(kind);
    const fraction = kind.startsWith('Timestamp') ? '(?:\\.\\d{1,6})?' : '';
    const pattern = new RegExp(
        `^(${yearPattern})-(\\d{2})-(\\d{2})${dateOnly ? '' : `T(\\d{2}):(\\d{2}):(\\d{2})${fraction}Z`}$`,
    );
    const match = pattern.exec(value);
    if (!match) return false;

    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    if (year === 0 || month < 1 || month > 12) return false;

    // There is no year zero in the input; use astronomical years for leap-year arithmetic.
    const calendarYear = year < 0 ? year + 1 : year;
    const leapYear =
        calendarYear % 4 === 0 && (calendarYear % 100 !== 0 || calendarYear % 400 === 0);
    const daysInMonth = [31, leapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    return (
        day >= 1 &&
        day <= daysInMonth[month - 1] &&
        (dateOnly || (Number(match[4]) <= 23 && Number(match[5]) <= 59 && Number(match[6]) <= 59))
    );
}
