import React from 'react';
import type {ChartSankeyFormValues} from '../../../types/chartEditor';
import type {BindingFieldsProps} from './types';
import {ColumnField} from './ColumnField';

export function SankeyFields({
    values,
    onChange,
    getFieldOptions,
    labels,
    disabled,
}: BindingFieldsProps<ChartSankeyFormValues>) {
    return (
        <>
            <ColumnField
                label={labels.source}
                placeholder={labels.selectItem}
                value={values.sourceFieldId}
                options={getFieldOptions({chartType: values.chartType, role: 'source'})}
                disabled={disabled}
                onChange={(sourceFieldId) => onChange({...values, sourceFieldId})}
            />
            <ColumnField
                label={labels.target}
                placeholder={labels.selectItem}
                value={values.targetFieldId}
                options={getFieldOptions({chartType: values.chartType, role: 'target'})}
                disabled={disabled}
                onChange={(targetFieldId) => onChange({...values, targetFieldId})}
            />
            <ColumnField
                label={labels.flowValue}
                placeholder={labels.selectItem}
                value={values.valueFieldId}
                options={getFieldOptions({chartType: values.chartType, role: 'value'})}
                disabled={disabled}
                onChange={(valueFieldId) => onChange({...values, valueFieldId})}
            />
        </>
    );
}
