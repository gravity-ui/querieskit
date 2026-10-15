import React from 'react';
import {
    Button,
    Flex,
    Icon,
    SegmentedRadioGroup,
    Select,
    Text,
    TextArea,
    TextInput,
} from '@gravity-ui/uikit';
import BinaryIcon from './icons/BinaryIcon';
import {ParameterDocument} from './ParameterDocument';
import {ParameterDateInput} from './ParameterDateInput';
import type {QueryParameterType} from '../../../types/queryParameters';
import {isDocumentType, isTextType, parameterFormatExample} from '../helpers/parameters';
import i18n from '../i18n';
import type {ParameterValueProps as Props} from './parameterValueTypes';
import cn from 'bem-cn-lite';
import './ScalarValue.scss';
import type {useRepresentation} from './useRepresentation';

const block = cn('qp-parameter-value');

export function isDateType(type: QueryParameterType) {
    return /^(Date|Date32|Datetime|Datetime64|Timestamp|Timestamp64)$/.test(type.kind);
}

export function ScalarValue({
    onChange,
    type,
    value,
    editing,
    disabled,
    label,
    actions,
    representation,
    error,
    nullActive,
}: Props & {
    actions: React.ReactNode;
    representation: ReturnType<typeof useRepresentation>;
    error?: string;
}) {
    if (isDocumentType(type))
        return (
            <Flex direction="column" gap={1}>
                <ParameterDocument
                    value={nullActive ? '' : String(value)}
                    onUpdate={onChange}
                    editing={editing}
                    disabled={disabled}
                    label={label}
                    error={error}
                />
                {!editing && error && (
                    <Text color="danger" role="alert">
                        {error}
                    </Text>
                )}
            </Flex>
        );
    if (!editing)
        return (
            <Flex direction="column" gap={1}>
                <pre className={block('text')}>
                    {isTextType(type) && type.kind !== 'Uuid'
                        ? JSON.stringify(value)
                        : String(value)}
                </pre>
                {error && (
                    <Text color="danger" role="alert">
                        {error}
                    </Text>
                )}
            </Flex>
        );
    const text = nullActive ? '' : representation.mode ? representation.text : String(value);
    const update = representation.mode ? representation.update : onChange;
    const format = parameterFormatExample(type);
    const controlProps = {
        title: format ? i18n('context_format', {format}) : undefined,
        'aria-label': representation.mode
            ? `${representation.mode === 'raw' ? 'RAW' : i18n('action_escaped')}: ${label}`
            : label,
    };
    if (type.kind === 'Unknown')
        return (
            <Flex gap={1} alignItems="flex-start">
                <TextArea
                    className={block('cell')}
                    value={text}
                    onUpdate={onChange}
                    disabled={disabled}
                    minRows={3}
                    controlProps={{'aria-label': `RAW: ${label}`}}
                    validationState={error ? 'invalid' : undefined}
                    errorMessage={error}
                />
                {actions}
            </Flex>
        );
    if (type.kind === 'Bool')
        return (
            <Flex direction="column" gap={1}>
                <SegmentedRadioGroup
                    value={nullActive ? '' : String(value)}
                    onUpdate={(next) => onChange(next === 'true')}
                    disabled={disabled}
                    aria-label={label}
                    options={[
                        {value: 'true', content: 'True'},
                        {value: 'false', content: 'False'},
                    ]}
                />
                {error && (
                    <Text color="danger" role="alert">
                        {error}
                    </Text>
                )}
            </Flex>
        );
    if (type.kind === 'Enum')
        return (
            <Flex gap={1}>
                <Select
                    className={block('cell')}
                    width="max"
                    value={nullActive ? [] : [String(value)]}
                    options={type.options.map((option) => ({value: option, content: option}))}
                    onUpdate={([next]) => {
                        if (next !== undefined) onChange(next);
                    }}
                    disabled={disabled}
                    aria-label={label}
                    validationState={error ? 'invalid' : undefined}
                    errorMessage={error}
                />
                {actions}
            </Flex>
        );
    if (isDateType(type))
        return (
            <Flex gap={1} alignItems="flex-start">
                <div className={block('cell')}>
                    <ParameterDateInput
                        value={text}
                        onUpdate={update}
                        kind={type.kind}
                        placeholder={parameterFormatExample(type)}
                        label={label}
                        disabled={disabled}
                        error={error}
                    />
                </div>
                {actions}
            </Flex>
        );
    return (
        <Flex gap={1} alignItems="flex-start">
            {(type.kind === 'String' || type.kind === 'Pg') && (
                <Button
                    view="outlined"
                    size="m"
                    className={block('binary')}
                    selected={representation.mode === 'escaped'}
                    disabled={
                        disabled ||
                        representation.invalid ||
                        (representation.mode === 'escaped' && representation.multiline)
                    }
                    onClick={() => representation.toggle('escaped')}
                    aria-label={`${i18n('action_escaped')}: ${label}`}
                >
                    <Icon data={BinaryIcon} size={16} />
                </Button>
            )}
            <TextInput
                className={block('cell')}
                size="m"
                value={text}
                placeholder={parameterFormatExample(type)}
                onUpdate={update}
                disabled={disabled}
                controlProps={controlProps}
                endContent={actions}
                validationState={error ? 'invalid' : undefined}
                errorMessage={error}
            />
        </Flex>
    );
}
