import React, {useId, useRef, useState} from 'react';
import {Button, Disclosure, Flex, Icon, Select, Text, TextInput} from '@gravity-ui/uikit';
import PlusIcon from '@gravity-ui/icons/svgs/plus.svg';
import cn from 'bem-cn-lite';
import {FormField} from '../../components/FormField';
import type {
    QuerySettingsAttribute,
    QuerySettingsProps,
    QuerySettingsValue,
} from '../../types/querySettings';
import i18n from './i18n';
import {AttributeRow} from './internal/AttributeRow';
import './QuerySettings.scss';

const block = cn('qp-query-settings');

export function QuerySettings<TCustom extends object = Record<string, unknown>>({
    value,
    onChange,
    tokens,
    hiddenFields = [],
    renderCustomFields,
    errors,
    onFieldBlur,
    disabled = false,
    className,
}: QuerySettingsProps<TCustom>) {
    const id = useId();
    const nextAttribute = useRef(0);
    const [newAttributes, setNewAttributes] = useState<QuerySettingsAttribute[]>([]);
    const addButton = useRef<HTMLButtonElement>(null);
    const change = (next: QuerySettingsValue<TCustom>) => {
        if (!disabled) onChange(next);
    };
    const addAttribute = () => {
        if (disabled) return;
        const existingIds = new Set(
            [...value.attributes, ...newAttributes].map((attribute) => attribute.id),
        );
        let attributeId: string;
        do {
            attributeId = `${id}-attribute-${++nextAttribute.current}`;
        } while (existingIds.has(attributeId));
        setNewAttributes((current) => [...current, {id: attributeId, key: '', value: ''}]);
    };
    const discardNewAttribute = (attributeId: string) => {
        setNewAttributes((current) => current.filter((row) => row.id !== attributeId));
        addButton.current?.focus();
    };
    const summary = (title: string, count: number) => (
        <Flex alignItems="center" gap={2}>
            <span>{title}</span>
            <Text color="secondary">{count}</Text>
        </Flex>
    );
    const textField = (field: 'queryName' | 'ytOperationTitle', title: string) => (
        <FormField
            label={
                <label htmlFor={`${id}-${field}`}>
                    <Text color="primary">{title}</Text>{' '}
                    <Text color="danger" aria-hidden="true">
                        *
                    </Text>
                </label>
            }
        >
            <TextInput
                id={`${id}-${field}`}
                controlProps={{'aria-label': title, 'aria-required': true}}
                value={value[field]}
                onUpdate={(next) => change({...value, [field]: next})}
                onBlur={() => onFieldBlur?.({section: 'fields', field})}
                disabled={disabled}
                validationState={errors?.fields?.[field] ? 'invalid' : undefined}
                errorMessage={errors?.fields?.[field]}
            />
        </FormField>
    );

    return (
        <Flex direction="column" className={block(null, className)}>
            <Disclosure
                defaultExpanded
                summary={summary(
                    i18n('title_general'),
                    3 + Number(tokens !== undefined && !hiddenFields.includes('tokens')),
                )}
                className={block('section')}
            >
                <Flex direction="column" gap={3} className={block('content')}>
                    {textField('queryName', i18n('field_query-name'))}
                    {renderCustomFields?.({value, onChange: change, errors, onFieldBlur, disabled})}
                    <FormField
                        label={<label htmlFor={`${id}-access`}>{i18n('field_access')}</label>}
                    >
                        <Select
                            id={`${id}-access`}
                            aria-label={i18n('field_access')}
                            width="max"
                            value={[value.access]}
                            options={[
                                {value: 'everyone', content: i18n('value_everyone')},
                                {value: 'private', content: i18n('value_only-me')},
                            ]}
                            onUpdate={([access]) => {
                                if (access === 'everyone' || access === 'private')
                                    change({...value, access});
                            }}
                            onBlur={() => onFieldBlur?.({section: 'fields', field: 'access'})}
                            disabled={disabled}
                            validationState={errors?.fields?.access ? 'invalid' : undefined}
                            errorMessage={errors?.fields?.access}
                        />
                    </FormField>
                    {tokens !== undefined && !hiddenFields.includes('tokens') && (
                        <FormField
                            label={<label htmlFor={`${id}-tokens`}>{i18n('field_tokens')}</label>}
                        >
                            <Select
                                id={`${id}-tokens`}
                                aria-label={i18n('field_tokens')}
                                width="max"
                                multiple
                                hasClear
                                placeholder={i18n('context_select-token')}
                                value={value.tokenIds}
                                options={tokens.map((token) => ({
                                    value: token.id,
                                    content: token.title,
                                    disabled: token.disabled,
                                }))}
                                onUpdate={(tokenIds) => change({...value, tokenIds})}
                                onBlur={() => onFieldBlur?.({section: 'fields', field: 'tokenIds'})}
                                disabled={disabled || tokens.length === 0}
                                validationState={errors?.fields?.tokenIds ? 'invalid' : undefined}
                                errorMessage={errors?.fields?.tokenIds}
                            />
                        </FormField>
                    )}
                    {textField('ytOperationTitle', i18n('field_yt-operation-title'))}
                </Flex>
            </Disclosure>
            {!hiddenFields.includes('attributes') && (
                <Disclosure
                    defaultExpanded
                    summary={summary(
                        i18n('title_attributes'),
                        value.attributes.length + newAttributes.length,
                    )}
                    className={block('section')}
                >
                    <Flex direction="column" gap={3} className={block('content')}>
                        <Flex direction="column" gap={1}>
                            {[...value.attributes, ...newAttributes].map((attribute, index) => {
                                const isNew = index >= value.attributes.length;
                                return (
                                    <AttributeRow
                                        key={attribute.id}
                                        attribute={attribute}
                                        index={index + 1}
                                        isNew={isNew}
                                        disabled={disabled}
                                        errors={errors?.attributes?.[attribute.id]}
                                        onApply={(next) => {
                                            change({
                                                ...value,
                                                attributes: isNew
                                                    ? [...value.attributes, next]
                                                    : value.attributes.map((row) =>
                                                          row.id === next.id ? next : row,
                                                      ),
                                            });
                                            if (isNew) discardNewAttribute(attribute.id);
                                        }}
                                        onCancel={() => {
                                            if (isNew) discardNewAttribute(attribute.id);
                                        }}
                                        onRemove={() =>
                                            change({
                                                ...value,
                                                attributes: value.attributes.filter(
                                                    (row) => row.id !== attribute.id,
                                                ),
                                            })
                                        }
                                        onBlur={(field) =>
                                            onFieldBlur?.({
                                                section: 'attributes',
                                                id: attribute.id,
                                                field,
                                            })
                                        }
                                    />
                                );
                            })}
                        </Flex>
                        <Flex>
                            <Button ref={addButton} onClick={addAttribute} disabled={disabled}>
                                <Icon data={PlusIcon} size={16} />
                                {i18n('action_add-attribute')}
                            </Button>
                        </Flex>
                    </Flex>
                </Disclosure>
            )}
        </Flex>
    );
}
