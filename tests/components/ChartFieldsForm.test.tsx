// @vitest-environment jsdom

import React, {act} from 'react';
import {ThemeProvider} from '@gravity-ui/uikit';
import {createRoot} from 'react-dom/client';
import type {Root} from 'react-dom/client';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {ChartFieldsForm} from '../../src/components/ChartFieldsForm';
import type {ChartFieldsFormProps, ChartXYFormValues} from '../../src/types/chartEditor';

vi.mock('@gravity-ui/uikit', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@gravity-ui/uikit')>();
    return {
        ...actual,
        Select: (props: {
            'aria-label'?: string;
            value?: string[];
            disabled?: boolean;
            options?: {value: string; content?: React.ReactNode; disabled?: boolean}[];
            onUpdate?: (value: string[]) => void;
        }) => (
            <select
                aria-label={props['aria-label']}
                value={props.value?.[0] ?? ''}
                disabled={props.disabled}
                onChange={(event) => props.onUpdate?.([event.target.value])}
            >
                <option value="" />
                {props.options?.map((option, index) => (
                    <option key={index} value={option.value} disabled={option.disabled}>
                        {option.content}
                    </option>
                ))}
            </select>
        ),
    };
});

const fields = [
    {value: 'time', content: 'Time'},
    {value: 'count', content: 'Count'},
    {value: 'size', content: 'Size'},
];
const validValues: ChartXYFormValues = {
    chartType: 'line',
    dimensionAxisType: 'linear',
    dimensionFieldId: 'time',
    measureItems: [{id: 'first', fieldId: 'count'}],
    chartTitle: 'Requests',
    xTitle: 'Date',
    yTitle: 'Total',
    showLegend: true,
};

