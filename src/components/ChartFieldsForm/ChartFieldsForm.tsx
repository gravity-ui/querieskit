import React, {useId} from 'react';
import {Xmark} from '@gravity-ui/icons';
import {Button, Flex, Icon, Select, Text} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';

import type {ChartFieldsFormProps, ChartFieldsFormValues} from '../../types/chartEditor';
import {
    changeChartFieldsType,
    defaultChartAxisVariants,
    isChartFieldsChartType,
    isChartFieldsFormComplete,
    isXYChartType,
} from '../../helpers/chartFieldsForm';
import {ChartConfigFields} from '../ChartConfigFields';

import {FormField} from '../FormField';
import {XYFields} from './internal/XYFields';
import {PieFields} from './internal/PieFields';
import {TreemapFields} from './internal/TreemapFields';
import {SankeyFields} from './internal/SankeyFields';
import {resolveLabels} from './helpers/resolveLabels';

import './ChartFieldsForm.scss';

const block = cn('qp-chart-fields-form');
export function ChartFieldsForm({
    chartTypeOptions,
    getFieldOptions,
    axisVariants = defaultChartAxisVariants,
    formValues,
    onFormValuesChange,
    labels,
    disabled,
    submitDisabled,
    className,
    onCancel,
    onSubmit,
}: ChartFieldsFormProps) {
    const titleId = useId();
    const resolvedLabels = resolveLabels(labels);

    const updateFormValues = (values: ChartFieldsFormValues) => {
        if (!disabled) onFormValuesChange?.(values);
    };

    const isComplete = isChartFieldsFormComplete(formValues, {
        chartTypeOptions,
        getFieldOptions,
        axisVariants,
    });

    const cannotSubmit = disabled || submitDisabled || !isComplete;

    return (
        <Flex
            as="aside"
            direction="column"
            aria-labelledby={titleId}
            className={block(null, className)}
        >
            <Flex gap={2} alignItems="center" className={block('header')}>
                <Text as="h2" variant="subheader-3" id={titleId} className={block('title')}>
                    {resolvedLabels.formTitle}
                </Text>
                <Button
                    type="button"
                    view="flat"
                    size="l"
                    className={block('close')}
                    aria-label={resolvedLabels.close}
                    onClick={onCancel}
                    disabled={disabled}
                >
                    <Icon data={Xmark} size={16} />
                </Button>
            </Flex>

            <Flex direction="column" gap={3} className={block('fields')}>
                <FormField label={resolvedLabels.chartType}>
                    <Select
                        aria-label={resolvedLabels.chartType}
                        placeholder={resolvedLabels.selectItem}
                        options={chartTypeOptions.filter((option) =>
                            isChartFieldsChartType(option.value),
                        )}
                        value={formValues.chartType === undefined ? [] : [formValues.chartType]}
                        onUpdate={([chartType]) => {
                            if (chartType && isChartFieldsChartType(chartType)) {
                                updateFormValues(
                                    changeChartFieldsType(formValues, chartType, {
                                        chartTypeOptions,
                                        getFieldOptions,
                                        axisVariants,
                                    }),
                                );
                            }
                        }}
                        disabled={disabled}
                        width="max"
                    />
                </FormField>

                {(() => {
                    const common = {
                        getFieldOptions,
                        labels: resolvedLabels,
                        disabled,
                        onChange: updateFormValues,
                    };
                    switch (formValues.chartType) {
                        case 'line':
                        case 'area':
                        case 'scatter':
                        case 'bar-x':
                        case 'bar-y':
                            return (
                                <XYFields
                                    {...common}
                                    values={formValues}
                                    axisVariants={axisVariants}
                                />
                            );
                        case 'pie':
                            return <PieFields {...common} values={formValues} />;
                        case 'treemap':
                            return <TreemapFields {...common} values={formValues} />;
                        case 'sankey':
                            return <SankeyFields {...common} values={formValues} />;
                        default:
                            return null;
                    }
                })()}

                <Flex direction="column" gap={2} className={block('config')}>
                    <Text variant="subheader-1">{resolvedLabels.chartConfig}</Text>
                    <ChartConfigFields
                        formValues={formValues}
                        showAxes={isXYChartType(formValues.chartType)}
                        onFormValuesChange={(appearance) => {
                            const common = {
                                chartTitle: appearance.chartTitle,
                                showLegend: appearance.showLegend,
                            };
                            switch (formValues.chartType) {
                                case 'line':
                                case 'area':
                                case 'scatter':
                                case 'bar-x':
                                case 'bar-y':
                                    updateFormValues({
                                        ...formValues,
                                        ...common,
                                        xTitle: appearance.xTitle,
                                        yTitle: appearance.yTitle,
                                    });
                                    break;
                                default:
                                    updateFormValues({...formValues, ...common});
                            }
                        }}
                        labels={resolvedLabels}
                        disabled={disabled}
                    />
                </Flex>
            </Flex>

            <Flex gap={2} justifyContent="flex-end" className={block('actions')}>
                <Button type="button" view="flat" size="l" onClick={onCancel} disabled={disabled}>
                    {resolvedLabels.cancel}
                </Button>
                <Button
                    type="button"
                    view="action"
                    size="l"
                    onClick={() => {
                        if (!cannotSubmit) {
                            onSubmit?.();
                        }
                    }}
                    disabled={cannotSubmit}
                >
                    {resolvedLabels.submit}
                </Button>
            </Flex>
        </Flex>
    );
}
