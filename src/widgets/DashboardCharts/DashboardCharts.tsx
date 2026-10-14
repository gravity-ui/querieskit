import React, {useCallback, useEffect, useMemo, useState} from 'react';
import type {ChartSeries} from '@gravity-ui/charts';
import {Flex, Modal} from '@gravity-ui/uikit';
import type {ConfigLayout} from '@gravity-ui/dashkit';
import cn from 'bem-cn-lite';

import {ChartEditor} from '../../modules/ChartEditor';
import type {ChartEditorProps} from '../../modules/ChartEditor';
import {ChartFieldsEditor} from '../../modules/ChartFieldsEditor';
import {AddChartButton} from '../../components/AddChartButton';
import {Chart} from '../../components/Chart';
import {Dashboard} from '../../components/Dashboard';
import type {ChartData, ChartFieldsChartType, ChartFieldsFormValues} from '../../types/chartEditor';
import type {
    DashboardChartFieldsEditorProps,
    DashboardChartsProps,
    DashboardItem,
} from '../../types/dashboardCharts';
import {EmptyDashboardPlaceholder} from './internal/EmptyDashboardPlaceholder';
import {CHART_TYPE_ICONS} from './helpers/chartTypeIcons';
import {
    changeChartFieldsType,
    createChartFieldsFormValues,
    isChartFieldsChartType,
    isXYFormValues,
} from '../../helpers/chartFieldsForm';
import i18n from './i18n';
import './DashboardCharts.scss';

const block = cn('qp-dashboard-charts');

type DraftChart =
    | {
          mode: 'series';
          id?: string;
          chartSeries: ChartEditorProps['chartSeriesMap'];
          formValues: ChartEditorProps['formValues'];
      }
    | {mode: 'fields'; id?: string; formValues: ChartFieldsFormValues};

function createFieldsValues(
    chartType: ChartFieldsChartType,
    editorProps: DashboardChartFieldsEditorProps,
): ChartFieldsFormValues {
    const initial =
        editorProps.getInitialFormValues?.(chartType) ??
        createChartFieldsFormValues(chartType, editorProps.axisVariants);
    return changeChartFieldsType(initial, chartType, editorProps);
}

function getAppearance(chart: ChartData) {
    return {
        chartTitle: chart.title?.text,
        xTitle: chart.xAxis?.title?.text,
        yTitle: chart.yAxis?.[0]?.title?.text,
        showLegend: chart.legend?.enabled,
        axisType: chart.xAxis?.type,
    };
}

function getSavedFieldsValues(item: DashboardItem, editorProps: DashboardChartFieldsEditorProps) {
    if (item.fieldsFormValues) return item.fieldsFormValues;
    const chart = item.chartData;
    const chartType = chart.series.data[0]?.type;
    if (!isChartFieldsChartType(chartType)) return undefined;
    const formValues = {
        ...createChartFieldsFormValues(chartType, editorProps.axisVariants),
        chartTitle: chart.title?.text,
        showLegend: chart.legend?.enabled,
    };
    if (!isXYFormValues(formValues)) return formValues;
    return {
        ...formValues,
        xTitle: chart.xAxis?.title?.text,
        yTitle: chart.yAxis?.[0]?.title?.text,
        dimensionAxisType:
            (chartType === 'bar-y' ? chart.yAxis?.[0]?.type : chart.xAxis?.type) ??
            formValues.dimensionAxisType,
    };
}

