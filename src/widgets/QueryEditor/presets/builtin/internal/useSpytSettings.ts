import {useEffect, useState} from 'react';
import type {
    BuiltinEngineSettings,
    BuiltinEngineSettingsBinding,
} from '../../../../../types/builtinQueryEngines';
import i18n from '../i18n';

/** Keep the owner above any disclosure that may unmount its content. */
export function useSpytSettings<TCustom extends BuiltinEngineSettings>({
    value,
    onChange,
    errors,
    onFieldBlur,
    disabled,
    clusterId,
}: BuiltinEngineSettingsBinding<TCustom>) {
    const saved = value.spytConfig ?? '{}';
    const [draft, setDraft] = useState(saved);
    const [invalid, setInvalid] = useState(false);
    useEffect(() => {
        setDraft(saved);
        setInvalid(false);
    }, [saved, clusterId]);
    const error = invalid ? i18n('alert_invalid-spyt-config') : errors?.spytConfig;
    const save = () => {
        if (disabled) return;
        try {
            const parsed: unknown = JSON.parse(draft);
            if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
                setInvalid(true);
                return;
            }
        } catch {
            setInvalid(true);
            return;
        }
        setInvalid(false);
        onChange({...value, spytConfig: draft}, 'spytConfig');
    };

    return {
        draft,
        error,
        disabled,
        save,
        change: (next: string) => {
            if (!disabled) {
                setDraft(next);
                setInvalid(false);
            }
        },
        blur: () => onFieldBlur?.('spytConfig'),
        cancel: () => {
            setDraft(saved);
            setInvalid(false);
        },
    };
}

export type SpytSettingsState = ReturnType<typeof useSpytSettings>;
