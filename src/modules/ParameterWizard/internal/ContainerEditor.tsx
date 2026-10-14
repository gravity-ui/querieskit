import React from 'react';
import {TrashBin} from '@gravity-ui/icons';
import {ActionTooltip, Button, Flex, Icon, Select, Text} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';
import type {ParameterType, ParameterValue} from '../../../types/parameterWizard';
import {defaultValue, isRecord, variantIndex, variantValue} from '../helpers/values';
import i18n from '../i18n';
import type {EditorProps} from './types';
import {useItemKeys} from './useItemKeys';
import './ContainerEditor.scss';

const block = cn('qp-parameter-container');

function getStructValue(
    value: ParameterValue,
    key: string | number,
    index: number,
    optional?: boolean,
) {
    if (Array.isArray(value)) return value[index];
    if (isRecord(value)) {
        if (Object.prototype.hasOwnProperty.call(value, key)) return value[key];
        if (optional) return null;
    }
    return undefined;
}

interface ContainerEditorProps extends EditorProps {
    renderEditor: (props: EditorProps) => React.ReactNode;
}

export function ContainerEditor({
    type,
    value,
    onChange,
    name,
    disabled,
    readOnly,
    renderEditor,
}: ContainerEditorProps) {
    let items: ParameterValue[] = [];
    if (Array.isArray(value)) items = value;
    else if (isRecord(value) && type.name === 'Dict') items = Object.entries(value);
    const {keys, removeKey} = useItemKeys(items.length);
    const renderChild = (
        childType: ParameterType,
        childValue: ParameterValue,
        childName: string,
        change: (value: ParameterValue) => void,
        itemAction?: React.ReactNode,
    ) =>
        renderEditor({
            type: childType,
            value: childValue,
            name: childName,
            hideLabel: true,
            onChange: change,
            itemAction,
            disabled,
            readOnly,
        });

    if (type.name === 'Variant') {
        const index = variantIndex(value, type);
        const field = type.struct[index];
        return (
            <Flex className={block()} direction="column" gap={3}>
                <Select
                    aria-label={`${name}: ${i18n('field_variant')}`}
                    width="max"
                    disabled={disabled || readOnly}
                    placeholder={i18n('field_variant')}
                    value={index < 0 ? [] : [String(index)]}
                    options={type.struct.map((item, i) => ({
                        value: String(i),
                        content: String(item.key),
                    }))}
                    onUpdate={([selected]) => {
                        const next = Number(selected);
                        onChange(variantValue(type, next, defaultValue(type.struct[next].type)));
                    }}
                />
                {field && (
                    <div key={index}>
                        {renderChild(
                            field.type,
                            Array.isArray(value) ? value[1] : undefined,
                            `${name}.${field.key}`,
                            (v) => onChange(variantValue(type, index, v)),
                        )}
                    </div>
                )}
            </Flex>
        );
    }
    if (type.name === 'Struct') {
        return (
            <Flex className={block()} direction="column" gap={3}>
                {type.struct.map((field, index) => (
                    <div key={field.key}>
                        {renderChild(
                            field.type,
                            getStructValue(value, field.key, index, field.type.optional),
                            `${name}.${field.key}`,
                            (v) => {
                                if (Array.isArray(value)) {
                                    const next = [...value];
                                    next[index] = v;
                                    onChange(next);
                                } else {
                                    onChange({
                                        ...(isRecord(value)
                                            ? value
                                            : Object.fromEntries(
                                                  type.struct.map((member) => [
                                                      member.key,
                                                      defaultValue(member.type),
                                                  ]),
                                              )),
                                        [field.key]: v,
                                    });
                                }
                            },
                        )}
                    </div>
                ))}
            </Flex>
        );
    }
    if (type.name === 'Tuple') {
        return (
            <Flex className={block()} direction="column" gap={3}>
                {type.type.map((child, index) => (
                    <div key={index}>
                        {renderChild(
                            child,
                            Array.isArray(value) ? value[index] : undefined,
                            `${name}[${index}]`,
                            (v) => {
                                const next = Array.isArray(value)
                                    ? [...value]
                                    : type.type.map(defaultValue);
                                next[index] = v;
                                onChange(next);
                            },
                        )}
                    </div>
                ))}
            </Flex>
        );
    }
    if (type.name !== 'List' && type.name !== 'Dict' && type.name !== 'Set') return null;
    let itemType: ParameterType;
    if (type.name === 'Dict') itemType = {name: 'Tuple', type: type.type};
    else if (type.name === 'Set') itemType = {name: 'Tuple', type: [type.type, {name: 'Void'}]};
    else itemType = type.type;
    const update = (index: number, v: ParameterValue) => {
        const next = [...items];
        next[index] = v;
        onChange(next);
    };
    return (
        <Flex className={block()} direction="column" gap={3}>
            {items.length === 0 && <Text color="secondary">{i18n('context_empty')}</Text>}
            {items.map((item, index) => {
                const itemAction = !readOnly && (
                    <ActionTooltip title={`${i18n('action_delete-item')} ${index + 1}`}>
                        <Button
                            view="flat-secondary"
                            size="m"
                            disabled={disabled}
                            aria-label={`${i18n('action_delete-item')} ${index + 1}`}
                            onClick={() => {
                                removeKey(index);
                                onChange(items.filter((_, i) => i !== index));
                            }}
                        >
                            <Icon data={TrashBin} size={16} />
                        </Button>
                    </ActionTooltip>
                );
                return (
                    <div key={keys[index]}>
                        {type.name === 'Set'
                            ? renderChild(
                                  type.type,
                                  Array.isArray(item) ? item[0] : undefined,
                                  `${name}[${index}]`,
                                  (v) => update(index, [v, 'Void']),
                                  itemAction,
                              )
                            : renderChild(
                                  itemType,
                                  item,
                                  `${name}[${index}]`,
                                  (v) => update(index, v),
                                  itemAction,
                              )}
                    </div>
                );
            })}
            {!readOnly && (
                <div>
                    <Button
                        disabled={disabled}
                        onClick={() => onChange([...items, defaultValue(itemType)])}
                    >
                        {i18n('action_add-item')}
                    </Button>
                </div>
            )}
        </Flex>
    );
}
