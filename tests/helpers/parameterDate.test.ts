import {describe, expect, it} from 'vitest';

import {
    getParameterCalendarDate,
    updateParameterDate,
} from '../../src/modules/QueryParameters/internal/parameterDate';

describe('parameter calendar dates', () => {
    it.each([
        ['Timestamp', '2025-02-15T12:34:56.123456Z', '2026-03-10T12:34:56.123456Z'],
        [
            'TzTimestamp',
            '2025-02-15T12:34:56.000001,Europe/Moscow',
            '2026-03-10T12:34:56.000001,Europe/Moscow',
        ],
        ['Datetime64', '2025-02-15T12:34:56+05:30', '2026-03-10T12:34:56+05:30'],
        ['TzDate', '2025-02-15,America/New_York', '2026-03-10,America/New_York'],
        ['Date', '2025-02-15', '2026-03-10'],
    ])('preserves the exact suffix for %s', (kind, value, expected) => {
        expect(updateParameterDate(value, '2026-03-10', kind)).toBe(expected);
    });

    it.each([
        ['Date32', '2026-03-10'],
        ['Datetime64', '2026-03-10T00:00:00Z'],
        ['Timestamp64', '2026-03-10T00:00:00.000000Z'],
        ['TzDate32', '2026-03-10,Etc/UTC'],
        ['TzDatetime64', '2026-03-10T00:00:00,Etc/UTC'],
        ['TzTimestamp64', '2026-03-10T00:00:00.000000,Etc/UTC'],
    ])('initializes an empty %s', (kind, expected) => {
        expect(updateParameterDate('', '2026-03-10', kind)).toBe(expected);
    });

    it('reads the written calendar date without shifting it for its timezone', () => {
        expect(
            getParameterCalendarDate('2026-03-10T00:00:00.123456+14:00')?.format('YYYY-MM-DD'),
        ).toBe('2026-03-10');
    });

    it.each(['', 'invalid', '2026-02-30', '2026-13-01'])(
        'ignores invalid calendar date %s',
        (value) => {
            expect(getParameterCalendarDate(value)).toBeNull();
        },
    );
});
