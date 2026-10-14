import React from 'react';
import {Select} from '@gravity-ui/uikit';
import type {ChartEditorOption} from '../../../types/chartEditor';
import {FormField} from '../../FormField';

export function ColumnField({
    label,
    placeholder,
    value,
    options,
    disabled,
    onChange,
}: {
    label: string;
    placeholder: string;
    value?: string;
    options: readonly ChartEditorOption[];
    disabled?: boolean;
    onChange: (value: string | undefined) => void;
}) {
    return (
        <FormField label={label}>
            <Select
                aria-label={label}
                placeholder={placeholder}
                options={[...options]}
                value={value === undefined ? [] : [value]}
                disabled={disabled}
                width="max"
                onUpdate={([next]) => onChange(next)}
            />
        </FormField>
    );
}
