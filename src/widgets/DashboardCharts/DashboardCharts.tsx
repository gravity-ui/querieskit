import React, {useMemo, useState} from 'react';
import {Chart} from '@gravity-ui/charts';
import type {ConfigLayout} from '@gravity-ui/dashkit';
import {Flex, Modal, Text} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';

import {
    AddChartButton,
    DEFAULT_ADD_CHART_BUTTON_OPTIONS,
    Dashboard,
    type DefaultAddChartButtonValue,
} from '../../components';
import {ChartEditor} from '../../modules';
import type {
    DashboardChart,
    DashboardChartEditorValues,
    DashboardChartOption,
    DashboardChartsProps,
} from '../../types/dashboardCharts';
import i18n from './i18n';

import './DashboardCharts.scss';

const block = cn('qp-dashboard-charts');

const DEFAULT_EDITOR_VALUES: DashboardChartEditorValues = {
    x: '',
    axisType: 'category',
    chartTitle: '',
    xTitle: '',
    yTitle: '',
    showLegend: false,
};

type Draft<TCategory extends string> = {
    category: TCategory;
    values: DashboardChartEditorValues;
};

export const DashboardCharts = <TCategory extends string = DefaultAddChartButtonValue>({
    charts: controlledCharts,
    defaultCharts = [],
    chartOptions = DEFAULT_ADD_CHART_BUTTON_OPTIONS as readonly DashboardChartOption<TCategory>[],
    getChartData,
    getDefaultEditorValues,
    xOptions,
    axisTypeOptions,
    editorLabels,
    editorEmptyDataLabel,
    layout: controlledLayout,
    defaultLayout = [],
    grid,
    addChartText,
    emptyTitle,
    emptyDescription,
    disabled,
    className,
    onChartsChange,
    onChartAdd,
    onLayoutChange,
}: DashboardChartsProps<TCategory>) => {
    const [innerCharts, setInnerCharts] =
        useState<readonly DashboardChart<TCategory>[]>(defaultCharts);
    const [innerLayout, setInnerLayout] = useState(defaultLayout);
    const [draft, setDraft] = useState<Draft<TCategory> | null>(null);

    const charts = controlledCharts ?? innerCharts;
    const layout = controlledLayout ?? innerLayout;

    const resolveEditorValues = (
        category: TCategory,
        fallback: DashboardChartEditorValues,
    ): DashboardChartEditorValues => getDefaultEditorValues?.(category) ?? fallback;

    const categoryOptions = useMemo(
        () =>
            chartOptions
                .filter(({hidden}) => !hidden)
                .map(({value, text, editorContent, disabled: optionDisabled}) => ({
                    value,
                    content: editorContent ?? text,
                    disabled: optionDisabled,
                })),
        [chartOptions],
    );

    const dashboardItems = useMemo(
        () =>
            charts.map(({id, data}) => ({
                id,
                content: <Chart data={data} />,
            })),
        [charts],
    );

    const previewData = useMemo(
        () => (draft ? getChartData(draft.category, draft.values) : undefined),
        [draft, getChartData],
    );

    const handleChartSelect = (category: TCategory) => {
        setDraft({
            category,
            values: resolveEditorValues(category, {...DEFAULT_EDITOR_VALUES}),
        });
    };

    const handleLayoutChange = (nextLayout: ConfigLayout[]) => {
        if (controlledLayout === undefined) {
            setInnerLayout(nextLayout);
        }
        onLayoutChange?.(nextLayout);
    };

    const handleSubmit = () => {
        if (!draft || !previewData) {
            return;
        }

        const chart: DashboardChart<TCategory> = {
            id: crypto.randomUUID(),
            category: draft.category,
            values: draft.values,
            data: previewData,
        };
        const nextCharts = [...charts, chart];

        if (controlledCharts === undefined) {
            setInnerCharts(nextCharts);
        }
        onChartsChange?.(nextCharts);
        onChartAdd?.(chart);
        setDraft(null);
    };

    const resolvedEmptyTitle = emptyTitle === undefined ? i18n('context_no-charts') : emptyTitle;
    const resolvedEmptyDescription =
        emptyDescription === undefined ? i18n('context_add-first-chart') : emptyDescription;

    return (
        <Flex
            as="section"
            direction="column"
            width="100%"
            height="100%"
            className={block(null, className)}
        >
            <div className={block('actions')}>
                <AddChartButton<TCategory>
                    text={addChartText ?? i18n('action_add-chart')}
                    options={chartOptions}
                    onSelect={handleChartSelect}
                    disabled={disabled}
                />
            </div>
            <div className={block('content')}>
                {charts.length > 0 ? (
                    <Dashboard
                        items={dashboardItems}
                        layout={layout}
                        grid={grid}
                        className={block('dashboard')}
                        onLayoutChange={handleLayoutChange}
                    />
                ) : (
                    <Flex direction="column" centerContent gap={1} className={block('empty')}>
                        {resolvedEmptyTitle !== null && (
                            <Text variant="subheader-2">{resolvedEmptyTitle}</Text>
                        )}
                        {resolvedEmptyDescription !== null && (
                            <Text color="secondary">{resolvedEmptyDescription}</Text>
                        )}
                    </Flex>
                )}
            </div>
            <Modal
                open={Boolean(draft)}
                onClose={() => setDraft(null)}
                contentOverflow="auto"
                contentClassName={block('modal')}
                aria-label={editorLabels?.formTitle ?? i18n('action_add-chart')}
            >
                {draft && (
                    <ChartEditor<TCategory>
                        data={previewData}
                        emptyDataLabel={editorEmptyDataLabel}
                        className={block('editor')}
                        chartFormProps={{
                            category: draft.category,
                            categoryOptions,
                            onCategoryChange: (category) =>
                                setDraft((current) =>
                                    current
                                        ? {
                                              category,
                                              values: resolveEditorValues(category, current.values),
                                          }
                                        : current,
                                ),
                            formValues: draft.values,
                            onFormValuesChange: (values) =>
                                setDraft((current) => (current ? {...current, values} : current)),
                            xOptions,
                            axisTypeOptions,
                            labels: editorLabels,
                            disabled,
                            onCancel: () => setDraft(null),
                            onSubmit: handleSubmit,
                        }}
                    />
                )}
            </Modal>
        </Flex>
    );
};
