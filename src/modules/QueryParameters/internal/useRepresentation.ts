import {useEffect, useRef, useState} from 'react';
import type {QueryParameterType, QueryParameterValue} from '../../../types/queryParameters';
import {escapeString, fromRaw, toRaw, unescapeString} from '../helpers/parameters';
import i18n from '../i18n';
import type {ParameterValueProps as Props} from './parameterValueTypes';

export function needsEscapes(type: QueryParameterType, value: QueryParameterValue) {
    return (
        (type.kind === 'String' || type.kind === 'Pg') &&
        typeof value === 'string' &&
        /[\r\n]/.test(value)
    );
}

export function useRepresentation(props: Props) {
    const {type, value, editing, path = '$', onChange, onValidityChange} = props;
    const multiline = needsEscapes(type, value);
    const [mode, setMode] = useState<'raw' | 'escaped' | null>(multiline ? 'escaped' : null);
    const [text, setText] = useState(() => (multiline ? escapeString(String(value)) : ''));
    const [invalid, setInvalid] = useState(false);
    const callback = useRef(onValidityChange);
    callback.current = onValidityChange;
    useEffect(() => {
        callback.current?.(path, editing && invalid);
    }, [editing, invalid, path]);
    useEffect(() => () => callback.current?.(path, false), [path]);
    useEffect(() => {
        if (multiline && mode === null) {
            setMode('escaped');
            setText(escapeString(String(value)));
        }
    }, [multiline, mode, value]);
    const toggle = (next: 'raw' | 'escaped') => {
        if (invalid) return;
        if (mode === next) {
            setMode(multiline ? 'escaped' : null);
            if (multiline) setText(escapeString(String(value)));
            return;
        }
        try {
            setText(next === 'escaped' ? escapeString(String(value)) : toRaw(type, value));
            setMode(next);
        } catch {
            /* Invalid structured values must be corrected before changing representation. */
        }
    };
    const update = (next: string) => {
        setText(next);
        try {
            const decoded = mode === 'escaped' ? unescapeString(next) : fromRaw(type, next, value);
            setInvalid(false);
            onChange(decoded);
        } catch {
            setInvalid(true);
        }
    };
    const clear = (nextValue: QueryParameterValue = value) => {
        const escaped = needsEscapes(type, nextValue);
        setMode(escaped ? 'escaped' : null);
        setInvalid(false);
        setText(escaped ? escapeString(String(nextValue)) : '');
    };
    const error = invalid
        ? i18n(mode === 'escaped' ? 'alert_invalid-escape' : 'alert_invalid-raw')
        : undefined;
    return {mode, text, invalid, toggle, update, clear, error, multiline};
}
