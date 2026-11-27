import {describe, expect, it} from 'vitest';
import {fitQueryToVisibleLines} from '../../src/components/SearchRowLayout/helpers/fitQueryToVisibleLines';

const lines = Array.from({length: 20}, (_, index) => `SELECT ${index + 1};`);
const query = lines.join('\n');

describe('fitQueryToVisibleLines', () => {
    it.each([
        [undefined, 1],
        [1, 1],
        [2, 1],
        [3, 2],
        [12, 11],
        [19, 17],
        [20, 17],
        [100, 17],
        [Number.MAX_SAFE_INTEGER, 17],
        [0, 1],
        [-100, 1],
    ])('positions target %s at range starting with %s', (target, startLineNumber) => {
        expect(fitQueryToVisibleLines(query, target)).toEqual({
            query: lines.slice(startLineNumber - 1, startLineNumber + 3).join('\n'),
            startLineNumber,
        });
    });

    it.each([NaN, Infinity, -Infinity, 1.5, '12', null, {}, true])(
        'falls back to the first four lines for invalid position %s',
        (target) => {
            expect(fitQueryToVisibleLines(query, target as number)).toEqual({
                query: lines.slice(0, 4).join('\n'),
                startLineNumber: 1,
            });
        },
    );

    it.each(['\n', '\r\n', '\r'])('supports line separator %j', (separator) => {
        const original = lines.join(separator);
        expect(fitQueryToVisibleLines(original, 12)).toEqual({
            query: 'SELECT 11;\nSELECT 12;\nSELECT 13;\nSELECT 14;',
            startLineNumber: 11,
        });
        expect(original).toBe(lines.join(separator));
    });

    it.each([
        ['', '\n\n\n'],
        ['SELECT 1;', 'SELECT 1;\n\n\n'],
        ['SELECT 1;\nSELECT 2;', 'SELECT 1;\nSELECT 2;\n\n'],
        ['SELECT 1;\n', 'SELECT 1;\n\n\n'],
    ])('pads short query %j without shifting its start', (input, expected) => {
        for (const position of [undefined, 1, 2, 100]) {
            expect(fitQueryToVisibleLines(input, position)).toEqual({
                query: expected,
                startLineNumber: 1,
            });
        }
    });

    it('accepts an omitted query', () => {
        expect(fitQueryToVisibleLines()).toEqual({query: '\n\n\n', startLineNumber: 1});
    });

    it('retains empty lines and whitespace inside a selected fragment', () => {
        expect(fitQueryToVisibleLines('first\nsecond\n  third\n\nfifth\nsixth', 4)).toEqual({
            query: '  third\n\nfifth\nsixth',
            startLineNumber: 3,
        });
    });
});
