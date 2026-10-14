import React from 'react';
import type {ChartXYFormValues} from '../../../types/chartEditor';
import {defaultChartAxisVariants} from '../../../helpers/chartFieldsForm';
import type {BindingFieldsProps} from './types';
import {ColumnField} from './ColumnField';
import {FieldsListEditor} from './FieldsListEditor';

export function XYFields({
    values,
    onChange,
    getFieldOptions,
    labels,
    disabled,
    axisVariants = defaultChartAxisVariants,
}: BindingFieldsProps<ChartXYFormValues>) {
    const horizontal = values.chartType === 'bar-y';
    return (
        <>
            <ColumnField
                label={horizontal ? labels.y : labels.x}
                placeholder={labels.selectItem}
                value={values.dimensionFieldId}
                options={getFieldOptions({chartType: values.chartType, role: 'dimension'})}
                disabled={disabled}
                onChange={(dimensionFieldId) => onChange({...values, dimensionFieldId})}
            />
            <ColumnField
                label={labels.axisType}
                placeholder={labels.selectItem}
                value={values.dimensionAxisType}
                options={axisVariants.map((value) => ({value, content: value}))}
                disabled={disabled}
                onChange={(value) =>
                    onChange({
                        ...values,
                        dimensionAxisType: axisVariants.find((axis) => axis === value),
                    })
                }
            />
            <FieldsListEditor
                items={values.measureItems}
                options={getFieldOptions({chartType: values.chartType, role: 'measure'})}
                onChange={(measureItems) => onChange({...values, measureItems})}
                disabled={disabled}
                label={horizontal ? labels.x : labels.y}
                placeholder={labels.selectItem}
                addLabel={labels.addItem}
                removeLabel={labels.removeItem}
                moveUpLabel={labels.moveUp}
                moveDownLabel={labels.moveDown}
            />
        </>
    );
}
