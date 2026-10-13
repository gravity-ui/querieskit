import React from 'react';
import {Button, Flex, Select, Text, TextInput} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';
import type {QueryParameterType} from '../../../types/queryParameters';
import {createId, defaultType} from '../helpers/parameters';
import i18n from '../i18n';
import './ParameterTypeEditor.scss';

const block = cn('qp-parameter-type-editor');
const kinds: QueryParameterType['kind'][] = [
    'String',
    'Number',
    'Json',
    'List',
    'Tuple',
    'Variant',
    'Dict',
];

type Props = {
    value: QueryParameterType;
    onChange: (type: QueryParameterType) => void;
    disabled?: boolean;
    label: string;
    caption?: string;
    className?: string;
    depth?: number;
};

export function ParameterTypeEditor({
    value,
    onChange,
    disabled,
    label,
    caption = label,
    className,
    depth = 0,
}: Props) {
    const nested = (type: QueryParameterType, change: Props['onChange'], nestedLabel: string) => (
        <ParameterTypeEditor
            value={type}
            onChange={change}
            disabled={disabled}
            label={`${label}: ${nestedLabel}`}
            caption={nestedLabel}
            depth={depth + 1}
        />
    );
    if (depth >= 20) return null;
    return (
        <Flex direction="column" gap={2} className={block(null, className)}>
            <Text variant="caption-2" color="secondary">
                {caption}
            </Text>
            <Select
                aria-label={label}
                value={[value.kind]}
                options={kinds.map((kind) => ({value: kind, content: kind}))}
                disabled={disabled}
                onUpdate={([kind]) => {
                    if (kind && kind !== value.kind)
                        onChange(defaultType(kind as QueryParameterType['kind']));
                }}
            />
            {value.kind === 'List' && (
                <div className={block('nested')}>
                    {nested(
                        value.item,
                        (item) => onChange({...value, item}),
                        i18n('field_item-type'),
                    )}
                </div>
            )}
            {value.kind === 'Dict' && (
                <Flex direction="column" gap={2} className={block('nested')}>
                    {nested(value.key, (key) => onChange({...value, key}), i18n('field_key-type'))}
                    {nested(
                        value.value,
                        (next) => onChange({...value, value: next}),
                        i18n('field_value-type'),
                    )}
                </Flex>
            )}
            {value.kind === 'Tuple' && (
                <Flex direction="column" gap={2} className={block('nested')}>
                    {value.items.map((item, index) => (
                        <Flex key={index} direction="column" gap={1}>
                            {nested(
                                item,
                                (next) =>
                                    onChange({
                                        ...value,
                                        items: value.items.map((entry, position) =>
                                            position === index ? next : entry,
                                        ),
                                    }),
                                `${index + 1}`,
                            )}
                            <Button
                                view="flat"
                                disabled={disabled}
                                onClick={() =>
                                    onChange({
                                        ...value,
                                        items: value.items.filter(
                                            (_, position) => position !== index,
                                        ),
                                    })
                                }
                            >
                                {i18n('action_remove-item')} {index + 1}
                            </Button>
                        </Flex>
                    ))}
                    <Button
                        disabled={disabled}
                        onClick={() =>
                            onChange({...value, items: [...value.items, defaultType('String')]})
                        }
                    >
                        {i18n('action_add-item')}
                    </Button>
                </Flex>
            )}
            {value.kind === 'Variant' && (
                <Flex direction="column" gap={2} className={block('nested')}>
                    {value.options.map((option, index) => (
                        <Flex key={option.id} direction="column" gap={1}>
                            <TextInput
                                value={option.name}
                                disabled={disabled}
                                controlProps={{
                                    'aria-label': `${label}: ${i18n('field_option-name')} ${index + 1}`,
                                }}
                                onUpdate={(name) =>
                                    onChange({
                                        ...value,
                                        options: value.options.map((entry) =>
                                            entry.id === option.id ? {...entry, name} : entry,
                                        ),
                                    })
                                }
                            />
                            {nested(
                                option.type,
                                (type) =>
                                    onChange({
                                        ...value,
                                        options: value.options.map((entry) =>
                                            entry.id === option.id ? {...entry, type} : entry,
                                        ),
                                    }),
                                option.name || `${index + 1}`,
                            )}
                            <Button
                                view="flat"
                                disabled={disabled || value.options.length === 1}
                                onClick={() =>
                                    onChange({
                                        ...value,
                                        options: value.options.filter(
                                            (entry) => entry.id !== option.id,
                                        ),
                                    })
                                }
                            >
                                {i18n('action_remove-option')} {index + 1}
                            </Button>
                        </Flex>
                    ))}
                    <Button
                        disabled={disabled}
                        onClick={() =>
                            onChange({
                                ...value,
                                options: [
                                    ...value.options,
                                    {id: createId(), name: '', type: defaultType('String')},
                                ],
                            })
                        }
                    >
                        {i18n('action_add-option')}
                    </Button>
                </Flex>
            )}
        </Flex>
    );
}
