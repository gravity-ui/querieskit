import {dateTime} from '@gravity-ui/date-utils';
import {describe, expect, it} from 'vitest';
import {durationDates} from '../../src/helpers/time';

const MINUTE = 60_000;
const START = Date.UTC(2024, 0, 15, 12, 0, 0);

describe('durationDates', () => {
    it.each([
        ['zero interval', 0, '00:00'],
        ['interval under a minute', 59_999, '00:00'],
        ['five minutes', 5 * MINUTE, '00:05'],
        ['more than an hour', 190 * MINUTE, '03:10'],
        ['more than a day', 1_635 * MINUTE, '27:15'],
        ['three-digit hours', 6_007 * MINUTE, '100:07'],
    ])('formats %s without applying the local timezone', (_name, diff, expected) => {
        expect(durationDates(START, START + diff)).toBe(expected);
    });

    it('clamps a negative interval to zero', () => {
        expect(durationDates(START, START - MINUTE)).toBe('00:00');
    });

    it('treats the Unix epoch as a valid timestamp', () => {
        expect(durationDates(0, 5 * MINUTE)).toBe('00:05');
    });

    it('supports ISO strings with an explicit timezone offset', () => {
        expect(durationDates('2024-01-15T12:00:00+03:00', '2024-01-15T15:10:00+03:00')).toBe(
            '03:10',
        );
    });

    it('supports DateTime values', () => {
        expect(
            durationDates(
                dateTime({input: START}),
                dateTime({input: START + 27 * 60 * MINUTE + 15 * MINUTE}),
            ),
        ).toBe('27:15');
    });

    it.each([
        [undefined, START],
        [START, undefined],
        ['', START],
        [START, 'incorrect-date'],
        [Number.NaN, START],
        [START, Number.POSITIVE_INFINITY],
    ])('returns a placeholder for invalid or missing dates', (start, end) => {
        expect(durationDates(start, end)).toBe('--:--');
    });
});
