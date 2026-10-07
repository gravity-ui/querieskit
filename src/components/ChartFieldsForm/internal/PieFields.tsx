import React from 'react';
import type {ChartPieFormValues} from '../../../types/chartEditor';
import type {BindingFieldsProps} from './types';
import {ColumnField} from './ColumnField';

export function PieFields({
    values,
    onChange,
    getFieldOptions,
    labels,
    disabled,
}: BindingFieldsProps<ChartPieFormValues>) {
    return (
        <>
            <ColumnField
                label={labels.category}
                placeholder={labels.selectItem}
                value={values.categoryFieldId}
                options={getFieldOptions({chartType: values.chartType, role: 'category'})}
                disabled={disabled}
                onChange={(categoryFieldId) => onChange({...values, categoryFieldId})}
            />
            <ColumnField
                label={labels.value}
                placeholder={labels.selectItem}
                value={values.valueFieldId}
                options={getFieldOptions({chartType: values.chartType, role: 'value'})}
                disabled={disabled}
                onChange={(valueFieldId) => onChange({...values, valueFieldId})}
            />
        </>
    );
}
