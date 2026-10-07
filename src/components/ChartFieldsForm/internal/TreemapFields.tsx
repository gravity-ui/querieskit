import React from 'react';
import type {ChartTreemapFormValues} from '../../../types/chartEditor';
import type {BindingFieldsProps} from './types';
import {ColumnField} from './ColumnField';
import {FieldsListEditor} from './FieldsListEditor';

export function TreemapFields({
    values,
    onChange,
    getFieldOptions,
    labels,
    disabled,
}: BindingFieldsProps<ChartTreemapFormValues>) {
    return (
        <>
            <FieldsListEditor
                items={values.levels}
                options={getFieldOptions({chartType: values.chartType, role: 'level'})}
                onChange={(levels) => onChange({...values, levels})}
                disabled={disabled}
                label={labels.levels}
                placeholder={labels.selectItem}
                addLabel={labels.addItem}
                removeLabel={labels.removeItem}
                moveUpLabel={labels.moveUp}
                moveDownLabel={labels.moveDown}
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
