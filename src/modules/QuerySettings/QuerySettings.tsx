import React, {useId} from 'react';
import {Disclosure, Flex, Select, Text, TextInput} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';
import {FormField} from '../../components/FormField';
import type {
    QuerySettingsChange,
    QuerySettingsHiddenField,
    QuerySettingsProps,
    QuerySettingsValue,
} from '../../types/querySettings';
import i18n from './i18n';
import {QueryAttributesEditor} from '../QueryAttributesEditor';
import type {QueryAttributesEditorProps} from '../../types/queryAttributesEditor';
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
    const change = (
        next: QuerySettingsValue<TCustom, TValue>,
        details?: QuerySettingsChange<TCustom>,
    ) => {
        if (disabled) return;
        if (details) onChange(next, details);
        else onChange(next);
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
                    summary={summary(i18n('title_attributes'), value.attributes.length)}
                    className={block('section')}
                >
                    <Flex direction="column" gap={3} className={block('content')}>
                        <QueryAttributesEditor<TValue>
                            key="attributes"
                            {...({attributeCodec} as QueryAttributesEditorProps<TValue>)}
                            items={value.attributes}
                            onChange={(attributes, operations) =>
                                change(
                                    {...value, attributes},
                                    {
                                        changes: operations.map((operation) => ({
                                            ...operation,
                                            section: 'attributes' as const,
                                        })),
                                    },
                                )
                            }
                            errors={errors?.attributes}
                            onFieldBlur={(field) =>
                                onFieldBlur?.({...field, section: 'attributes'})
                            }
                            getAttributePermissions={getAttributePermissions}
                            validateAttribute={validateAttribute}
                            checkDuplicateAttributeKeys={checkDuplicateAttributeKeys}
                            disabled={disabled}
                        />
                    </Flex>
                </Disclosure>
            )}
            {renderCustomSections?.({value, onChange: change, errors, onFieldBlur, disabled})}
        </Flex>
    );
}
