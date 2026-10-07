import React from 'react';
import {Flex, Switch, TextInput} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';
import type {ChartConfigFieldsProps, ChartConfigValues} from '../../types/chartEditor';
import {FormField} from '../FormField';
import i18n from './i18n';
import './ChartConfigFields.scss';

const block = cn('qp-chart-config-fields');

export function ChartConfigFields({
    formValues,
    onFormValuesChange,
    labels,
    disabled,
    className,
    showAxes = true,
}: ChartConfigFieldsProps) {
    const resolvedLabels = {
        chartTitle: labels?.chartTitle ?? i18n('field_chart-title'),
        xTitle: labels?.xTitle ?? i18n('field_x-title'),
        yTitle: labels?.yTitle ?? i18n('field_y-title'),
        showLegend: labels?.showLegend ?? i18n('field_show-legend'),
    };

    const updateFormValues = (patch: ChartConfigValues) => {
        onFormValuesChange?.({...formValues, ...patch});
    };

    return (
        <Flex direction="column" gap={3} className={block(null, className)}>
            <FormField label={resolvedLabels.chartTitle}>
                <TextInput
                    controlProps={{'aria-label': resolvedLabels.chartTitle}}
                    value={formValues.chartTitle ?? ''}
                    onUpdate={(chartTitle) => updateFormValues({chartTitle})}
                    disabled={disabled}
                />
            </FormField>

            {showAxes && (
                <>
                    <FormField label={resolvedLabels.xTitle}>
                        <TextInput
                            controlProps={{'aria-label': resolvedLabels.xTitle}}
                            value={formValues.xTitle ?? ''}
                            onUpdate={(xTitle) => updateFormValues({xTitle})}
                            disabled={disabled}
                        />
                    </FormField>

                    <FormField label={resolvedLabels.yTitle}>
                        <TextInput
                            controlProps={{'aria-label': resolvedLabels.yTitle}}
                            value={formValues.yTitle ?? ''}
                            onUpdate={(yTitle) => updateFormValues({yTitle})}
                            disabled={disabled}
                        />
                    </FormField>
                </>
            )}

            <Switch
                checked={Boolean(formValues.showLegend)}
                onUpdate={(showLegend) => updateFormValues({showLegend})}
                disabled={disabled}
                content={resolvedLabels.showLegend}
            />
        </Flex>
    );
}
