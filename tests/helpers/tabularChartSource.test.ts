import {describe, expect, it, vi} from 'vitest';
import {createTabularChartSource} from '../../src/helpers/createTabularChartSource';
import {
    extractChartDefinition,
    restoreChartDefinition,
    validateChartDefinition,
} from '../../src/helpers/chartDefinitions';
import type {TabularChartField, TabularChartType} from '../../src/types/tabularChartSource';
import type {ChartXYConfiguration} from '../../src/types/chartConfiguration';
import {validateChartConfiguration} from '../../src/helpers/validateChartConfiguration';

const fields: TabularChartField[] = [
    {id: 'category', name: 'Category', type: 'string'},
    {id: 'a', name: 'A', type: 'number'},
    {id: 'b', name: 'B', type: 'number'},
];
const values: ChartXYConfiguration = {
    chartType: 'line',
    dimensionFieldId: 'category',
    dimensionAxisType: 'category',
    measureItems: [
        {id: 'first', fieldId: 'a'},
        {id: 'second', fieldId: 'b'},
    ],
    chartTitle: 'Saved',
    xTitle: 'Category',
    yTitle: 'Count',
    showLegend: true,
};
function source(rows: Record<string, unknown>[], schema = fields) {
    return createTabularChartSource({fields: schema, rows, getValue: (row, id) => row[id]});
}

describe('tabular chart source', () => {
    it.each<TabularChartType>(['line', 'area', 'scatter', 'bar-x', 'bar-y', 'pie'])(
        'builds %s and retains field bindings',
        (type) => {
            const adapter = source([{category: 'C', a: 4, b: 7}]);
            const initial = adapter.getInitialFormValues(type);
            const checked = validateChartConfiguration(initial);
            if (!checked.valid) throw new Error('Incomplete initial configuration');
            const result = adapter.resolveChartData(checked.configuration);
            expect(result.status).toBe('ready');
            if (result.status !== 'ready') return;
            expect(result.data.series.data[0].type).toBe(type);
            expect(result.data.series.data[0].data).toEqual(
                type === 'pie'
                    ? [{name: 'C', value: 4}]
                    : type === 'bar-y'
                      ? [{x: 4, y: 'C'}]
                      : [{x: 'C', y: 4}],
            );
            if (type === 'bar-y') {
                expect(result.data.xAxis?.type).toBe('linear');
                expect(result.data.yAxis?.[0].type).toBe('category');
            }
        },
    );

    it('keeps first-seen categories stable when measure order or gaps change, without aggregating rows', () => {
        const adapter = source([
            {category: 'B', a: null, b: 1},
            {category: 'A', a: 2, b: null},
            {category: 'B', a: 3, b: 4},
        ]);
        const data = adapter.getChartData(values)!;
        const reversed = adapter.getChartData({
            ...values,
            measureItems: [...values.measureItems].reverse(),
        })!;
        expect(data.xAxis?.categories).toEqual(['B', 'A']);
        expect(reversed.xAxis?.categories).toEqual(['B', 'A']);
        expect(reversed.series.data.map(({seriesId}) => seriesId)).toEqual(['second', 'first']);
        expect(data.series.data[1].data).toEqual([
            {x: 'B', y: 1},
            {x: 'B', y: 4},
        ]);
    });

    it('rejects missing, nonnumeric and infinite values without converting them to zero', () => {
        const rows = [null, undefined, '', '5', NaN, Infinity, 0].map((a) => ({category: 'C', a}));
        const data = source(rows).getChartData({
            ...values,
            measureItems: [values.measureItems[0]],
        })!;
        expect(data.series.data[0].data).toEqual([{x: 'C', y: 0}]);
    });

    it('uses schema with empty rows and distinguishes absent fields from absent data', () => {
        const adapter = source([]);
        expect(adapter.getFieldOptions({chartType: 'line', role: 'measure'})).toHaveLength(2);
        expect(adapter.resolveChartData(values)).toEqual({status: 'empty-data'});
        expect(source([], fields.slice(0, 2)).resolveChartData(values)).toEqual({
            status: 'missing-fields',
            fieldIds: ['b'],
        });
    });

    it('uses millisecond dates as supplied and inspects only selected fields', () => {
        const getValue = vi.fn((row: Record<string, unknown>, id: string) => row[id]);
        const adapter = createTabularChartSource({
            fields: [{id: 'time', name: 'Time', type: 'datetime'}, ...fields.slice(1)],
            rows: [{time: 1234, a: 2, b: 9}],
            getValue,
        });
        const initial = adapter.getInitialFormValues('line');
        expect(getValue).not.toHaveBeenCalled();
        if (initial.chartType !== 'line') throw new Error('Unexpected type');
        expect(initial.dimensionAxisType).toBe('datetime');
        expect(adapter.getChartData(initial)?.series.data[0].data).toEqual([{x: 1234, y: 2}]);
        expect(getValue.mock.calls.map((call) => call[1])).toEqual(['time', 'a']);
    });

    it('reports unsupported types and disallowed selections', () => {
        const adapter = createTabularChartSource({
            fields,
            rows: [],
            getValue: () => undefined,
            chartTypes: ['pie'],
        });
        expect(adapter.resolveChartData(values)).toEqual({status: 'unsupported-type'});
        expect(
            source([]).resolveChartData({
                ...values,
                measureItems: [{id: 'x', fieldId: 'category'}],
            }),
        ).toEqual({status: 'invalid-selection'});
    });
});