export const DashboardCharts = (props: DashboardChartsProps) => {
    const {
        active = true,
        chartItems: customerChartsItems,
        defaultLayout,
        emptyTitle,
        emptyDescription,
        dashboardProps,
        onItemsChange,
        onLayoutChange,
        className,
        gap = 1,
    } = props;
    const [innerChartItems, setInnerChartItems] = useState<DashboardItem[]>(
        customerChartsItems ?? [],
    );
    const chartItems = customerChartsItems ?? innerChartItems;
    const [draftChart, setDraftChart] = useState<DraftChart | null>(null);
    const editorMode = props.editorMode ?? 'series';

    useEffect(() => {
        setDraftChart(null);
    }, [editorMode]);

    const chartOptions = useMemo(() => {
        if (props.editorMode === 'fields') {
            return props.chartFieldsEditorProps.chartTypeOptions
                .filter((option) => isChartFieldsChartType(option.value))
                .map((option) => ({
                    value: option.value,
                    text: option.content,
                    disabled: option.disabled,
                    icon: CHART_TYPE_ICONS[option.value],
                }));
        }
        return (Object.keys(props.dataSource) as ChartSeries['type'][]).map((chartType) => ({
            value: chartType,
            text: chartType,
            disabled: !props.dataSource[chartType],
            icon: CHART_TYPE_ICONS[chartType],
        }));
    }, [props.editorMode, props.dataSource, props.chartFieldsEditorProps]);

    const handleChartSelect = (chartType: ChartSeries['type']) => {
        if (props.editorMode === 'fields') {
            if (!isChartFieldsChartType(chartType)) return;
            setDraftChart({
                mode: 'fields',
                formValues: createFieldsValues(chartType, props.chartFieldsEditorProps),
            });
            return;
        }
        const chartSeries = props.dataSource[chartType];
        if (chartSeries) {
            const dataIds = Object.keys(chartSeries);
            setDraftChart({
                mode: 'series',
                chartSeries,
                formValues: {
                    dataIds: dataIds.length ? [dataIds[0]] : [],
                    axisType: 'linear',
                },
            });
        }
    };

    const handleCancelDraft = () => setDraftChart(null);

    const handleSubmitChart = (chart: ChartData, fieldsFormValues?: ChartFieldsFormValues) => {
        if (!draftChart) return;
        const newChart: DashboardItem = {
            id: draftChart.id ?? crypto.randomUUID().replace(/-/g, ''),
            chartData: chart,
            ...(draftChart.mode === 'fields' && {
                fieldsFormValues: fieldsFormValues ?? draftChart.formValues,
            }),
        };
        const actualChartItems = draftChart.id
            ? chartItems.map((item) => (item.id === newChart.id ? newChart : item))
            : [...chartItems, newChart];
        setDraftChart(null);
        setInnerChartItems(actualChartItems);
        onItemsChange?.(actualChartItems);
    };

    const handleEditChart = useCallback(
        (id: string) => {
            const item = chartItems.find((candidate) => candidate.id === id);
            if (!item) return;
            const chart = item.chartData;
            const chartType = chart.series.data[0]?.type;
            if (props.editorMode === 'fields') {
                const formValues = getSavedFieldsValues(item, props.chartFieldsEditorProps);
                if (!formValues) return;
                setDraftChart({mode: 'fields', id, formValues});
                return;
            }
            const chartSeries = chartType && props.dataSource[chartType];
            if (!chartSeries) return;
            setDraftChart({
                mode: 'series',
                id,
                chartSeries,
                formValues: {
                    ...getAppearance(chart),
                    dataIds: chart.series.data.map((series) => series.seriesId),
                    axisCategories: chart.xAxis?.categories,
                },
            });
        },
        [chartItems, props.editorMode, props.dataSource, props.chartFieldsEditorProps],
    );

    const handleDeleteChart = useCallback(
        (id: string) => {
            const newChartItems = chartItems.filter((item) => item.id !== id);
            setInnerChartItems(newChartItems);
            onItemsChange?.(newChartItems);
        },
        [chartItems, onItemsChange],
    );

    const handleLayoutChange = (patchedLayout: ConfigLayout[]) => onLayoutChange?.(patchedLayout);
    const dashboardItems = useMemo(
        () =>
            chartItems.map(({id, chartData}) => ({
                id,
                content: (
                    <Chart
                        key={id}
                        data={chartData}
                        controlsVisibility="hover"
                        onPencilEdit={() => handleEditChart(id)}
                        actions={[
                            {
                                text: i18n('action_delete-chart'),
                                onClick: () => handleDeleteChart(id),
                            },
                        ]}
                    />
                ),
            })),
        [chartItems, handleEditChart, handleDeleteChart],
    );

    const draftMatchesMode = draftChart?.mode === editorMode;

    return (
        <React.Fragment>
            <Flex
                as="section"
                direction="column"
                width="100%"
                height="100%"
                gap={gap}
                className={block(null, className)}
            >
                <AddChartButton
                    text={i18n('action_add-chart')}
                    options={chartOptions}
                    onSelect={handleChartSelect}
                    disabled={chartOptions.every((option) => option.disabled)}
                />
                {chartItems.length > 0 ? (
                    <Dashboard
                        items={dashboardItems}
                        defaultLayout={defaultLayout}
                        onLayoutChange={handleLayoutChange}
                        className={block('dashboard')}
                        {...dashboardProps}
                    />
                ) : (
                    <EmptyDashboardPlaceholder
                        emptyTitle={emptyTitle}
                        emptyDescription={emptyDescription}
                    />
                )}
            </Flex>

            <Modal
                open={Boolean(active && draftChart && draftMatchesMode)}
                keepMounted={Boolean(draftChart)}
                disableBodyScrollLock={!active}
                onOpenChange={(open) => {
                    if (!open) setDraftChart(null);
                }}
                contentOverflow="auto"
                contentClassName={block('modal')}
            >
                {draftChart?.mode === 'series' && props.editorMode !== 'fields' && (
                    <ChartEditor
                        chartSeriesMap={draftChart.chartSeries}
                        formValues={draftChart.formValues}
                        onSubmit={handleSubmitChart}
                        onCancel={handleCancelDraft}
                        axisVariants={['linear', 'datetime', 'logarithmic']}
                        formProps={{
                            labels: {
                                submitLabel: draftChart.id
                                    ? i18n('action_save-chart')
                                    : i18n('action_add-chart'),
                            },
                        }}
                        {...props.chartEditorProps}
                    />
                )}
                {draftChart?.mode === 'fields' && props.editorMode === 'fields' && (
                    <ChartFieldsEditor
                        {...props.chartFieldsEditorProps}
                        formValues={draftChart.formValues}
                        onChange={(formValues) => {
                            setDraftChart({...draftChart, formValues});
                            props.chartFieldsEditorProps.onChange?.(formValues);
                        }}
                        onSubmit={handleSubmitChart}
                        onCancel={handleCancelDraft}
                        formProps={{
                            ...props.chartFieldsEditorProps.formProps,
                            labels: {
                                submitLabel: draftChart.id
                                    ? i18n('action_save-chart')
                                    : i18n('action_add-chart'),
                                ...props.chartFieldsEditorProps.formProps?.labels,
                            },
                        }}
                    />
                )}
            </Modal>
        </React.Fragment>
    );
};
