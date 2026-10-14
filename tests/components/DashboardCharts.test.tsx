// @vitest-environment jsdom

import React, {act} from 'react';
import type {Root} from 'react-dom/client';
import {createRoot} from 'react-dom/client';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import type {ChartEditorProps} from '../../src/modules/ChartEditor';
import type {
    ChartData,
    ChartFieldsEditorProps,
    ChartSelectedFormValues,
    ChartXYFormValues,
} from '../../src/types/chartEditor';
import type {DashboardChartsProps, DashboardItem} from '../../src/types/dashboardCharts';
import type {AddChartButtonProps} from '../../src/components/AddChartButton/AddChartButton';
import type {DashboardProps} from '../../src/components/Dashboard';
import {DashboardCharts} from '../../src/widgets/DashboardCharts/DashboardCharts';

const mocks = vi.hoisted(() => ({
    seriesEditor: vi.fn(),
    fieldsEditor: vi.fn(),
    addChart: vi.fn(),
    chart: vi.fn(),
}));

vi.mock('../../src/modules/ChartEditor', () => ({
    ChartEditor: (props: ChartEditorProps) => {
        mocks.seriesEditor(props);
        return <div data-testid="series-editor" />;
    },
}));
vi.mock('../../src/modules/ChartFieldsEditor', () => ({
    ChartFieldsEditor: (props: ChartFieldsEditorProps) => {
        mocks.fieldsEditor(props);
        return <div data-testid="fields-editor" />;
    },
}));
vi.mock('../../src/components/AddChartButton', () => ({
    AddChartButton: (props: AddChartButtonProps<string>) => {
        mocks.addChart(props);
        return null;
    },
}));
vi.mock('../../src/components/Dashboard', () => ({
    Dashboard: ({items}: DashboardProps) => (
        <>
            {items.map(({id, content}) => (
                <div key={id} data-chart-id={id}>
                    {content}
                </div>
            ))}
        </>
    ),
}));
vi.mock('../../src/components/Chart', () => ({
    Chart: (props: {
        data: ChartData;
        onPencilEdit?: () => void;
        actions?: {onClick?: () => void}[];
    }) => {
        mocks.chart(props);
        return <div data-testid="chart" />;
    },
}));
vi.mock('../../src/widgets/DashboardCharts/internal/EmptyDashboardPlaceholder', () => ({
    EmptyDashboardPlaceholder: () => <div data-testid="empty" />,
}));
vi.mock('@gravity-ui/uikit', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@gravity-ui/uikit')>();
    return {
        ...actual,
        Modal: ({
            open,
            keepMounted,
            children,
        }: {
            open: boolean;
            keepMounted?: boolean;
            children: React.ReactNode;
        }) =>
            open || keepMounted ? (
                <div data-testid="modal" hidden={!open}>
                    {children}
                </div>
            ) : null,
    };
});

const chartData: ChartData = {
    series: {data: [{type: 'line', seriesId: 'requests', data: [{x: 1, y: 2}]}]},
    title: {text: 'Requests'},
    xAxis: {type: 'category', categories: ['Monday'], title: {text: 'Day'}},
    yAxis: [{title: {text: 'Count'}}],
    legend: {enabled: true},
};
const mapping: ChartXYFormValues = {
    chartType: 'line',
    dimensionAxisType: 'category',
    dimensionFieldId: 'day',
    measureItems: [
        {id: 'requests-row', fieldId: 'requests'},
        {id: 'errors-row', fieldId: 'errors'},
    ],
    chartTitle: 'Requests',
    showLegend: true,
};
const fieldsProps: Extract<DashboardChartsProps, {editorMode: 'fields'}> = {
    editorMode: 'fields',
    chartFieldsEditorProps: {
        chartTypeOptions: [
            {value: 'line', content: 'Line'},
            {value: 'bar-x', content: 'Bar', disabled: true},
        ],
        getFieldOptions: ({role}) =>
            role === 'dimension'
                ? [{value: 'day', content: 'Day'}]
                : [
                      {value: 'requests', content: 'Requests'},
                      {value: 'errors', content: 'Errors'},
                  ],
        getChartData: () => chartData,
    },
};
const seriesProps: DashboardChartsProps = {
    dataSource: {line: {requests: chartData.series.data[0]}},
};

