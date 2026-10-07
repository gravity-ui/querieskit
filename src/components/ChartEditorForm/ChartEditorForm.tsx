import React, {useMemo} from 'react';
import type {ChartEditorFormProps, ChartEditorFormValues} from '../../types/chartEditor';
import {Button, Flex, Select, Text} from '@gravity-ui/uikit';
import {ChartConfigFields} from '../ChartConfigFields';
import {FormField} from '../FormField';
import {resolveLabels} from './helpers/resolveLabels';
import type {ChartAxisType} from '@gravity-ui/charts';
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
                    <FormField label={resolvedLables.data}>
                        <Select
                            multiple
                            aria-label={resolvedLables.data}
                            options={dataIdsOptions}
                            value={formValues.dataIds}
                            onUpdate={(pathDataIds) => updateFormValues({dataIds: pathDataIds})}
                            disabled={disabled}
                            width="max"
                        />
                    </FormField>
                )}

                <FormField label={resolvedLables.axisType}>
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
                </FormField>

                <ChartConfigFields
                    formValues={formValues}
                    onFormValuesChange={updateFormValues}
                    labels={labels}
                    disabled={disabled}
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
