import {describe, expect, it} from 'vitest';
import {validateChartConfiguration} from '../../src/helpers/validateChartConfiguration';
import {isChartFieldsFormComplete} from '../../src/helpers/chartFieldsForm';
import type {ChartConfiguration} from '../../src/types/chartConfiguration';
import type {ChartFieldsFormProps} from '../../src/types/chartEditor';

const xy = {
    chartType: 'line',
    dimensionFieldId: 'time',
    dimensionAxisType: 'datetime',
    measureItems: [{id: 'measure', fieldId: 'value'}],
    chartTitle: 'Traffic',
    showLegend: false,
    xTitle: 'Time',
    yTitle: 'Count',
} satisfies ChartConfiguration;
const pie = {
    chartType: 'pie',
    categoryFieldId: 'category',
    valueFieldId: 'value',
} as const;
const treemap = {
    chartType: 'treemap',
    levels: [{id: 'level', fieldId: 'category'}],
    valueFieldId: 'value',
} satisfies ChartConfiguration;
const sankey = {
    chartType: 'sankey',
    sourceFieldId: 'source',
    targetFieldId: 'target',
    valueFieldId: 'value',
} satisfies ChartConfiguration;
const configurations: ChartConfiguration[] = [
    xy,
    {...xy, chartType: 'area'},
    {...xy, chartType: 'scatter'},
    {...xy, chartType: 'bar-x'},
    {...xy, chartType: 'bar-y'},
    pie,
    treemap,
    sankey,
];
const available: Pick<ChartFieldsFormProps, 'chartTypeOptions' | 'getFieldOptions'> = {
    chartTypeOptions: configurations.map(({chartType}) => ({
        value: chartType,
        content: chartType,
    })),
    getFieldOptions: () =>
        ['', 'time', 'category', 'source', 'target', 'value'].map((value) => ({
            value,
            content: value,
        })),
};

describe('completed chart configurations', () => {
    it.each(configurations)('normalizes completed $chartType bindings', (configuration) => {
        const result = validateChartConfiguration({
            ...configuration,
            extra: 'not persisted',
        });
        expect(result).toEqual({valid: true, configuration});
        expect(isChartFieldsFormComplete(configuration, available)).toBe(true);
    });

    it.each([
        {...xy, dimensionFieldId: ''},
        {...xy, measureItems: [{id: 'measure', fieldId: ''}]},
        {...pie, categoryFieldId: ''},
        {...pie, valueFieldId: ''},
        {...treemap, levels: [{id: 'level', fieldId: ''}]},
        {...sankey, sourceFieldId: ''},
        {...sankey, targetFieldId: ''},
    ] satisfies ChartConfiguration[])(
        'accepts custom empty-string field IDs: %j',
        (configuration) => {
            expect(validateChartConfiguration(configuration)).toEqual({
                valid: true,
                configuration,
            });
            expect(isChartFieldsFormComplete(configuration, available)).toBe(true);
        },
    );

    it.each([
        [null, ''],
        [{}, 'chartType'],
        [{chartType: 'unknown'}, 'chartType'],
        [{...xy, dimensionFieldId: undefined}, 'dimensionFieldId'],
        [{...xy, dimensionAxisType: undefined}, 'dimensionAxisType'],
        [{...xy, dimensionAxisType: 'unsupported'}, 'dimensionAxisType'],
        [{...xy, measureItems: []}, 'measureItems'],
        [{...xy, measureItems: [{id: '', fieldId: 'value'}]}, 'measureItems.0'],
        [{...xy, measureItems: [{id: 'measure'}]}, 'measureItems.0'],
        [{...xy, measureItems: [{id: 'measure', fieldId: 123}]}, 'measureItems.0'],
        [
            {
                ...xy,
                measureItems: [
                    {id: 'same', fieldId: 'a'},
                    {id: 'same', fieldId: 'b'},
                ],
            },
            'measureItems.1',
        ],
        [
            {
                ...xy,
                measureItems: [
                    {id: 'a', fieldId: 'same'},
                    {id: 'b', fieldId: 'same'},
                ],
            },
            'measureItems.1',
        ],
        [{...pie, categoryFieldId: undefined}, 'categoryFieldId'],
        [{...pie, valueFieldId: undefined}, 'valueFieldId'],
        [{...treemap, levels: []}, 'levels'],
        [{...treemap, levels: [{id: 'level'}]}, 'levels.0'],
        [{...sankey, sourceFieldId: undefined}, 'sourceFieldId'],
        [{...sankey, targetFieldId: 'source'}, 'targetFieldId'],
        [{...xy, chartTitle: 42}, 'chartTitle'],
        [{...xy, showLegend: 'yes'}, 'showLegend'],
        [{...xy, xTitle: 42}, 'xTitle'],
    ])('rejects invalid structure %j with a stable issue path', (input, path) => {
        const result = validateChartConfiguration(input);
        expect(result.valid).toBe(false);
        if (result.valid) throw new Error('Invalid configuration was accepted');
        expect(result.issues).toEqual([
            {
                code: path === 'chartType' ? 'unsupported-type' : 'invalid-definition',
                path,
            },
        ]);
    });

    it('shares structural rejection with form completion, independently of available fields', () => {
        const invalid = {...xy, measureItems: [{id: '', fieldId: 'value'}]};
        expect(isChartFieldsFormComplete(invalid, available)).toBe(false);
        expect(validateChartConfiguration(invalid).valid).toBe(false);
    });

    it('preserves bindings when their fields are temporarily unavailable', () => {
        expect(
            isChartFieldsFormComplete(xy, {
                ...available,
                getFieldOptions: () => [],
            }),
        ).toBe(false);
        expect(validateChartConfiguration(xy)).toEqual({
            valid: true,
            configuration: xy,
        });
        expect(isChartFieldsFormComplete(xy, available)).toBe(true);
    });

    it('omits unknown properties without mutating bindings or changing series order', () => {
        const input = {
            ...xy,
            measureItems: [
                {id: 'b', fieldId: 'second', extra: true},
                {id: 'a', fieldId: 'first'},
            ],
        };
        const result = validateChartConfiguration(input);
        expect(result).toEqual({
            valid: true,
            configuration: {
                ...xy,
                measureItems: [
                    {id: 'b', fieldId: 'second'},
                    {id: 'a', fieldId: 'first'},
                ],
            },
        });
        expect(input.measureItems[0]).toHaveProperty('extra', true);
    });
});