describe('DashboardCharts editor orchestration', () => {
    let container: HTMLDivElement;
    let root: Root;

    beforeEach(() => {
        globalThis.IS_REACT_ACT_ENVIRONMENT = true;
        vi.clearAllMocks();
        container = document.createElement('div');
        document.body.append(container);
        root = createRoot(container);
    });
    afterEach(() => {
        act(() => root.unmount());
        container.remove();
    });

    function render(props: DashboardChartsProps) {
        act(() => root.render(<DashboardCharts {...props} />));
    }
    function add(type = 'line') {
        const props = mocks.addChart.mock.lastCall?.[0] as AddChartButtonProps<string>;
        act(() => props.onSelect(type));
    }
    function fieldsEditor() {
        expect(container.querySelector('[data-testid="fields-editor"]')).not.toBeNull();
        return mocks.fieldsEditor.mock.lastCall?.[0] as ChartFieldsEditorProps;
    }
    function seriesEditor() {
        expect(container.querySelector('[data-testid="series-editor"]')).not.toBeNull();
        return mocks.seriesEditor.mock.lastCall?.[0] as ChartEditorProps;
    }
    function edit() {
        act(() => mocks.chart.mock.lastCall?.[0].onPencilEdit?.());
    }

    it('preserves the default series create and edit workflow', () => {
        const onItemsChange = vi.fn();
        render({...seriesProps, onItemsChange});
        add();
        expect(seriesEditor().chartSeriesMap).toEqual({requests: chartData.series.data[0]});
        expect(seriesEditor().formValues).toEqual({dataIds: ['requests'], axisType: 'linear'});
        expect(mocks.fieldsEditor).not.toHaveBeenCalled();
        act(() => seriesEditor().onSubmit?.(chartData));
        const saved = onItemsChange.mock.lastCall?.[0] as DashboardItem[];
        expect(saved).toEqual([{id: expect.any(String), chartData}]);
        expect(container.querySelector('[data-testid="modal"]')).toBeNull();
        edit();
        expect(seriesEditor().formValues).toEqual({
            dataIds: ['requests'],
            chartTitle: 'Requests',
            xTitle: 'Day',
            yTitle: 'Count',
            showLegend: true,
            axisType: 'category',
            axisCategories: ['Monday'],
        });
        const changed = {...chartData, title: {text: 'Updated'}};
        act(() => seriesEditor().onSubmit?.(changed));
        expect(onItemsChange).toHaveBeenLastCalledWith([{id: saved[0].id, chartData: changed}]);
    });

    it('opens a fields draft with menu type, chosen scale and configured defaults', () => {
        const onChange = vi.fn();
        render({
            ...fieldsProps,
            chartFieldsEditorProps: {
                ...fieldsProps.chartFieldsEditorProps,
                axisVariants: ['datetime', 'linear'],
                getInitialFormValues: () => ({
                    chartType: 'bar-x',
                    dimensionAxisType: 'datetime',
                    dimensionFieldId: 'day',
                    chartTitle: 'Default',
                    measureItems: [{id: 'initial'}],
                }),
                onChange,
            },
        });
        add();
        const initial = fieldsEditor().formValues;
        expect(initial).toMatchObject({
            chartType: 'line',
            dimensionAxisType: 'datetime',
            dimensionFieldId: 'day',
            chartTitle: 'Default',
        });
        expect('measureItems' in initial && initial.measureItems).toEqual([
            {id: expect.any(String)},
        ]);
        expect(onChange).not.toHaveBeenCalled();
        expect(mocks.seriesEditor).not.toHaveBeenCalled();
        act(() => fieldsEditor().onChange?.(mapping));
        expect(fieldsEditor().formValues).toEqual(mapping);
        expect(onChange).toHaveBeenLastCalledWith(mapping);
        expect(fieldsEditor().getChartData).toBe(fieldsProps.chartFieldsEditorProps.getChartData);
    });

    it('persists column bindings and row order, then restores them when editing', () => {
        const onItemsChange = vi.fn();
        render({...fieldsProps, onItemsChange});
        add();
        act(() => fieldsEditor().onChange?.(mapping));
        act(() => fieldsEditor().onSubmit?.(chartData, mapping));
        const saved = onItemsChange.mock.lastCall?.[0] as DashboardItem[];
        expect(saved).toEqual([{id: expect.any(String), chartData, fieldsFormValues: mapping}]);
        expect(container.querySelector('[data-testid="modal"]')).toBeNull();
        edit();
        expect(fieldsEditor().formValues).toEqual(mapping);
        const revised = {
            ...mapping,
            measureItems: [...mapping.measureItems].reverse(),
            chartTitle: 'Revised',
        };
        const revisedData = {...chartData, title: {text: 'Revised'}};
        act(() => fieldsEditor().onChange?.(revised));
        act(() => fieldsEditor().onSubmit?.(revisedData, revised));
        expect(onItemsChange).toHaveBeenLastCalledWith([
            {id: saved[0].id, chartData: revisedData, fieldsFormValues: revised},
        ]);
    });

    it.each([
        {chartType: 'pie', categoryFieldId: 'category', valueFieldId: 'value'},
        {
            chartType: 'treemap',
            levels: [
                {id: 'region', fieldId: 'region'},
                {id: 'product', fieldId: 'product'},
            ],
            valueFieldId: 'value',
        },
        {
            chartType: 'sankey',
            sourceFieldId: 'source',
            targetFieldId: 'target',
            valueFieldId: 'value',
        },
    ] satisfies ChartSelectedFormValues[])(
        'persists and reopens the complete $chartType mapping',
        (selection) => {
            const onItemsChange = vi.fn();
            render({
                ...fieldsProps,
                onItemsChange,
                chartFieldsEditorProps: {
                    ...fieldsProps.chartFieldsEditorProps,
                    chartTypeOptions: [{value: selection.chartType, content: selection.chartType}],
                },
            });
            add(selection.chartType);
            act(() => fieldsEditor().onChange?.(selection));
            act(() => fieldsEditor().onSubmit?.(chartData, selection));
            const saved = onItemsChange.mock.lastCall?.[0] as DashboardItem[];
            expect(saved[0].fieldsFormValues).toEqual(selection);
            edit();
            expect(fieldsEditor().formValues).toEqual(selection);
        },
    );

    it('normalizes a mismatched initializer to the menu type and clears incompatible bindings', () => {
        render({
            ...fieldsProps,
            chartFieldsEditorProps: {
                ...fieldsProps.chartFieldsEditorProps,
                chartTypeOptions: [{value: 'pie', content: 'Pie'}],
                getInitialFormValues: () => mapping,
            },
        });
        add('pie');
        expect(fieldsEditor().formValues).toEqual({
            chartType: 'pie',
            chartTitle: mapping.chartTitle,
            showLegend: true,
            categoryFieldId: undefined,
            valueFieldId: undefined,
        });
    });

    it('restores physical axis titles and the Y dimension scale for an unmapped horizontal bar', () => {
        const horizontal: ChartData = {
            series: {data: [{type: 'bar-y', seriesId: 'old', data: [{x: 1, y: 2}]}]},
            xAxis: {type: 'linear', title: {text: 'Amount'}},
            yAxis: [{type: 'category', title: {text: 'Region'}}],
        };
        render({...fieldsProps, chartItems: [{id: 'old', chartData: horizontal}]});
        edit();
        expect(fieldsEditor().formValues).toMatchObject({
            chartType: 'bar-y',
            dimensionAxisType: 'category',
            xTitle: 'Amount',
            yTitle: 'Region',
        });
        expect(fieldsEditor().formValues).not.toHaveProperty('dimensionFieldId');
    });

    it('restores saved mappings even when the persisted chart has no series', () => {
        render({
            ...fieldsProps,
            chartItems: [
                {id: 'empty-series', chartData: {series: {data: []}}, fieldsFormValues: mapping},
            ],
        });
        edit();
        expect(fieldsEditor().formValues).toEqual(mapping);
    });

    it('uses the latest controlled item mapping when reopening an existing chart', () => {
        const initial = {id: 'existing', chartData, fieldsFormValues: mapping};
        render({...fieldsProps, chartItems: [initial]});
        edit();
        act(() => fieldsEditor().onCancel?.());
        const externalMapping = {
            ...mapping,
            measureItems: [mapping.measureItems[1]],
            chartTitle: 'External edit',
        };
        render({...fieldsProps, chartItems: [{...initial, fieldsFormValues: externalMapping}]});
        edit();
        expect(fieldsEditor().formValues).toEqual(externalMapping);
    });

    it('safely ignores editing a legacy chart whose series are empty', () => {
        render({...seriesProps, chartItems: [{id: 'empty', chartData: {series: {data: []}}}]});
        expect(() => edit()).not.toThrow();
        expect(container.querySelector('[data-testid="modal"]')).toBeNull();
    });

    it('discards a canceled draft without changing dashboard items', () => {
        const onItemsChange = vi.fn();
        render({...fieldsProps, onItemsChange});
        add();
        act(() => fieldsEditor().onChange?.(mapping));
        act(() => fieldsEditor().onCancel?.());
        expect(container.querySelector('[data-testid="modal"]')).toBeNull();
        expect(onItemsChange).not.toHaveBeenCalled();
        add();
        expect((fieldsEditor().formValues as ChartXYFormValues).measureItems).toHaveLength(1);
        expect((fieldsEditor().formValues as ChartXYFormValues).dimensionFieldId).toBeUndefined();
    });

    it('hides the inactive editor without losing its draft or remounting the form', () => {
        const onItemsChange = vi.fn();
        render({...fieldsProps, onItemsChange});
        add();
        act(() => fieldsEditor().onChange?.(mapping));
        const editor = container.querySelector('[data-testid="fields-editor"]');

        render({...fieldsProps, onItemsChange, active: false});
        expect(container.querySelector<HTMLDivElement>('[data-testid="modal"]')?.hidden).toBe(true);
        expect(container.querySelector('[data-testid="fields-editor"]')).toBe(editor);
        expect(onItemsChange).not.toHaveBeenCalled();

        render({...fieldsProps, onItemsChange, active: true});
        expect(container.querySelector<HTMLDivElement>('[data-testid="modal"]')?.hidden).toBe(
            false,
        );
        expect(container.querySelector('[data-testid="fields-editor"]')).toBe(editor);
        expect(fieldsEditor().formValues).toEqual(mapping);
        act(() => fieldsEditor().onSubmit?.(chartData, mapping));
        expect(onItemsChange).toHaveBeenLastCalledWith([
            {id: expect.any(String), chartData, fieldsFormValues: mapping},
        ]);
    });

    it('discards an open draft when the editor mode changes instead of reopening it later', () => {
        const onItemsChange = vi.fn();
        render({...fieldsProps, onItemsChange});
        add();
        act(() => fieldsEditor().onChange?.(mapping));

        render({...seriesProps, onItemsChange});
        expect(container.querySelector('[data-testid="modal"]')).toBeNull();
        render({...fieldsProps, onItemsChange});
        expect(container.querySelector('[data-testid="modal"]')).toBeNull();
        expect(onItemsChange).not.toHaveBeenCalled();

        add();
        expect(fieldsEditor().formValues.chartType).toBe('line');
        expect((fieldsEditor().formValues as ChartXYFormValues).dimensionFieldId).toBeUndefined();
        expect((fieldsEditor().formValues as ChartXYFormValues).measureItems).toEqual([
            {id: expect.any(String)},
        ]);
    });

    it('leaves controlled items visible until the parent accepts deletion', () => {
        const onItemsChange = vi.fn();
        const items = [{id: 'existing', chartData, fieldsFormValues: mapping}];
        render({...fieldsProps, chartItems: items, onItemsChange});
        act(() => mocks.chart.mock.lastCall?.[0].actions?.[0].onClick?.());
        expect(onItemsChange).toHaveBeenLastCalledWith([]);
        expect(container.querySelector('[data-chart-id="existing"]')).not.toBeNull();
        render({...fieldsProps, chartItems: [], onItemsChange});
        expect(container.querySelector('[data-chart-id="existing"]')).toBeNull();
        expect(container.querySelector('[data-testid="empty"]')).not.toBeNull();
    });
});
