import React, {useRef} from 'react';
import {Select} from '@gravity-ui/uikit';
import type {ParameterValue} from '../../../types/parameterWizard';
import {defaultValue, isPgType, optionalDepth, readOptional, wrapOptional} from '../helpers/values';
import i18n from '../i18n';
import type {EditorProps} from './types';

export function OptionalValueControl({
    name,
    type,
    value,
    onChange,
    disabled,
    readOnly,
}: EditorProps) {
    const previous = useRef<{value: ParameterValue} | undefined>(undefined);
    const depth = optionalDepth(type);
    const optional = readOptional(value, depth);
    const pg = isPgType(type.name);
    const pgNull = pg && optional.value === null;
    let selectedValue = pgNull ? 'pg-null' : 'value';
    if (optional.nullLevel !== undefined) selectedValue = String(optional.nullLevel);
    const options = [
        {value: 'value', content: i18n('value_present')},
        ...Array.from({length: depth}, (_, level) => ({
            value: String(level),
            content:
                depth === 1 ? i18n('value_null') : i18n('value_null-level', {level: level + 1}),
        })),
    ];
    if (pg) options.push({value: 'pg-null', content: i18n('value_null')});
    return (
        <Select
            aria-label={`${name}: ${i18n('field_optional')}`}
            disabled={disabled || readOnly}
            value={[selectedValue]}
            options={options}
            onUpdate={([selected]) => {
                if (selected === selectedValue) return;
                if (selected === 'value') {
                    const fallback = pg
                        ? ''
                        : defaultValue({...type, optional: false, optionalLevel: 0});
                    onChange(
                        wrapOptional(previous.current ? previous.current.value : fallback, depth),
                    );
                } else {
                    if (selectedValue === 'value') previous.current = {value: optional.value};
                    onChange(wrapOptional(null, selected === 'pg-null' ? depth : Number(selected)));
                }
            }}
        />
    );
}
