import React, {useState} from 'react';
import {Flex, TextArea} from '@gravity-ui/uikit';
import type {
    QueryParameterEntry,
    QueryParameterItem,
    QueryParameterType,
    QueryParameterValue,
} from '../../../types/queryParameters';
import {defaultValue, isNumericType, isTextType} from '../helpers/parameters';
import i18n from '../i18n';
import type {RecursiveValueProps} from './parameterValueTypes';
import cn from 'bem-cn-lite';
import './DictEntry.scss';
import {childProps} from './parameterValueHelpers';
import {useChildValidity} from './useChildValidity';
import {needsEscapes, useRepresentation} from './useRepresentation';
import {ValueActions} from './ValueActions';

const block = cn('qp-parameter-value');

export function DictEntry(
    props: RecursiveValueProps & {
        type: Extract<QueryParameterType, {kind: 'Dict'}>;
        entry: QueryParameterEntry;
        initial?: QueryParameterEntry;
        index: number;
    },
) {
    const {ValueComponent, type, entry, initial, index, value, onChange, editing, disabled} = props;
    const entries = value as QueryParameterEntry[];
    const [generation, setGeneration] = useState(0);
    const {pending, childValidity, clearChildren} = useChildValidity(props.onValidityChange);
    const childrenProps = {...props, onValidityChange: childValidity};
    const update = (next: QueryParameterEntry) =>
        onChange(entries.map((item) => (item.id === entry.id ? next : item)));
    const pairType: QueryParameterType = {kind: 'Tuple', items: [type.key, type.value]};
    const pair = [
        {id: 'key', value: entry.key},
        {id: 'value', value: entry.value},
    ];
    const pairProps = {
        ...props,
        header: undefined,
        type: pairType,
        value: pair,
        path: `${props.path ?? '$'}/${entry.id}`,
        label: `${props.label}: ${index + 1}`,
        onChange: (next: QueryParameterValue) => {
            const parts = next as QueryParameterItem[];
            update({...entry, key: parts[0].value, value: parts[1].value});
        },
    };
    const representation = useRepresentation(pairProps);
    const paired =
        typeof entry.key === 'string' &&
        typeof entry.value === 'string' &&
        (isTextType(type.key) || isNumericType(type.key)) &&
        (isTextType(type.value) || isNumericType(type.value)) &&
        !needsEscapes(type.key, entry.key) &&
        !needsEscapes(type.value, entry.value);
    const actions = editing && (
        <ValueActions
            label={pairProps.label}
            disabled={disabled}
            raw={representation.mode === 'raw'}
            rawDisabled={representation.invalid || pending.size > 0}
            onRaw={() => representation.toggle('raw')}
            onReset={() => {
                representation.clear();
                clearChildren();
                setGeneration((current) => current + 1);
                update({
                    ...entry,
                    key: initial?.key ?? defaultValue(type.key),
                    value: initial?.value ?? defaultValue(type.value),
                });
            }}
        />
    );
    if (representation.mode === 'raw')
        return (
            <Flex gap={1} alignItems="flex-start">
                <TextArea
                    className={block('cell')}
                    value={representation.text}
                    onUpdate={representation.update}
                    disabled={disabled}
                    minRows={2}
                    controlProps={{'aria-label': `RAW: ${pairProps.label}`}}
                    validationState={representation.invalid ? 'invalid' : undefined}
                    errorMessage={representation.error}
                />
                {actions}
            </Flex>
        );
    if (!paired)
        return (
            <Flex key={generation} direction="column" gap={2}>
                <ValueComponent
                    {...childProps(
                        childrenProps,
                        type.key,
                        entry.key,
                        initial?.key,
                        `${entry.id}/key`,
                        `${index + 1}: ${i18n('field_key')}`,
                        (key) => update({...entry, key}),
                    )}
                />
                <ValueComponent
                    {...childProps(
                        childrenProps,
                        type.value,
                        entry.value,
                        initial?.value,
                        `${entry.id}/value`,
                        `${index + 1}: ${i18n('field_value')}`,
                        (next) => update({...entry, value: next}),
                    )}
                />
            </Flex>
        );
    return (
        <Flex key={generation} gap={2} alignItems="flex-start">
            {(['key', 'value'] as const).map((field) => {
                return editing ? (
                    <div key={field} className={block('cell')}>
                        <ValueComponent
                            {...childProps(
                                childrenProps,
                                field === 'key' ? type.key : type.value,
                                entry[field],
                                initial?.[field],
                                `${entry.id}/${field}`,
                                `${index + 1}: ${i18n(field === 'key' ? 'field_key' : 'field_value')}`,
                                (next) => update({...entry, [field]: next}),
                            )}
                        />
                    </div>
                ) : (
                    <pre key={field} className={block('text', {paired: true})}>
                        {field === 'value' && isTextType(type.value)
                            ? JSON.stringify(entry[field])
                            : String(entry[field])}
                    </pre>
                );
            })}
            {actions}
        </Flex>
    );
}
