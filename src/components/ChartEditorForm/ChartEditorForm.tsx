import React, {useMemo} from 'react';
import type {ChartEditorFormProps, ChartEditorFormValues} from './types';
import {Button, Flex, Select, Switch, Text, TextInput} from '@gravity-ui/uikit';
import {Field} from './internal/Field';
import {resolveLabels} from './helpers/resolveLabels';
import {ChartAxisType} from '@gravity-ui/charts';
import cn from 'bem-cn-lite';
import './ChartEditorForm.scss';

const block = cn('qp-chart-editor-form');

export function ChartEditorForm({
    dataIds,
    axisVariants,
    labels,
    className,
    formValues,
    onFormValuesChange,
    disabled,
    onCancel,
    onSubmit,
}: ChartEditorFormProps) {
    const updateFormValues = (patch: Partial<ChartEditorFormValues>) => {
        onFormValuesChange?.({...formValues, ...patch});
    };

    const axisOptions = useMemo(
        () => axisVariants?.map((axisType) => ({value: axisType, children: axisType})),
        [axisVariants],
    );

    const dataIdsOptions = useMemo(
        () => dataIds?.map((dataId) => ({value: dataId, children: dataId})),
        [dataIds],
    );

    const resolvedLables = resolveLabels(labels);

    const needShowDataIdsSelector = dataIdsOptions?.length && dataIdsOptions?.length > 1;

    return (
        <Flex as="aside" direction="column" gap={3} className={block(null, className)}>
            <Text as="h2" variant="subheader-2" className={block('title')}>
                {resolvedLables.formTitle}
            </Text>

            <Flex direction="column" gap={3} className={block('fields')}>
                {needShowDataIdsSelector && (
                    <Field label={resolvedLables.data}>
                        <Select
                            multiple
                            aria-label={resolvedLables.data}
                            options={dataIdsOptions}
                            value={formValues.dataIds}
                            onUpdate={(pathDataIds) => updateFormValues({dataIds: pathDataIds})}
                            disabled={disabled}
                            width="max"
                        />
                    </Field>
                )}

                <Field label={resolvedLables.axisType}>
                    <Select<ChartAxisType>
                        aria-label={resolvedLables.axisType}
                        options={axisOptions}
                        value={formValues.axisType ? [formValues.axisType] : []}
                        onUpdate={(axisType) =>
                            updateFormValues({axisType: axisType[0] as ChartAxisType})
                        }
                        disabled={disabled}
                        width="max"
                    />
                </Field>

                <Field label={resolvedLables.chartTitle}>
                    <TextInput
                        aria-label={resolvedLables.chartTitle}
                        value={formValues.chartTitle}
                        onUpdate={(chartTitle) => updateFormValues({chartTitle})}
                        disabled={disabled}
                    />
                </Field>

                <Field label={resolvedLables.xTitle}>
                    <TextInput
                        aria-label={resolvedLables.xTitle}
                        value={formValues.xTitle}
                        onUpdate={(xTitle) => updateFormValues({xTitle})}
                        disabled={disabled}
                    />
                </Field>

                <Field label={resolvedLables.yTitle}>
                    <TextInput
                        aria-label={resolvedLables.yTitle}
                        value={formValues.yTitle}
                        onUpdate={(yTitle) => updateFormValues({yTitle})}
                        disabled={disabled}
                    />
                </Field>

                <Switch
                    checked={Boolean(formValues.showLegend)}
                    onUpdate={(showLegend) => updateFormValues({showLegend})}
                    disabled={disabled}
                    content={resolvedLables.showLegend}
                />
            </Flex>

            <Flex gap={2} justifyContent="flex-end" className={block('actions')}>
                <Button view="flat" onClick={onCancel} disabled={disabled}>
                    {resolvedLables.cancel}
                </Button>
                <Button view="action" onClick={onSubmit} disabled={disabled}>
                    {resolvedLables.submit}
                </Button>
            </Flex>
        </Flex>
    );
}
