import React, {useCallback, useMemo, useState} from 'react';
import {ChartData, ChartSeries} from '@gravity-ui/charts';

import {Flex, Modal} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';
import {ChartEditor, ChartEditorProps} from '../../modules';
import {AddChartButton, Chart, Dashboard, DashboardProps} from '../../components';
import type {DashboardChartsProps, DashboardItem} from './types';
import {EmptyDashboardPlaceholder} from './internal/EmptyDashboardPlaceholder';
import i18n from './i18n';
import {CHART_TYPE_ICONS} from './helpers/chartTypeIcons';

import './DashboardCharts.scss';
import {ConfigLayout} from '@gravity-ui/dashkit';

const block = cn('qp-dashboard-charts');

export const DashboardCharts = ({
    chartItems: customerChartsItems,
    chartsLayout: customerChartsLayout,
    dataSource,
    emptyTitle,
    emptyDescription,
    chartEditorProps,
    dashboardProps,
    onItemsChange,
    onLayoutChange,
    className,
    gap = 1,
}: DashboardChartsProps) => {
    const [chartItems, setChartItems] = useState<DashboardItem[]>(customerChartsItems ?? []);

    const [chartsLayout, setChartsLayout] = useState<DashboardProps['layout']>(
        customerChartsLayout ?? [],
    );

    const [draftChart, setDraftChart] = useState<{
        id?: string;
        chartSeries: ChartEditorProps['chartSeriesMap'];
        formValues: ChartEditorProps['formValues'];
    } | null>(null);

    const allowedCharts = useMemo(
        () => Object.keys(dataSource) as ChartSeries['type'][],
        [dataSource],
    );

    const handleChartSelect = (chartType: ChartSeries['type']) => {
        const chartSeries = dataSource[chartType];

        if (chartSeries) {
            const dataIds = Object.keys(chartSeries);

            setDraftChart({
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
    };

    const handleSubmitChart = (chart: ChartData) => {
        if (!draftChart) return;

        const newChart = {
            id: draftChart.id ?? crypto.randomUUID().replace('-', ''),
            chartData: chart,
        };

        const actualChartItems = draftChart.id
            ? chartItems.map((ch) => (ch.id === newChart.id ? newChart : ch))
            : [...chartItems, newChart];

        setDraftChart(null);
        setChartItems(actualChartItems);
        onItemsChange?.(actualChartItems);
    };

    const handleEditChart = useCallback(
        (id: string, chart: DashboardItem['chartData']) => {
            const chartType = chart.series.data[0].type;
            const chartSeries = dataSource[chartType];

            if (!chartSeries) return;

            const selectedDataIds = chart.series.data.map(({custom}) => custom.dataId) as string[];

            setDraftChart({
                id,
                chartSeries,
                formValues: {
                    dataIds: selectedDataIds,
                    chartTitle: chart.title?.text,
                    xTitle: chart.xAxis?.title?.text,
                    yTitle: chart.yAxis?.[0].title?.text,
                    showLegend: chart?.legend?.enabled,
                    axisType: chart.xAxis?.type,
                    axisCategories: chart.xAxis?.categories,
                },
            });
        },
        [dataSource],
    );

    const handleDeleteChart = useCallback(
        (id: string) => {
            const newChartItems = chartItems.filter((item) => item.id !== id);
            const newChartsLayout = chartsLayout?.filter(({i}) => i !== id) ?? [];

            setChartItems(newChartItems);
            setChartsLayout(newChartsLayout);

            onItemsChange?.(newChartItems);
            onLayoutChange?.(newChartsLayout);
        },
        [chartItems, chartsLayout, onItemsChange, onLayoutChange],
    );

    const handleLayoutChange = (patchedLayout: ConfigLayout[]) => {
        setChartsLayout(patchedLayout);
        onLayoutChange?.(patchedLayout);
    };

    const dashboardItems = useMemo(
        () =>
            chartItems.map(({id, chartData}) => ({
                id,
                content: (
                    <Chart
                        key={id}
                        data={chartData}
                        controlsVisibility="hover"
                        onPencilEdit={() => handleEditChart(id, chartData)}
                        actions={[{text: 'delete', onClick: () => handleDeleteChart(id)}]}
                    />
                ),
            })),
        [chartItems, handleEditChart, handleDeleteChart],
    );

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
                    options={allowedCharts.map((chartType) => ({
                        value: chartType,
                        text: chartType,
                        icon: CHART_TYPE_ICONS[chartType],
                    }))}
                    onSelect={handleChartSelect}
                    disabled={allowedCharts.length === 0}
                />

                {chartItems ? (
                    <Dashboard
                        items={dashboardItems}
                        layout={chartsLayout}
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
                open={Boolean(draftChart)}
                onOpenChange={(open) => {
                    if (!open) {
                        setDraftChart(null);
                    }
                }}
                contentOverflow="auto"
                contentClassName={block('modal')}
            >
                {draftChart && (
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
                        {...chartEditorProps}
                    />
                )}
            </Modal>
        </React.Fragment>
    );
};
