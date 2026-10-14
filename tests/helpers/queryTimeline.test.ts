import {describe, expect, it} from 'vitest';
import type {QueryTimelineItem} from '../../src/types/queryTimeline';
import {
    createRows,
    extent,
    filterItems,
    getWindow,
    hasOpenIntervals,
    itemInterval,
    normalizeRange,
    preserveScroll,
    progressFraction,
    resolveInterval,
    statusOptions,
    validateTimeline,
} from '../../src/modules/QueryTimeline/helpers/model';

const items: QueryTimelineItem[] = [
    {
        id: 'a',
        label: 'First item',
        status: 'custom',
        interval: {start: 0, end: 1000},
        stages: [
            {id: 'a', label: 'First stage', interval: {start: 0, end: 200}},
            {id: 'b', label: 'Overlap', interval: {start: 100, end: 500}},
            {id: 'c', label: 'After a gap', interval: {start: 800, end: 1000}},
        ],
    },
    {id: 'b', label: 'Second item', status: 'custom', interval: {start: 2000}},
    {id: 'c', label: 'Pending', status: 'unknown'},
];
const validate = (data: QueryTimelineItem[]) => validateTimeline(data, [], [], 3000, 32, 360);

describe('timeline model', () => {
    it('preserves timestamps, gaps, overlaps, order and distinct identities', () => {
        const rows = createRows(items, new Set(['a']), 3000);
        expect(rows.map((row) => row.interval)).toEqual([
            {from: 0, to: 1000},
            {from: 0, to: 200},
            {from: 100, to: 500},
            {from: 800, to: 1000},
            {from: 2000, to: 3000},
            undefined,
        ]);
        expect(new Set(rows.map((row) => row.id)).size).toBe(rows.length);
        expect(rows[1].stage).toBe(items[0].stages![0]);
        expect(rows[0].item).toBe(items[0]);
    });
    it('filters parent labels and arbitrary statuses without counting stages', () => {
        expect(filterItems(items, '  FIRST ', 'custom')).toEqual([items[0]]);
        expect(filterItems(items, 'stage')).toEqual([]);
        expect(statusOptions(items, [{id: 'custom', label: 'Custom'}])).toEqual([
            {value: 'custom', content: 'Custom (2)'},
            {value: 'unknown', content: 'unknown (1)'},
        ]);
    });
    it('derives parent extent from stages but prefers an explicit interval', () => {
        expect(itemInterval({...items[0], interval: undefined}, 3000)).toEqual({from: 0, to: 1000});
        expect(itemInterval({...items[0], interval: {start: 100, end: 900}}, 3000)).toEqual({
            from: 100,
            to: 900,
        });
        expect(extent([])).toBeUndefined();
    });
    it('accepts zero timestamps and zero duration, handles future open intervals', () => {
        expect(() =>
            validate([{id: 'zero', label: '', interval: {start: 0, end: 0}}]),
        ).not.toThrow();
        expect(resolveInterval({start: 5000}, 3000)).toEqual({from: 5000, to: 5000});
        expect(normalizeRange({from: 0, to: 0})).toEqual({from: -500, to: 500});
        expect(hasOpenIntervals(items)).toBe(true);
        expect(hasOpenIntervals([items[0]])).toBe(false);
    });
    it.each([NaN, Infinity, -Infinity])('rejects invalid timestamps: %s', (start) => {
        expect(() => validate([{id: 'bad', label: '', interval: {start}}])).toThrow(
            'Invalid interval',
        );
    });
    it('rejects reversed intervals and duplicate IDs', () => {
        expect(() => validate([{id: 'bad', label: '', interval: {start: 10, end: 0}}])).toThrow();
        expect(() => validate([items[0], items[0]])).toThrow('Duplicate item');
        expect(() =>
            validate([{...items[0], stages: [items[0].stages![0], items[0].stages![0]]}]),
        ).toThrow('Duplicate stage');
    });
    it('honors fraction precedence and clamps progress', () => {
        expect(progressFraction({fraction: 0, completed: 10, total: 10})).toBe(0);
        expect(progressFraction({completed: 5, total: 10})).toBe(0.5);
        expect(progressFraction({completed: 20, total: 10})).toBe(1);
        expect(progressFraction({fraction: -1})).toBe(0);
        expect(progressFraction({total: 0})).toBeUndefined();
    });
    it('bounds the virtual window independently of total row count', () => {
        expect(getWindow(5000, 32000, 320, 32)).toEqual({start: 990, end: 1020});
        expect(getWindow(3, 0, 320, 32)).toEqual({start: 0, end: 3});
    });
    it('preserves the top row when rows above it are collapsed', () => {
        const expanded = createRows(items, new Set(['a']), 3000);
        const collapsed = createRows(items, new Set(), 3000);
        expect(preserveScroll(expanded, collapsed, 4 * 32 + 5, 32, 32, 32)).toBe(37);
        expect(preserveScroll(expanded, [], 128, 320, 32, 32)).toBe(0);
    });
});
