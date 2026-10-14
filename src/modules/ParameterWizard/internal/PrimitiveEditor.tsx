import React, {useState} from 'react';
import {Button, Flex, Select, Text} from '@gravity-ui/uikit';
import {base64ToHex, hexToBase64, isValidHexString, reverseUuidBytes} from '../helpers/binary';
import {formatDate, isDateType, parseDate} from '../helpers/date';
import {defaultValue, isBinary, isPgType} from '../helpers/values';
import {validateValue} from '../helpers/validateValue';
import i18n from '../i18n';
import {DraftInput} from './DraftInput';
import {RawEditor} from './RawEditor';
import type {EditorProps} from './types';
import type {ParameterValue} from '../../../types/parameterWizard';

function decodeBinary(value: ParameterValue): string | undefined {
    if (!isBinary(value)) return undefined;
    try {
        return new TextDecoder('utf-8', {ignoreBOM: true}).decode(
            Uint8Array.from(atob(value[0]), (c) => c.charCodeAt(0)),
        );
    } catch {
        return undefined;
    }
}

export function PrimitiveEditor(props: EditorProps) {
    const {type, value, onChange, disabled, readOnly, name} = props;
    const [binary, setBinary] = useState(() => Array.isArray(value));
    const decoded = decodeBinary(value);
    if (type.name === 'Bool' || type.name === 'Enum') {
        const options =
            type.name === 'Enum'
                ? type.type.map((item) => ({value: String(item.name), content: String(item.name)}))
                : [
                      {value: 'true', content: 'True'},
                      {value: 'false', content: 'False'},
                  ];
        return (
            <Select
                width="max"
                aria-label={name}
                disabled={disabled || readOnly}
                value={value === undefined ? [] : [String(value)]}
                options={options}
                placeholder={i18n('context_required')}
                onUpdate={([selected]) =>
                    onChange(type.name === 'Bool' ? selected === 'true' : selected)
                }
            />
        );
    }
    if (['Void', 'Null', 'EmptyList', 'EmptyDict'].includes(type.name)) {
        if (value === undefined && !readOnly)
            return (
                <Button disabled={disabled} onClick={() => onChange(defaultValue(type))}>
                    {i18n('action_set-value')}
                </Button>
            );
        return <Text variant="code-1">{JSON.stringify(value) ?? i18n('context_required')}</Text>;
    }
    if (['Unknown', 'Json', 'JsonDocument', 'Yson', 'Stream'].includes(type.name))
        return <RawEditor {...props} />;
    if (isDateType(type.name)) {
        return (
            <DraftInput
                {...props}
                format={(v) => (v === undefined ? '' : formatDate(String(v), type.name))}
                parse={(text) => {
                    const parsed = parseDate(text, type.name);
                    return {valid: text === '' || parsed !== undefined, value: parsed};
                }}
            />
        );
    }
    const uuid = type.name === 'Uuid';
    const canBeBinary = type.name === 'String' || isPgType(type.name);
    return (
        <Flex gap={2} width="100%" minWidth={0}>
            {canBeBinary && (
                <Button
                    selected={binary}
                    onClick={() => {
                        // Switch the representation without losing bytes or changing the value.
                        setBinary((current) => !current);
                    }}
                >
                    {i18n('action_binary')}
                </Button>
            )}
            <DraftInput
                {...props}
                key={`${uuid || binary}`}
                format={(v) => {
                    if (v === undefined) return '';
                    if (uuid) {
                        if (!isBinary(v)) return JSON.stringify(v);
                        const hex = reverseUuidBytes(base64ToHex(v[0]));
                        return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
                    }
                    if (canBeBinary && binary) {
                        if (isBinary(v)) return base64ToHex(v[0]);
                        return Array.from(new TextEncoder().encode(String(v)), (byte) =>
                            byte.toString(16).padStart(2, '0'),
                        ).join('');
                    }
                    if (canBeBinary && isBinary(v)) return decoded ?? '';
                    return String(v);
                }}
                parse={(text) => {
                    if (uuid) {
                        const hex = text.replace(/-/g, '');
                        const valid =
                            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
                                text,
                            );
                        return {
                            valid: text === '' || valid,
                            value: valid ? [hexToBase64(reverseUuidBytes(hex))] : undefined,
                        };
                    }
                    if (canBeBinary && binary)
                        return {
                            valid: isValidHexString(text),
                            value: isValidHexString(text) ? [hexToBase64(text)] : undefined,
                        };
                    const nextValue =
                        text === '' && type.name !== 'Utf8' && !canBeBinary ? undefined : text;
                    return {
                        valid: nextValue === undefined || validateValue(nextValue, type),
                        value: nextValue,
                    };
                }}
            />
        </Flex>
    );
}
