import React, {useId, useRef, useState} from 'react';
import {Button, Disclosure, Flex, Icon, Select, Text, TextInput} from '@gravity-ui/uikit';
import PlusIcon from '@gravity-ui/icons/svgs/plus.svg';
import cn from 'bem-cn-lite';
import {FormField} from '../../components/FormField';
import type {
    QuerySettingsChange,
    QuerySettingsChangeOperation,
    QuerySettingsHiddenField,
    QuerySettingsProps,
    QuerySettingsValue,
} from '../../types/querySettings';
import i18n from './i18n';
import {AttributeRow} from './internal/AttributeRow';
import './QuerySettings.scss';

const block = cn('qp-query-settings');

export function QuerySettings<TCustom extends object = Record<string, unknown>, TValue = string>({
    value,
    onChange,
    tokens,
    hiddenFields = [],
    renderCustomFields,
    renderCustomSections,
    errors,
    onFieldBlur,
    getAttributePermissions,
    validateAttribute,
    attributeCodec,
    checkDuplicateAttributeKeys = false,
    disabled = false,
    className,
}: QuerySettingsProps<TCustom, TValue>) {
    const isVisible = (field: QuerySettingsHiddenField) => !hiddenFields.includes(field);
    const showTokens = tokens !== undefined && isVisible('tokens') && isVisible('tokenIds');
    const id = useId();
    const nextAttribute = useRef(0);
    const [newAttributes, setNewAttributes] = useState<Array<{id: string}>>([]);
    const addButton = useRef<HTMLButtonElement>(null);
    const change = (
        next: QuerySettingsValue<TCustom, TValue>,
        details?: QuerySettingsChange<TCustom>,
    ) => {
        if (disabled) return;
        if (details) onChange(next, details);
        else onChange(next);
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
        setNewAttributes((current) => [...current, {id: attributeId}]);
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
                onUpdate={(next) =>
                    change({...value, [field]: next}, {changes: [{section: 'fields', field}]})
                }
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
                    Number(isVisible('queryName')) +
                        Number(isVisible('access')) +
                        Number(isVisible('ytOperationTitle')) +
                        Number(showTokens),
                )}
                className={block('section')}
            >
                <Flex direction="column" gap={3} className={block('content')}>
                    {isVisible('queryName') && textField('queryName', i18n('field_query-name'))}
                    {renderCustomFields?.({value, onChange: change, errors, onFieldBlur, disabled})}
                    {isVisible('access') && (
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
                                        change(
                                            {...value, access},
                                            {changes: [{section: 'fields', field: 'access'}]},
                                        );
                                }}
                                onBlur={() => onFieldBlur?.({section: 'fields', field: 'access'})}
                                disabled={disabled}
                                validationState={errors?.fields?.access ? 'invalid' : undefined}
                                errorMessage={errors?.fields?.access}
                            />
                        </FormField>
                    )}
                    {showTokens && (
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
                                onUpdate={(tokenIds) =>
                                    change(
                                        {...value, tokenIds},
                                        {changes: [{section: 'fields', field: 'tokenIds'}]},
                                    )
                                }
                                onBlur={() => onFieldBlur?.({section: 'fields', field: 'tokenIds'})}
                                disabled={disabled || tokens.length === 0}
                                validationState={errors?.fields?.tokenIds ? 'invalid' : undefined}
                                errorMessage={errors?.fields?.tokenIds}
                            />
                        </FormField>
                    )}
                    {isVisible('ytOperationTitle') &&
                        textField('ytOperationTitle', i18n('field_yt-operation-title'))}
                </Flex>
            </Disclosure>
            {isVisible('attributes') && (
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
                            {[...value.attributes, ...newAttributes].map((attributeRow, index) => {
                                const attribute = value.attributes[index];
                                const isNew = attribute === undefined;
                                const rowId = attributeRow.id;
                                // Legacy string drafts exposed their empty value to permissions.
                                // Typed drafts have no raw value until the codec successfully parses.
                                const permissionAttribute =
                                    attribute ??
                                    (attributeCodec
                                        ? undefined
                                        : {id: rowId, key: '', value: '' as TValue});
                                return (
                                    <AttributeRow
                                        key={rowId}
                                        id={rowId}
                                        attribute={attribute}
                                        codec={attributeCodec}
                                        index={index + 1}
                                        isNew={isNew}
                                        disabled={disabled}
                                        errors={errors?.attributes?.[rowId]}
                                        permissions={
                                            permissionAttribute
                                                ? getAttributePermissions?.(permissionAttribute)
                                                : undefined
                                        }
                                        validate={(draft) => {
                                            const validation = {
                                                ...validateAttribute?.(draft, value.attributes),
                                            };
                                            if (isNew && attributeCodec) {
                                                const permissions =
                                                    getAttributePermissions?.(draft);
                                                if (permissions?.canEditKey === false)
                                                    validation.key = i18n(
                                                        'alert_attribute-edit-not-allowed',
                                                    );
                                                if (permissions?.canEditValue === false)
                                                    validation.value = i18n(
                                                        'alert_attribute-edit-not-allowed',
                                                    );
                                            }
                                            if (
                                                checkDuplicateAttributeKeys &&
                                                value.attributes.some(
                                                    (row) =>
                                                        row.id !== draft.id &&
                                                        row.key === draft.key,
                                                )
                                            )
                                                validation.key = i18n('alert_duplicate-key');
                                            return validation;
                                        }}
                                        onApply={(next, valueChanged) => {
                                            const changes: QuerySettingsChangeOperation<TCustom>[] =
                                                [];
                                            const operation = (
                                                kind: 'add' | 'rename' | 'update-value',
                                            ) =>
                                                changes.push({
                                                    section: 'attributes',
                                                    operation: kind,
                                                    id: rowId,
                                                });
                                            if (isNew) operation('add');
                                            else {
                                                if (next.key !== attribute.key) operation('rename');
                                                if (valueChanged) operation('update-value');
                                            }
                                            change(
                                                {
                                                    ...value,
                                                    attributes: isNew
                                                        ? [...value.attributes, next]
                                                        : value.attributes.map((row) =>
                                                              row.id === next.id ? next : row,
                                                          ),
                                                },
                                                {changes},
                                            );
                                            if (isNew) discardNewAttribute(rowId);
                                        }}
                                        onCancel={() => {
                                            if (isNew) discardNewAttribute(rowId);
                                        }}
                                        onRemove={() =>
                                            change(
                                                {
                                                    ...value,
                                                    attributes: value.attributes.filter(
                                                        (row) => row.id !== rowId,
                                                    ),
                                                },
                                                {
                                                    changes: [
                                                        {
                                                            section: 'attributes',
                                                            operation: 'remove',
                                                            id: rowId,
                                                        },
                                                    ],
                                                },
                                            )
                                        }
                                        onBlur={(field) =>
                                            onFieldBlur?.({
                                                section: 'attributes',
                                                id: rowId,
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
            {renderCustomSections?.({value, onChange: change, errors, onFieldBlur, disabled})}
        </Flex>
    );
}
