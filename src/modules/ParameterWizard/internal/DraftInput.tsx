import React from 'react';
import {TextArea, TextInput} from '@gravity-ui/uikit';
import type {ParameterValue} from '../../../types/parameterWizard';
import i18n from '../i18n';
import {useDraftValue} from './useDraftValue';

interface DraftInputProps {
    value: ParameterValue;
    onChange: (value: ParameterValue) => void;
    format: (value: ParameterValue) => string;
    parse: (text: string) => {valid: boolean; value: ParameterValue};
    name: string;
    multiline?: boolean;
    readOnly?: boolean;
    disabled?: boolean;
    placeholder?: string;
}

/** Invalid drafts stay local; accepted values are always controlled by the consumer. */
export function DraftInput({
    value,
    onChange,
    format,
    parse,
    name,
    multiline,
    readOnly,
    disabled,
    placeholder,
}: DraftInputProps) {
    const {text, invalid, onUpdate: handleUpdate} = useDraftValue({value, onChange, format, parse});
    const Input = multiline ? TextArea : TextInput;
    return (
        <Input
            value={text}
            onUpdate={handleUpdate}
            readOnly={readOnly}
            disabled={disabled}
            controlProps={{'aria-label': name}}
            placeholder={placeholder ?? i18n('context_required')}
            validationState={invalid && text !== '' && !disabled ? 'invalid' : undefined}
            errorMessage={i18n(multiline ? 'alert_invalid-json' : 'alert_invalid-value')}
            {...(multiline ? {minRows: 3, maxRows: 12} : {})}
        />
    );
}
