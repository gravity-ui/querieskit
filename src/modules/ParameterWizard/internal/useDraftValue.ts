import {useState} from 'react';
import type {ParameterValue} from '../../../types/parameterWizard';
import {useDraftValidation} from './validation';

interface DraftValueOptions {
    value: ParameterValue;
    onChange: (value: ParameterValue) => void;
    format: (value: ParameterValue) => string;
    parse: (text: string) => {valid: boolean; value: ParameterValue};
}

/** Invalid drafts stay local; external values replace them. */
export function useDraftValue({value, onChange, format, parse}: DraftValueOptions) {
    const [draft, setDraft] = useState<{source: ParameterValue; text: string} | undefined>();
    const matches = draft !== undefined && Object.is(draft.source, value);

    const text = matches ? draft.text : format(value);

    if (draft && !matches) setDraft(undefined);

    const parsed = parse(text);
    const invalid = !parsed.valid;

    useDraftValidation(invalid);

    const handleUpdate = (nextText: string) => {
        const next = parse(nextText);
        setDraft({source: next.valid ? next.value : value, text: nextText});
        if (next.valid) onChange(next.value);
    };
    return {text, invalid, onUpdate: handleUpdate};
}