describe('ChartFieldsForm', () => {
    let container: HTMLDivElement;
    let root: Root;

    beforeEach(() => {
        globalThis.IS_REACT_ACT_ENVIRONMENT = true;
        vi.stubGlobal(
            'ResizeObserver',
            class {
                public observe() {}
                public unobserve() {}
                public disconnect() {}
            },
        );
        container = document.createElement('div');
        document.body.append(container);
        root = createRoot(container);
    });

    afterEach(() => {
        act(() => root.unmount());
        container.remove();
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
    });

    function render(props: Partial<ChartFieldsFormProps> = {}) {
        act(() =>
            root.render(
                <ThemeProvider>
                    <ChartFieldsForm
                        chartTypeOptions={
                            ['line', 'pie', 'treemap', 'sankey'].map((value) => ({
                                value,
                                content: value,
                            })) as ChartFieldsFormProps['chartTypeOptions']
                        }
                        getFieldOptions={() => fields}
                        formValues={validValues}
                        {...props}
                    />
                </ThemeProvider>,
            ),
        );
    }

    function button(label: string) {
        const found = [...container.querySelectorAll<HTMLButtonElement>('button')].find(
            (element) =>
                element.getAttribute('aria-label') === label || element.textContent === label,
        );
        expect(found, `button ${label}`).toBeDefined();
        if (!found) throw new Error(`Missing button ${label}`);
        return found;
    }

    it('adds empty rows and removes individual rows without changing other values or identities', () => {
        const onFormValuesChange = vi.fn();
        render({onFormValuesChange});
        act(() => button('Add item').click());

        const added = onFormValuesChange.mock.lastCall?.[0] as ChartXYFormValues;
        expect(added).toEqual({
            ...validValues,
            measureItems: [validValues.measureItems[0], {id: expect.any(String)}],
        });
        expect(added.measureItems[1].id).not.toBe('first');
        // The form is controlled: the new row only appears after the parent accepts it.
        expect(container.querySelector('[aria-label="Y 2"]')).toBeNull();
        render({formValues: added, onFormValuesChange});
        expect(container.querySelector('[aria-label="Y 2"]')).not.toBeNull();
        act(() => button('Remove item 1').click());
        expect(onFormValuesChange).toHaveBeenLastCalledWith({
            ...added,
            measureItems: [added.measureItems[1]],
        });

        const remaining = {...added, measureItems: [added.measureItems[1]]};
        render({formValues: remaining, onFormValuesChange});
        act(() => button('Remove item 1').click());
        expect(onFormValuesChange).toHaveBeenLastCalledWith({...remaining, measureItems: []});
    });

    it('reflects a parent reset without emitting changes', () => {
        const onFormValuesChange = vi.fn();
        render({onFormValuesChange});
        render({formValues: {}, onFormValuesChange});
        expect(container.querySelector('[aria-label="Y 1"]')).toBeNull();
        expect(button('Add chart').disabled).toBe(true);
        expect(onFormValuesChange).not.toHaveBeenCalled();
    });

    it.each([
        {dimensionAxisType: undefined},
        {dimensionFieldId: undefined},
        {dimensionFieldId: 'missing'},
        {measureItems: []},
        {measureItems: [{id: 'empty'}]},
        {measureItems: [{id: 'missing', fieldId: 'missing'}]},
        {
            measureItems: [
                {id: 'a', fieldId: 'count'},
                {id: 'b', fieldId: 'count'},
            ],
        },
    ] satisfies Partial<ChartXYFormValues>[])(
        'rejects incomplete or invalid selection %j',
        (patch) => {
            const onSubmit = vi.fn();
            render({formValues: {...validValues, ...patch}, onSubmit});
            expect(button('Add chart').disabled).toBe(true);
            act(() => button('Add chart').click());
            expect(onSubmit).not.toHaveBeenCalled();
        },
    );

    it('allows the same field on X and Y and submits valid values', () => {
        const onSubmit = vi.fn();
        render({formValues: {...validValues, dimensionFieldId: 'count'}, onSubmit});
        expect(button('Add chart').disabled).toBe(false);
        act(() => button('Add chart').click());
        expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    it('invalidates removed or disabled options without changing controlled values', () => {
        const onFormValuesChange = vi.fn();
        render({onFormValuesChange});
        expect(button('Add chart').disabled).toBe(false);
        render({
            getFieldOptions: () => fields.filter(({value}) => value !== 'count'),
            onFormValuesChange,
        });
        expect(button('Add chart').disabled).toBe(true);
        render({
            getFieldOptions: () =>
                fields.map((field) => ({...field, disabled: field.value === 'count'})),
            onFormValuesChange,
        });
        expect(button('Add chart').disabled).toBe(true);
        render({
            chartTypeOptions: [{value: 'line', content: 'Line', disabled: true}],
            onFormValuesChange,
        });
        expect(button('Add chart').disabled).toBe(true);
        render({getFieldOptions: () => [], onFormValuesChange});
        expect(button('Add chart').disabled).toBe(true);
        render({axisVariants: ['category'], onFormValuesChange});
        expect(button('Add chart').disabled).toBe(true);
        expect(onFormValuesChange).not.toHaveBeenCalled();
    });

    it('counts unique enabled Y options when limiting added rows', () => {
        render({getFieldOptions: () => [fields[1], fields[1], {...fields[2], disabled: true}]});
        expect(button('Add item').disabled).toBe(true);
        render({getFieldOptions: () => [fields[1], fields[2]]});
        expect(button('Add item').disabled).toBe(false);
    });

    it('honors disabled and consumer submit restrictions', () => {
        const onFormValuesChange = vi.fn();
        render({submitDisabled: true, onFormValuesChange});
        expect(button('Add chart').disabled).toBe(true);
        expect(button('Add item').disabled).toBe(false);
        render({disabled: true, onFormValuesChange});
        for (const element of container.querySelectorAll<HTMLButtonElement | HTMLInputElement>(
            'button, input',
        )) {
            expect(element.disabled).toBe(true);
        }
        act(() => button('Add item').click());
        act(() => button('Remove item 1').click());
        expect(onFormValuesChange).not.toHaveBeenCalled();
    });

    it('uses both dismissal controls without submitting', () => {
        const onCancel = vi.fn();
        const onSubmit = vi.fn();
        render({onCancel, onSubmit});
        act(() => button('Cancel').click());
        act(() => button('Close').click());
        expect(onCancel).toHaveBeenCalledTimes(2);
        expect(onSubmit).not.toHaveBeenCalled();
    });
    it.each([
        [
            {chartType: 'pie', categoryFieldId: 'time', valueFieldId: 'count'},
            ['Categories', 'Value'],
        ],
        [
            {chartType: 'treemap', levels: [{id: 'level', fieldId: 'time'}], valueFieldId: 'count'},
            ['Levels 1', 'Value'],
        ],
        [
            {
                chartType: 'sankey',
                sourceFieldId: 'time',
                targetFieldId: 'size',
                valueFieldId: 'count',
            },
            ['Source', 'Target', 'Flow value'],
        ],
    ] as const)('shows family-specific bindings without axes for %j', (values, names) => {
        render({
            formValues: {
                ...values,
                ...(values.chartType === 'treemap' ? {levels: [...values.levels]} : {}),
            } as ChartFieldsFormProps['formValues'],
        });
        for (const name of names)
            expect(container.querySelector(`[aria-label="${name}"]`)).not.toBeNull();
        expect(container.querySelector('[aria-label="Axis type"]')).toBeNull();
        expect(container.querySelector('[aria-label="X title"]')).toBeNull();
        expect(container.querySelector('[aria-label="Y title"]')).toBeNull();
        expect(button('Add chart').disabled).toBe(false);
    });

    it('swaps dimension and measure labels for horizontal bars', () => {
        render({
            formValues: {...validValues, chartType: 'bar-y'},
            chartTypeOptions: [{value: 'bar-y', content: 'Bar'}],
        });
        expect(container.querySelector<HTMLSelectElement>('[aria-label="Y"]')?.value).toBe('time');
        expect(container.querySelector<HTMLSelectElement>('[aria-label="X 1"]')?.value).toBe(
            'count',
        );
    });

    it('orders measures and preserves stable identities', () => {
        const onFormValuesChange = vi.fn();
        const values = {
            ...validValues,
            measureItems: [
                {id: 'a', fieldId: 'count'},
                {id: 'b', fieldId: 'size'},
            ],
        };
        render({formValues: values, onFormValuesChange});
        act(() => button('Move down 1').click());
        expect(onFormValuesChange).toHaveBeenLastCalledWith({
            ...values,
            measureItems: [values.measureItems[1], values.measureItems[0]],
        });
        expect(button('Move up 1').disabled).toBe(true);
        expect(button('Move down 2').disabled).toBe(true);
    });

    it('orders hierarchy levels and preserves values', () => {
        const onFormValuesChange = vi.fn();
        const values = {
            chartType: 'treemap' as const,
            levels: [
                {id: 'a', fieldId: 'time'},
                {id: 'b', fieldId: 'size'},
            ],
            valueFieldId: 'count',
        };
        render({formValues: values, onFormValuesChange});
        act(() => button('Move up 2').click());
        expect(onFormValuesChange).toHaveBeenLastCalledWith({
            ...values,
            levels: [values.levels[1], values.levels[0]],
        });
    });

    it('resets incompatible bindings on type change while preserving appearance', () => {
        const onFormValuesChange = vi.fn();
        render({
            onFormValuesChange,
            chartTypeOptions: [
                {value: 'line', content: 'Line'},
                {value: 'pie', content: 'Pie'},
            ],
        });
        const select = container.querySelector<HTMLSelectElement>('[aria-label="Chart type"]');
        if (!select) throw new Error('Missing chart type select');
        act(() => {
            select.value = 'pie';
            select.dispatchEvent(new Event('change', {bubbles: true}));
        });
        expect(onFormValuesChange).toHaveBeenCalledWith(
            expect.objectContaining({
                chartType: 'pie',
                chartTitle: validValues.chartTitle,
                showLegend: true,
            }),
        );
        const next = onFormValuesChange.mock.lastCall?.[0];
        expect(next).not.toHaveProperty('dimensionFieldId');
        expect(next).not.toHaveProperty('measureItems');
        expect(next).not.toHaveProperty('xTitle');
        expect(next).not.toHaveProperty('yTitle');
    });
    it.each(['line', 'area', 'scatter', 'bar-x'] as const)(
        'shows XY bindings and axis configuration for %s',
        (chartType) => {
            render({
                formValues: {...validValues, chartType},
                chartTypeOptions: [{value: chartType, content: chartType}],
            });
            for (const label of ['X', 'Y 1', 'Axis type', 'X title', 'Y title']) {
                expect(container.querySelector(`[aria-label="${label}"]`)).not.toBeNull();
            }
            expect(button('Add chart').disabled).toBe(false);
        },
    );

    it('uses role-specific options for the active chart family', () => {
        const getFieldOptions = vi.fn(({role}: {role: string}) =>
            role === 'category' ? [fields[0]] : [fields[1]],
        );
        render({
            getFieldOptions,
            formValues: {chartType: 'pie', categoryFieldId: 'time', valueFieldId: 'count'},
        });
        expect(getFieldOptions).toHaveBeenCalledWith({chartType: 'pie', role: 'category'});
        expect(getFieldOptions).toHaveBeenCalledWith({chartType: 'pie', role: 'value'});
        expect(container.querySelectorAll('[aria-label="Categories"] option')).toHaveLength(2);
        expect(container.querySelectorAll('[aria-label="Value"] option')).toHaveLength(2);
    });
});
