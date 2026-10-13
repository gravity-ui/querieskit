import React from 'react';
import {Button, Flex, Select, Text, TextInput} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';
import type {QueryParameterType} from '../../../types/queryParameters';
import {createId, defaultType, parameterKinds} from '../helpers/parameters';
import i18n from '../i18n';
import './ParameterTypeEditor.scss';

const block = cn('qp-parameter-type-editor');

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
    const options =
        value.kind === 'Struct' ? value.fields : value.kind === 'Variant' ? value.options : [];
    const updateOptions = (next: typeof options) => {
        if (value.kind === 'Struct') onChange({...value, fields: next});
        else if (value.kind === 'Variant') onChange({...value, options: next});
    };
    if (depth >= 20) return null;
    return (
        <Flex direction="column" gap={2} className={block(null, className)}>
            <Text variant="caption-2" color="secondary">
                {caption}
            </Text>
            <Select
                aria-label={label}
                value={[value.kind]}
                options={[
                    ...(value.kind === 'Unknown'
                        ? [{value: 'Unknown', content: value.name, disabled: true}]
                        : []),
                    ...parameterKinds.map((kind) => ({value: kind, content: kind})),
                ]}
                disabled={disabled}
                onUpdate={([kind]) => {
                    if (kind && kind !== value.kind)
                        onChange(defaultType(kind as QueryParameterType['kind']));
                }}
            />
            {value.kind === 'Decimal' && (
                <Flex gap={2}>
                    <TextInput
                        value={value.precision?.toString() ?? ''}
                        label={i18n('field_precision')}
                        disabled={disabled}
                        controlProps={{'aria-label': `${label}: ${i18n('field_precision')}`}}
                        onUpdate={(text) =>
                            onChange({
                                ...value,
                                precision: text === '' ? undefined : Number(text),
                            })
                        }
                    />
                    <TextInput
                        value={value.scale?.toString() ?? ''}
                        label={i18n('field_scale')}
                        disabled={disabled}
                        controlProps={{'aria-label': `${label}: ${i18n('field_scale')}`}}
                        onUpdate={(text) =>
                            onChange({
                                ...value,
                                scale: text === '' ? undefined : Number(text),
                            })
                        }
                    />
                </Flex>
            )}
            {value.kind === 'Pg' && (
                <TextInput
                    value={value.name}
                    disabled={disabled}
                    controlProps={{'aria-label': `${label}: ${i18n('field_type')}`}}
                    onUpdate={(name) => onChange({...value, name})}
                />
            )}
            {value.kind === 'Enum' && (
                <Flex direction="column" gap={2} className={block('nested')}>
                    {value.options.map((option, index) => (
                        <Flex key={index} gap={1}>
                            <TextInput
                                value={option}
                                disabled={disabled}
                                controlProps={{
                                    'aria-label': `${label}: ${i18n('field_option-name')} ${index + 1}`,
                                }}
                                onUpdate={(name) =>
                                    onChange({
                                        ...value,
                                        options: value.options.map((entry, position) =>
                                            position === index ? name : entry,
                                        ),
                                    })
                                }
                            />
                            <Button
                                view="flat"
                                disabled={disabled || value.options.length === 1}
                                onClick={() =>
                                    onChange({
                                        ...value,
                                        options: value.options.filter(
                                            (_, position) => position !== index,
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
                        onClick={() => onChange({...value, options: [...value.options, '']})}
                    >
                        {i18n('action_add-option')}
                    </Button>
                </Flex>
            )}
            {(value.kind === 'List' || value.kind === 'Optional') && (
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
            {(value.kind === 'Variant' || value.kind === 'Struct') && (
                <Flex direction="column" gap={2} className={block('nested')}>
                    {options.map((option, index) => (
                        <Flex key={option.id} direction="column" gap={1}>
                            <TextInput
                                value={option.name}
                                disabled={disabled}
                                controlProps={{
                                    'aria-label': `${label}: ${i18n('field_option-name')} ${index + 1}`,
                                }}
                                onUpdate={(name) =>
                                    updateOptions(
                                        options.map((entry) =>
                                            entry.id === option.id ? {...entry, name} : entry,
                                        ),
                                    )
                                }
                            />
                            {nested(
                                option.type,
                                (type) =>
                                    updateOptions(
                                        options.map((entry) =>
                                            entry.id === option.id ? {...entry, type} : entry,
                                        ),
                                    ),
                                option.name || `${index + 1}`,
                            )}
                            <Button
                                view="flat"
                                disabled={
                                    disabled || (value.kind === 'Variant' && options.length === 1)
                                }
                                onClick={() =>
                                    updateOptions(options.filter((entry) => entry.id !== option.id))
                                }
                            >
                                {i18n('action_remove-option')} {index + 1}
                            </Button>
                        </Flex>
                    ))}
                    <Button
                        disabled={disabled}
                        onClick={() =>
                            updateOptions([
                                ...options,
                                {id: createId(), name: '', type: defaultType('String')},
                            ])
                        }
                    >
                        {i18n('action_add-option')}
                    </Button>
                </Flex>
            )}
        </Flex>
    );
}
