import React from 'react';
import {Button, Flex, Select, Switch, Text, TextInput} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';

import type {
    ChartEditorFormProps,
    ChartEditorFormValues,
    ChartEditorLabels,
    ChartEditorOption,
} from './types';
import i18n from './i18n';

import './ChartEditorForm.scss';

const block = cn('qp-chart-editor-form');

const DEFAULT_AXIS_TYPE_OPTIONS: ChartEditorOption[] = [
    {value: 'category', content: 'category'},
    {value: 'linear', content: 'linear'},
    {value: 'datetime', content: 'datetime'},
    {value: 'logarithmic', content: 'logarithmic'},
];

const resolveLabels = (labels: ChartEditorLabels | undefined) => ({
    data: labels?.data ?? i18n('field_data'),
    x: labels?.x ?? i18n('field_x'),
    axisType: labels?.axisType ?? i18n('field_axis-type'),
    chartTitle: labels?.chartTitle ?? i18n('field_chart-title'),
    xTitle: labels?.xTitle ?? i18n('field_x-title'),
    yTitle: labels?.yTitle ?? i18n('field_y-title'),
    showLegend: labels?.showLegend ?? i18n('field_show-legend'),
    formTitle: labels?.formTitle ?? i18n('title_form'),
    cancel: labels?.cancelLabel ?? i18n('button_cancel'),
    submit: labels?.submitLabel ?? i18n('button_submit'),
});

const Field = ({label, children}: {label: React.ReactNode; children: React.ReactNode}) => (
    <Flex direction="column" gap={1}>
        <Text variant="body-1" color="secondary">
            {label}
        </Text>
        {children}
    </Flex>
);

export function ChartEditorForm<TCategory extends string>({
    category,
    categoryOptions,
    onCategoryChange,
    formValues,
    onFormValuesChange,
    xOptions = [],
    axisTypeOptions = DEFAULT_AXIS_TYPE_OPTIONS,
    labels,
    disabled,
    className,
    onCancel,
    onSubmit,
}: ChartEditorFormProps<TCategory>) {
    const updateFormValues = (patch: Partial<ChartEditorFormValues>) => {
        onFormValuesChange({...formValues, ...patch});
    };

    const handleCategoryUpdate = ([next]: string[]) => {
        if (!next || !categoryOptions.some((option) => option.value === next)) {
            return;
        }
        onCategoryChange(next as TCategory);
    };

    const handleAxisTypeUpdate = ([next]: string[]) => {
        if (!next || !axisTypeOptions.some((option) => option.value === next)) {
            return;
        }
        updateFormValues({axisType: next as ChartEditorFormValues['axisType']});
    };

    const resolved = resolveLabels(labels);

    return (
        <Flex as="aside" direction="column" gap={3} className={block(null, className)}>
            <Text as="h2" variant="subheader-2" className={block('title')}>
                {resolved.formTitle}
            </Text>

            <Flex direction="column" gap={3} className={block('fields')}>
                <Field label={resolved.data}>
                    <Select
                        aria-label={resolved.data}
                        options={categoryOptions}
                        value={[category]}
                        onUpdate={handleCategoryUpdate}
                        disabled={disabled}
                        width="max"
                    />
                </Field>

                <Field label={resolved.x}>
                    <Select
                        aria-label={resolved.x}
                        options={xOptions}
                        value={formValues.x ? [formValues.x] : []}
                        onUpdate={([x = '']) => updateFormValues({x})}
                        disabled={disabled}
                        width="max"
                    />
                </Field>

                <Field label={resolved.axisType}>
                    <Select
                        aria-label={resolved.axisType}
                        options={axisTypeOptions}
                        value={[formValues.axisType]}
                        onUpdate={handleAxisTypeUpdate}
                        disabled={disabled}
                        width="max"
                    />
                </Field>

                <Field label={resolved.chartTitle}>
                    <TextInput
                        aria-label={resolved.chartTitle}
                        value={formValues.chartTitle}
                        onUpdate={(chartTitle) => updateFormValues({chartTitle})}
                        disabled={disabled}
                    />
                </Field>

                <Field label={resolved.xTitle}>
                    <TextInput
                        aria-label={resolved.xTitle}
                        value={formValues.xTitle}
                        onUpdate={(xTitle) => updateFormValues({xTitle})}
                        disabled={disabled}
                    />
                </Field>

                <Field label={resolved.yTitle}>
                    <TextInput
                        aria-label={resolved.yTitle}
                        value={formValues.yTitle}
                        onUpdate={(yTitle) => updateFormValues({yTitle})}
                        disabled={disabled}
                    />
                </Field>

                <Switch
                    checked={formValues.showLegend}
                    onUpdate={(showLegend) => updateFormValues({showLegend})}
                    disabled={disabled}
                    content={resolved.showLegend}
                />
            </Flex>

            <Flex gap={2} justifyContent="flex-end" className={block('actions')}>
                <Button view="flat" onClick={onCancel} disabled={disabled}>
                    {resolved.cancel}
                </Button>
                <Button view="action" onClick={onSubmit} disabled={disabled}>
                    {resolved.submit}
                </Button>
            </Flex>
        </Flex>
    );
}
