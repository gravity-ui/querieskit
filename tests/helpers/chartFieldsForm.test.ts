import {describe, expect, it} from 'vitest';
import {
    changeChartFieldsType,
    createChartFieldsFormValues,
    isChartFieldsChartType,
    isChartFieldsFormComplete,
} from '../../src/helpers/chartFieldsForm';
import type {
    ChartFieldsChartType,
    ChartFieldsFormProps,
    ChartSelectedFormValues,
    ChartXYFormValues,
} from '../../src/types/chartEditor';

const types: ChartFieldsChartType[] = [
    'line',
    'area',
    'scatter',
    'bar-x',
    'bar-y',
    'pie',
    'treemap',
    'sankey',
];
const columns = ['time', 'region', 'service', 'requests', 'cost', 'source', 'target'].map(
    (value) => ({value, content: value}),
);
const config: Pick<ChartFieldsFormProps, 'chartTypeOptions' | 'getFieldOptions' | 'axisVariants'> =
    {
        chartTypeOptions: types.map((value) => ({value, content: value})),
        getFieldOptions: () => columns,
    };
const xy: ChartXYFormValues = {
    chartType: 'line',
    dimensionFieldId: 'time',
    dimensionAxisType: 'datetime',
    measureItems: [
        {id: 'a', fieldId: 'requests'},
        {id: 'b', fieldId: 'cost'},
    ],
    xTitle: 'Time',
    yTitle: 'Count',
    chartTitle: 'Traffic',
    showLegend: true,
};
const pie: ChartSelectedFormValues = {
    chartType: 'pie',
    categoryFieldId: 'service',
    valueFieldId: 'requests',
};
const treemap: ChartSelectedFormValues = {
    chartType: 'treemap',
    levels: [
        {id: 'region-level', fieldId: 'region'},
        {id: 'service-level', fieldId: 'service'},
    ],
    valueFieldId: 'requests',
};
const sankey: ChartSelectedFormValues = {
    chartType: 'sankey',
    sourceFieldId: 'source',
    targetFieldId: 'target',
    valueFieldId: 'requests',
};

describe('chart column bindings', () => {
    it.each(types)('creates an incomplete draft for %s', (type) => {
        const draft = createChartFieldsFormValues(type);
        expect(draft.chartType).toBe(type);
        expect(isChartFieldsFormComplete(draft, config)).toBe(false);
        if ('measureItems' in draft) {
            expect(draft.measureItems).toEqual([{id: expect.any(String)}]);
            expect(draft.dimensionAxisType).toBe('category');
        }
        if ('levels' in draft) expect(draft.levels).toEqual([{id: expect.any(String)}]);
    });

    it.each([
        xy,
        {...xy, chartType: 'bar-y'},
        pie,
        treemap,
        sankey,
    ] satisfies ChartSelectedFormValues[])('validates the fields for $chartType', (values) => {
        expect(isChartFieldsFormComplete(values, config)).toBe(true);
        expect(isChartFieldsFormComplete(values, {...config, getFieldOptions: () => []})).toBe(
            false,
        );
        expect(
            isChartFieldsFormComplete(values, {
                ...config,
                chartTypeOptions: config.chartTypeOptions.map((item) => ({
                    ...item,
                    disabled: true,
                })),
            }),
        ).toBe(false);
    });

    it('validates role-specific columns instead of accepting any known column', () => {
        const options: ChartFieldsFormProps['getFieldOptions'] = ({role}) =>
            columns.filter(({value}) =>
                role === 'value' ? value === 'requests' : value === 'service',
            );
        expect(isChartFieldsFormComplete(pie, {...config, getFieldOptions: options})).toBe(true);
        expect(
            isChartFieldsFormComplete(
                {...pie, valueFieldId: 'service'},
                {...config, getFieldOptions: options},
            ),
        ).toBe(false);
    });

    it('rejects empty selections, unavailable scales and duplicate rows or levels', () => {
        expect(isChartFieldsFormComplete({}, config)).toBe(false);
        expect(isChartFieldsFormComplete(xy, {...config, axisVariants: ['category']})).toBe(false);
        expect(isChartFieldsFormComplete({...xy, measureItems: []}, config)).toBe(false);
        expect(
            isChartFieldsFormComplete(
                {
                    ...xy,
                    measureItems: [
                        {id: 'a', fieldId: 'requests'},
                        {id: 'b', fieldId: 'requests'},
                    ],
                },
                config,
            ),
        ).toBe(false);
        expect(
            isChartFieldsFormComplete(
                {
                    ...xy,
                    measureItems: [
                        {id: 'a', fieldId: 'requests'},
                        {id: 'a', fieldId: 'cost'},
                    ],
                },
                config,
            ),
        ).toBe(false);
        expect(
            isChartFieldsFormComplete(
                {
                    ...treemap,
                    levels: [
                        {id: 'a', fieldId: 'region'},
                        {id: 'b', fieldId: 'region'},
                    ],
                },
                config,
            ),
        ).toBe(false);
        expect(isChartFieldsFormComplete({...sankey, targetFieldId: 'source'}, config)).toBe(false);
    });

    it('keeps compatible XY bindings and swaps physical titles for horizontal bars', () => {
        const horizontal = changeChartFieldsType(xy, 'bar-y', config);
        expect(horizontal).toEqual({...xy, chartType: 'bar-y', xTitle: 'Count', yTitle: 'Time'});
        expect(changeChartFieldsType(horizontal, 'area', config)).toEqual({
            ...xy,
            chartType: 'area',
        });
        expect(xy.chartType).toBe('line');
        expect(xy.measureItems[0].fieldId).toBe('requests');
    });

    it('clears fields no longer available in a compatible destination without changing row order', () => {
        const next = changeChartFieldsType(xy, 'scatter', {
            ...config,
            axisVariants: ['linear'],
            getFieldOptions: ({role}) =>
                role === 'dimension' ? [] : columns.filter(({value}) => value === 'cost'),
        });
        expect(next).toEqual({
            ...xy,
            chartType: 'scatter',
            dimensionFieldId: undefined,
            dimensionAxisType: undefined,
            measureItems: [
                {id: 'a', fieldId: undefined},
                {id: 'b', fieldId: 'cost'},
            ],
        });
    });

    it('resets incompatible families, retaining only common appearance and no old draft cache', () => {
        const next = changeChartFieldsType(xy, 'pie', config);
        expect(next).toEqual({
            chartType: 'pie',
            chartTitle: 'Traffic',
            showLegend: true,
            categoryFieldId: undefined,
            valueFieldId: undefined,
        });
        const back = changeChartFieldsType(next, 'line', config);
        expect(back).toMatchObject({
            chartType: 'line',
            chartTitle: 'Traffic',
            showLegend: true,
            dimensionAxisType: 'category',
            measureItems: [{id: expect.any(String)}],
        });
        expect('dimensionFieldId' in back && back.dimensionFieldId).toBeUndefined();
        expect('xTitle' in back).toBe(false);
    });

    it('preserves a same-family initialization and rejects unsupported chart types', () => {
        expect(changeChartFieldsType(treemap, 'treemap', config)).toEqual(treemap);
        expect(isChartFieldsChartType('heatmap')).toBe(false);
        expect(isChartFieldsChartType('waterfall')).toBe(false);
        expect(isChartFieldsChartType('pie')).toBe(true);
    });
});
