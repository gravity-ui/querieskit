// @vitest-environment jsdom
import React, {act} from 'react';
import {createRoot} from 'react-dom/client';
import type {Root} from 'react-dom/client';
import {afterEach, beforeEach, expect, it, vi} from 'vitest';
import type {
    ChartData,
    ChartFieldsEditorProps,
    ChartFieldsFormProps,
    ChartSelectedFormValues,
    ChartXYFormValues,
} from '../../src/types/chartEditor';
import {ChartFieldsEditor} from '../../src/modules/ChartFieldsEditor';

const captured = vi.hoisted(() => ({
    form: undefined as ChartFieldsFormProps | undefined,
    chart: undefined as ChartData | undefined,
}));
vi.mock('../../src/components/ChartFieldsForm', () => ({
    ChartFieldsForm: (props: ChartFieldsFormProps) => {
        captured.form = props;
        return null;
    },
}));
vi.mock('@gravity-ui/charts', () => ({
    Chart: ({data}: {data: ChartData}) => {
        captured.chart = data;
        return <div data-chart />;
    },
}));

const data: ChartData = {
    series: {data: [{seriesId: 'count', type: 'line', name: 'Count', data: [{x: 0, y: 4}]}]},
    xAxis: {categories: ['Monday'], min: 0, title: {text: 'Old X'}},
    yAxis: [{min: 0, title: {text: 'Old Y'}}],
    legend: {enabled: false},
    title: {text: 'Old title'},
};
const values: ChartXYFormValues = {
    chartType: 'line',
    dimensionAxisType: 'category',
    dimensionFieldId: 'day',
    measureItems: [{id: 'row', fieldId: 'count'}],
    chartTitle: 'Title',
    xTitle: 'Day',
    yTitle: 'Count',
    showLegend: true,
};
let root: Root;
let container: HTMLDivElement;
beforeEach(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    container = document.createElement('div');
    document.body.append(container);
    root = createRoot(container);
    captured.form = undefined;
    captured.chart = undefined;
});
afterEach(() => {
    act(() => root.unmount());
    container.remove();
});
function render(overrides: Partial<ChartFieldsEditorProps> = {}) {
    act(() =>
        root.render(
            <ChartFieldsEditor
                chartTypeOptions={[{value: 'line', content: 'Line'}]}
                getFieldOptions={({role}) =>
                    role === 'dimension'
                        ? [{value: 'day', content: 'Day'}]
                        : [{value: 'count', content: 'Count'}]
                }
                formValues={values}
                getChartData={() => data}
                {...overrides}
            />,
        ),
    );
}

it('preserves adapter configuration and submits the exact configured preview with controlled values', () => {
    const onSubmit = vi.fn();
    const getChartData = vi.fn(() => data);
    render({onSubmit, getChartData});
    expect(getChartData).toHaveBeenCalledWith(values);
    expect(captured.chart).toEqual({
        ...data,
        title: {text: 'Title'},
        xAxis: {...data.xAxis, type: 'category', title: {text: 'Day'}},
        yAxis: [{min: 0, title: {text: 'Count'}}],
        legend: {enabled: true},
    });
    expect(captured.chart?.series).toBe(data.series);
    act(() => captured.form?.onSubmit?.());
    expect(onSubmit).toHaveBeenCalledWith(captured.chart, values);
    expect(data.title?.text).toBe('Old title');
});

it('forwards changes but waits for parent values before updating the preview', () => {
    const onChange = vi.fn();
    render({onChange});
    const next = {...values, chartTitle: 'Updated'};
    act(() => captured.form?.onFormValuesChange?.(next));
    expect(onChange).toHaveBeenCalledWith(next);
    expect(captured.chart?.title?.text).toBe('Title');
    render({onChange, formValues: next});
    expect(captured.chart?.title?.text).toBe('Updated');
});

it('skips the adapter for incomplete selections and prevents direct submit', () => {
    const getChartData = vi.fn(() => data);
    const onSubmit = vi.fn();
    render({
        formValues: {...values, measureItems: [{id: 'empty'}]},
        getChartData,
        onSubmit,
        emptyDataLabel: 'Choose fields',
    });
    expect(getChartData).not.toHaveBeenCalled();
    expect(container.textContent).toContain('Choose fields');
    expect(captured.form?.submitDisabled).toBe(true);
    act(() => captured.form?.onSubmit?.());
    expect(onSubmit).not.toHaveBeenCalled();
});

it.each([
    undefined,
    {series: {data: []}},
    {series: {data: [{...data.series.data[0], data: []}]}},
] satisfies (ChartData | undefined)[])(
    'prevents preview and submit without points: %j',
    (adapterData) => {
        const onSubmit = vi.fn();
        render({getChartData: () => adapterData, onSubmit});
        expect(container.querySelector('[data-chart]')).toBeNull();
        expect(captured.form?.submitDisabled).toBe(true);
        act(() => captured.form?.onSubmit?.());
        expect(onSubmit).not.toHaveBeenCalled();
    },
);

it('guards disabled callbacks and external submit restrictions', () => {
    const onSubmit = vi.fn();
    const onChange = vi.fn();
    const onCancel = vi.fn();
    render({onSubmit, onChange, onCancel, formProps: {disabled: true}});
    act(() => {
        captured.form?.onSubmit?.();
        captured.form?.onFormValuesChange?.(values);
        captured.form?.onCancel?.();
    });
    expect(onSubmit).not.toHaveBeenCalled();
    expect(onChange).not.toHaveBeenCalled();
    expect(onCancel).not.toHaveBeenCalled();
    render({onSubmit, formProps: {submitDisabled: true}});
    act(() => captured.form?.onSubmit?.());
    expect(onSubmit).not.toHaveBeenCalled();
});

it.each([
    {chartType: 'pie', categoryFieldId: 'category', valueFieldId: 'value'},
    {chartType: 'treemap', levels: [{id: 'level', fieldId: 'category'}], valueFieldId: 'value'},
    {chartType: 'sankey', sourceFieldId: 'source', targetFieldId: 'target', valueFieldId: 'value'},
] satisfies ChartSelectedFormValues[])(
    'does not manufacture or override axes for $chartType',
    (selection) => {
        const onSubmit = vi.fn();
        const adapterData = {series: data.series};
        const config = {
            formValues: selection,
            chartTypeOptions: [{value: selection.chartType, content: selection.chartType}],
            getFieldOptions: () =>
                ['category', 'value', 'source', 'target'].map((value) => ({value, content: value})),
            getChartData: () => adapterData,
            onSubmit,
        };
        render(config);
        expect(captured.chart).not.toHaveProperty('xAxis');
        expect(captured.chart).not.toHaveProperty('yAxis');
        act(() => captured.form?.onSubmit?.());
        expect(onSubmit).toHaveBeenCalledWith(captured.chart, selection);
        render({...config, getChartData: () => data});
        expect(captured.chart?.xAxis).toBe(data.xAxis);
        expect(captured.chart?.yAxis).toBe(data.yAxis);
    },
);

it('applies the dimension scale to Y for horizontal bars while keeping physical axis titles', () => {
    const horizontal: ChartSelectedFormValues = {
        ...values,
        chartType: 'bar-y',
        dimensionAxisType: 'category',
    };
    render({
        formValues: horizontal,
        chartTypeOptions: [{value: 'bar-y', content: 'Horizontal bar'}],
    });
    expect(captured.chart?.xAxis).toEqual({...data.xAxis, title: {text: 'Day'}});
    expect(captured.chart?.yAxis).toEqual([
        {...data.yAxis?.[0], type: 'category', title: {text: 'Count'}},
    ]);
});
