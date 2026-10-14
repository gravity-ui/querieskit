import React, {useId} from 'react';
import {Select} from '@gravity-ui/uikit';
import type {SelectOption} from '@gravity-ui/uikit';
import {FormField} from '../../../../../components/FormField';
import type {QueryEditorEngineSettingsContext} from '../../../../../types/queryEditor';
import type {BuiltinEngineSettings} from '../../../../../types/builtinQueryEngines';

type Props<TCustom extends BuiltinEngineSettings> = {
    context: QueryEditorEngineSettingsContext<TCustom>;
    field: keyof BuiltinEngineSettings;
    title: string;
    options: SelectOption[];
    displayedValue?: string;
    loading?: boolean;
    hasClear?: boolean;
};

export function EngineSettingsSelect<TCustom extends BuiltinEngineSettings>({
    context: {value, onChange, errors, onFieldBlur, disabled},
    field,
    title,
    options,
    displayedValue,
    loading,
    hasClear,
}: Props<TCustom>) {
    const id = useId();
    const error = errors?.custom?.[field];

    return (
        <FormField label={<label htmlFor={id}>{title}</label>}>
            <Select
                id={id}
                aria-label={title}
                width="max"
                placeholder={title}
                options={options}
                value={displayedValue ? [displayedValue] : []}
                onUpdate={([next]) => {
                    if (!disabled) {
                        onChange({...value, custom: {...value.custom, [field]: next}});
                    }
                }}
                onBlur={() => onFieldBlur?.({section: 'custom', field})}
                disabled={disabled || (loading && options.length === 0)}
                loading={loading}
                hasClear={hasClear}
                filterable
                validationState={error ? 'invalid' : undefined}
                errorMessage={error}
            />
        </FormField>
    );
}
