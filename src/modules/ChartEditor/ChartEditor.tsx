import React, {useMemo, useState} from 'react';
import {Chart, ChartData, ChartSeries} from '@gravity-ui/charts';
import {Box, Flex, Text} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';

import {ChartEditorForm} from '../../components/ChartEditorForm';
import type {ChartEditorFormProps} from '../../components/ChartEditorForm';
import type {ChartEditorProps} from './types';
import i18n from './i18n';

import './ChartEditor.scss';

const block = cn('qp-chart-editor');

export const ChartEditor = ({
    axisVariants,
    chartSeriesMap,
    className,
    emptyDataLabel,
    onCancel,
    onSubmit,
    onChange,
    formProps,
    formValues: customerFormValues,
}: ChartEditorProps) => {
    const emptyLabel = emptyDataLabel ?? i18n('alert_no-chart-data');

    const dataIdsOptions = useMemo(() => Object.keys(chartSeriesMap ?? []), [chartSeriesMap]);

    const [formValues, setFormValues] = useState<ChartEditorFormProps['formValues']>(
        customerFormValues ?? {
            dataIds: dataIdsOptions.length ? [dataIdsOptions[0]] : [],
            axisType: 'linear',
        },
    );

    const selectedChartSeries = useMemo(() => {
        const selectedDataIdsSet = new Set(formValues.dataIds);
        const record: ChartSeries[] = [];
        for (const dataId in chartSeriesMap) {
            if (selectedDataIdsSet.has(dataId)) {
                record.push(chartSeriesMap[dataId]);
            }
        }
        return record;
    }, [chartSeriesMap, formValues.dataIds]);

    const chartData: ChartData = useMemo(() => {
        const {axisType, xTitle, yTitle, showLegend, chartTitle, axisCategories} = formValues;

        return {
            series: {
                data: selectedChartSeries,
            },
            xAxis: {
                type: axisType,
                title: {text: xTitle},
                categories: axisCategories,
            },
            yAxis: [
                {
                    title: {text: yTitle},
                },
            ],
            legend: {enabled: Boolean(showLegend)},
            title: chartTitle ? {text: chartTitle} : undefined,
        };
    }, [selectedChartSeries, formValues]);

    const handleSubmit = () => {
        onSubmit?.(chartData);
    };

    const handleCancel = () => {
        onCancel?.();
    };

    const handleFormValuesChange = (patchedFormValues: ChartEditorFormProps['formValues']) => {
        setFormValues(patchedFormValues);
        onChange?.(patchedFormValues);
    };

    return (
        <Flex
            width="100%"
            height="100%"
            overflow="hidden"
            as="section"
            className={block(null, className)}
        >
            <Box spacing={{p: 5}} className={block('preview')}>
                {selectedChartSeries.length ? (
                    <Box overflow="hidden" width="100%" height="100%">
                        <Chart data={chartData} />
                    </Box>
                ) : (
                    <Flex width="100%" height="100%" centerContent className={block('empty')}>
                        <Text color="secondary">{emptyLabel}</Text>
                    </Flex>
                )}
            </Box>

            <div className={block('panel')}>
                <ChartEditorForm
                    dataIds={dataIdsOptions}
                    axisVariants={axisVariants}
                    formValues={formValues}
                    onFormValuesChange={handleFormValuesChange}
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                    {...formProps}
                />
            </div>
        </Flex>
    );
};
