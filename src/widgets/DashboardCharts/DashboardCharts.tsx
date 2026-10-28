import React, {useCallback, useEffect, useMemo, useState} from 'react';
import type {ChartSeries} from '@gravity-ui/charts';
import {Button, Flex, Modal, Text} from '@gravity-ui/uikit';
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
import {extractChartDefinition, restoreChartDefinition} from '../../helpers/chartDefinitions';
import {getChartTypeLabel} from '../../helpers/chartLabels';
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
        layout,
        emptyTitle,
        emptyDescription,
        dashboardProps,
        onItemsChange,
        onDefinitionsChange,
        onLayoutChange,
        className,
        gap = 1,
    } = props;
    const [innerChartItems, setInnerChartItems] = useState<DashboardItem[]>(
        customerChartsItems ?? [],
    );
    const definitions = props.chartDefinitions;
    const resolveChartData =
        props.editorMode === 'fields' ? props.chartFieldsEditorProps.resolveChartData : undefined;
    const restoredDefinitions = useMemo(
        () =>
            resolveChartData
                ? definitions?.map((definition) =>
                      restoreChartDefinition(definition, resolveChartData),
                  )
                : undefined,
        [definitions, resolveChartData],
    );
    const chartItems = restoredDefinitions
        ? restoredDefinitions.flatMap((result) => (result.status === 'ready' ? [result.item] : []))
        : (customerChartsItems ?? innerChartItems);
    const [draftChart, setDraftChart] = useState<DraftChart | null>(null);
    const [saveError, setSaveError] = useState(false);
    const editorMode = props.editorMode ?? 'series';

    useEffect(() => {
        setDraftChart(null);
        setSaveError(false);
    }, [editorMode]);

    const chartOptions = (() => {
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
            text: getChartTypeLabel(chartType),
            disabled: !props.dataSource[chartType],
            icon: CHART_TYPE_ICONS[chartType],
        }));
    })();

    const handleChartSelect = (chartType: ChartSeries['type']) => {
        setSaveError(false);
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

    const handleCancelDraft = () => {
        setDraftChart(null);
        setSaveError(false);
    };

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
        if (definitions && onDefinitionsChange) {
            const extracted = extractChartDefinition(newChart);
            if (!extracted.valid) {
                setSaveError(true);
                return;
            }
            onDefinitionsChange(
                draftChart.id
                    ? definitions.map((definition) =>
                          definition.id === newChart.id ? extracted.definition : definition,
                      )
                    : [...definitions, extracted.definition],
            );
        } else {
            setInnerChartItems(actualChartItems);
            onItemsChange?.(actualChartItems);
        }
        setDraftChart(null);
        setSaveError(false);
    };

    const handleEditChart = useCallback(
        (id: string) => {
            const item = chartItems.find((candidate) => candidate.id === id);
            if (!item) return;
            setSaveError(false);
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
            if (definitions && onDefinitionsChange) {
                onDefinitionsChange(definitions.filter((definition) => definition.id !== id));
            } else {
                setInnerChartItems(newChartItems);
                onItemsChange?.(newChartItems);
            }
        },
        [chartItems, onItemsChange, definitions, onDefinitionsChange],
    );

    const handleLayoutChange = (patchedLayout: ConfigLayout[]) => onLayoutChange?.(patchedLayout);
    const dashboardItems = useMemo(() => {
        const renderChart = ({id, chartData}: DashboardItem) => ({
            id,
            content: (
                <Chart
                    key={id}
                    data={chartData}
                    controlsVisibility="hover"
                    onPencilEdit={() => handleEditChart(id)}
                    actions={[
                        {text: i18n('action_delete-chart'), onClick: () => handleDeleteChart(id)},
                    ]}
                />
            ),
        });
        return restoredDefinitions
            ? restoredDefinitions.map((result) =>
                  result.status === 'ready'
                      ? renderChart(result.item)
                      : {
                            id: result.definition.id,
                            content: (
                                <Flex
                                    direction="column"
                                    gap={2}
                                    alignItems="center"
                                    justifyContent="center"
                                    height="100%"
                                >
                                    <Text>{result.definition.fieldsFormValues.chartTitle}</Text>
                                    <Text color="secondary">{i18n(`alert_${result.status}`)}</Text>
                                    <Button onClick={() => handleDeleteChart(result.definition.id)}>
                                        {i18n('action_delete-chart')}
                                    </Button>
                                </Flex>
                            ),
                        },
              )
            : chartItems.map(renderChart);
    }, [chartItems, restoredDefinitions, handleEditChart, handleDeleteChart]);

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
                {dashboardItems.length > 0 ? (
                    <Dashboard
                        items={dashboardItems}
                        defaultLayout={defaultLayout}
                        layout={layout}
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
                    if (!open) handleCancelDraft();
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
                    <Flex direction="column" height="100%">
                        {saveError && (
                            <Flex shrink={0}>
                                <Text color="danger" role="alert">
                                    {i18n('alert_invalid-definition')}
                                </Text>
                            </Flex>
                        )}
                        <ChartFieldsEditor
                            {...props.chartFieldsEditorProps}
                            formValues={draftChart.formValues}
                            onChange={(formValues) => {
                                setDraftChart({...draftChart, formValues});
                                setSaveError(false);
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
                    </Flex>
                )}
            </Modal>
        </React.Fragment>
    );
};