describe('saved chart definitions', () => {
    it('leaves appearance to the editor or restoration, including through the legacy adapter', () => {
        const adapter = source([{category: 'C', a: 1, b: 2}]);
        const result = adapter.resolveChartData(values);
        expect(result.status).toBe('ready');
        if (result.status !== 'ready') throw new Error('Missing chart data');
        expect(result.data).not.toHaveProperty('title');
        expect(result.data).not.toHaveProperty('legend');
        expect(result.data.xAxis).not.toHaveProperty('title');
        expect(adapter.getChartData(values)).toEqual(result.data);
        const restored = restoreChartDefinition(
            {version: 1, id: 'chart', fieldsFormValues: values},
            adapter.resolveChartData,
        );
        if (restored.status !== 'ready') throw new Error('Not restored');
        expect(restored.item.chartData.title?.text).toBe(values.chartTitle);
        expect(restored.item.chartData.legend?.enabled).toBe(true);
        expect(restored.item.chartData.xAxis?.title?.text).toBe(values.xTitle);
    });

    it('round trips appearance and series order without persisting data', () => {
        const adapter = source([{category: 'C', a: 1, b: 2}]);
        const extracted = extractChartDefinition({
            id: 'chart',
            chartData: adapter.getChartData(values)!,
            fieldsFormValues: values,
        });
        expect(extracted.valid).toBe(true);
        if (!extracted.valid) return;
        const parsed = validateChartDefinition(JSON.parse(JSON.stringify(extracted.definition)));
        expect(parsed).toEqual(extracted);
        expect(JSON.stringify(extracted.definition)).not.toContain('series');
        const restored = restoreChartDefinition(extracted.definition, adapter.resolveChartData);
        if (restored.status !== 'ready') throw new Error('Not restored');
        expect(restored.item.chartData.title?.text).toBe('Saved');
        expect(restored.item.chartData.legend?.enabled).toBe(true);
        expect(extractChartDefinition(restored.item)).toEqual(extracted);
    });

    it('preserves temporarily missing definitions and restores them with the same ID', () => {
        const definition = {version: 1 as const, id: 'chart', fieldsFormValues: values};
        const result = restoreChartDefinition(definition, source([], []).resolveChartData);
        expect(result.status).toBe('missing-fields');
        expect(result.definition).toBe(definition);
        const ready = restoreChartDefinition(
            result.definition,
            source([{category: 'C', a: 1, b: 2}]).resolveChartData,
        );
        expect(ready.status).toBe('ready');
    });

    it.each([
        null,
        {},
        {version: 2},
        {version: 1, id: '', fieldsFormValues: values},
        {version: 1, id: 'x', fieldsFormValues: {...values, dimensionFieldId: undefined}},
        {
            version: 1,
            id: 'x',
            fieldsFormValues: {...values, measureItems: [{id: '', fieldId: 'a'}]},
        },
        {
            version: 1,
            id: 'x',
            fieldsFormValues: {...values, measureItems: [{id: 'row', fieldId: null}]},
        },
        {version: 1, id: 'x', fieldsFormValues: {...values, chartType: 'unknown'}},
        {
            version: 1,
            id: 'x',
            fieldsFormValues: {
                ...values,
                measureItems: [values.measureItems[0], values.measureItems[0]],
            },
        },
    ])('diagnoses invalid persisted input %j', (input) => {
        const result = validateChartDefinition(input);
        expect(result.valid).toBe(false);
        if (!result.valid) expect(result.issues).toHaveLength(1);
    });
});
