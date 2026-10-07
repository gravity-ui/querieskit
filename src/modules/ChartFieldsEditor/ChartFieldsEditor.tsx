import React, {useMemo} from 'react';
import {Chart} from '@gravity-ui/charts';
import {Box, Flex, Text} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';

import {ChartFieldsForm} from '../../components/ChartFieldsForm';
import {isChartFieldsFormComplete, isXYFormValues} from '../../helpers/chartFieldsForm';
import type {ChartData, ChartFieldsEditorProps} from '../../types/chartEditor';
import i18n from './i18n';

import './ChartFieldsEditor.scss';

const block = cn('qp-chart-fields-editor');

export function ChartFieldsEditor({
    chartTypeOptions,
    getFieldOptions,
    axisVariants,
    formValues,
    getChartData,
    onChange,
    onSubmit,
    onCancel,
    className,
    emptyDataLabel,
    formProps,
}: ChartFieldsEditorProps) {
    const isComplete = isChartFieldsFormComplete(formValues, {
        chartTypeOptions,
        getFieldOptions,
        axisVariants,
    });

    const chartData = useMemo<ChartData | undefined>(() => {
        // Unfilled measure rows belong to the draft, not to the preview selection.
        const previewValues = isXYFormValues(formValues)
            ? {
                  ...formValues,
                  measureItems: formValues.measureItems.filter(
                      (item) => item.fieldId !== undefined,
                  ),
              }
            : formValues;
        if (
            !isChartFieldsFormComplete(previewValues, {
                chartTypeOptions,
                getFieldOptions,
                axisVariants,
            })
        )
            return undefined;
        const data = getChartData(previewValues);
        if (!data || !data.series.data.some((series) => series.data.length > 0)) {
            return undefined;
        }
        const configured: ChartData = {
            ...data,
            title: {...data.title, text: formValues.chartTitle ?? ''},
            legend: {...data.legend, enabled: Boolean(formValues.showLegend)},
        };
        if (isXYFormValues(formValues)) {
            const horizontal = formValues.chartType === 'bar-y';
            configured.xAxis = {
                ...data.xAxis,
                ...(!horizontal && {type: formValues.dimensionAxisType}),
                title: {...data.xAxis?.title, text: formValues.xTitle ?? ''},
            };
            configured.yAxis = (data.yAxis?.length ? data.yAxis : [{}]).map((axis) => ({
                ...axis,
                ...(horizontal && {type: formValues.dimensionAxisType}),
                title: {...axis.title, text: formValues.yTitle ?? ''},
            }));
        }
        return configured;
    }, [formValues, getChartData, chartTypeOptions, getFieldOptions, axisVariants]);

    const cannotSubmit =
        !isComplete || !chartData || formProps?.disabled || formProps?.submitDisabled;

    return (
        <Flex as="section" className={block(null, className)}>
            <Box className={block('preview')}>
                {chartData ? (
                    <Box overflow="hidden" width="100%" height="100%">
                        <Chart data={chartData} />
                    </Box>
                ) : (
                    <Flex width="100%" height="100%" centerContent>
                        <Text color="secondary">
                            {emptyDataLabel ?? i18n('alert_no-chart-data')}
                        </Text>
                    </Flex>
                )}
            </Box>
            <Box className={block('panel')}>
                <ChartFieldsForm
                    {...formProps}
                    chartTypeOptions={chartTypeOptions}
                    getFieldOptions={getFieldOptions}
                    axisVariants={axisVariants}
                    formValues={formValues}
                    onFormValuesChange={(values) => {
                        if (!formProps?.disabled) onChange?.(values);
                    }}
                    onCancel={() => {
                        if (!formProps?.disabled) onCancel?.();
                    }}
                    submitDisabled={cannotSubmit}
                    onSubmit={() => {
                        if (!cannotSubmit && chartData && isComplete)
                            onSubmit?.(chartData, formValues);
                    }}
                />
            </Box>
        </Flex>
    );
}
