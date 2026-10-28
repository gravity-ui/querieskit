import React, {useMemo} from 'react';
import {Chart} from '@gravity-ui/charts';
import {Box, Flex, Text} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';

import {ChartFieldsForm} from '../../components/ChartFieldsForm';
import {isChartFieldsFormComplete, isXYFormValues} from '../../helpers/chartFieldsForm';
import type {ChartFieldsEditorProps} from '../../types/chartEditor';
import i18n from './i18n';
import {applyChartFieldsAppearance} from '../../helpers/applyChartFieldsAppearance';
import type {ChartDataResult} from '../../types/tabularChartSource';
import {validateChartConfiguration} from '../../helpers/validateChartConfiguration';

import './ChartFieldsEditor.scss';

const block = cn('qp-chart-fields-editor');

export function ChartFieldsEditor({
    chartTypeOptions,
    getFieldOptions,
    axisVariants,
    formValues,
    getChartData,
    resolveChartData,
    getUnavailableLabel,
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

    const result = useMemo<ChartDataResult>(() => {
        // Unfilled measure rows belong to the draft, not to the preview selection.
        const previewValues = isXYFormValues(formValues)
            ? {
                  ...formValues,
                  measureItems: formValues.measureItems.filter(
                      (item) => item.fieldId !== undefined,
                  ),
              }
            : formValues;
        const validated = validateChartConfiguration(previewValues);
        if (!validated.valid) return {status: 'invalid-selection'};
        const configuration = validated.configuration;
        const resolved = resolveChartData?.(configuration);
        if (resolved && resolved.status !== 'ready') return resolved;
        if (
            !isChartFieldsFormComplete(configuration, {
                chartTypeOptions,
                getFieldOptions,
                axisVariants,
            })
        )
            return {status: 'invalid-selection'};
        const data = resolved?.status === 'ready' ? resolved.data : getChartData?.(configuration);
        if (!data || !data.series.data.some((series) => series.data.length > 0)) {
            return {status: 'empty-data'};
        }
        return {status: 'ready', data: applyChartFieldsAppearance(data, configuration)};
    }, [
        formValues,
        getChartData,
        resolveChartData,
        chartTypeOptions,
        getFieldOptions,
        axisVariants,
    ]);
    const chartData = result.status === 'ready' ? result.data : undefined;

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
                            {result.status !== 'ready' &&
                                (getUnavailableLabel?.(result) ??
                                    emptyDataLabel ??
                                    i18n(`alert_${result.status}`))}
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
                        if (!cannotSubmit && chartData && isComplete) {
                            const validated = validateChartConfiguration(formValues);
                            if (validated.valid) onSubmit?.(chartData, validated.configuration);
                        }
                    }}
                />
            </Box>
        </Flex>
    );
}
