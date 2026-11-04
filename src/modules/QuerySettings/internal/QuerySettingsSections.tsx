import React, {useId} from 'react';
import {Disclosure, Flex, Select, Text, TextInput} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';
import {FormField} from '../../../components/FormField';
import {QueryAttributesEditor} from '../../QueryAttributesEditor';
import type {
    QuerySettingsFieldBinding,
    QuerySettingsSectionsProps,
} from '../../../types/querySettings';
import i18n from '../i18n';

const block = cn('qp-query-settings');

// UIKit Select exposes its control ref but currently filters out aria-required props.
function setSelectRequired(control: HTMLButtonElement | null, required: boolean | undefined) {
    if (required) control?.setAttribute('aria-required', 'true');
    else control?.removeAttribute('aria-required');
}

type Props<TValue> = Pick<
    QuerySettingsSectionsProps<TValue>,
    'general' | 'attributes' | 'sections' | 'disabled' | 'className'
> & {
    /** Presentation differences of the aggregate convenience form; not a public API. */
    presentation?: {
        generalCount?: number;
        attributesCount?: number;
    };
    afterSections?: React.ReactNode;
};

export function QuerySettingsSections<TValue = string>({
    general,
    attributes,
    sections = [],
    disabled = false,
    className,
    presentation,
    afterSections,
}: Props<TValue>) {
    const id = useId();
    const summary = (title: string, count: number | undefined) => {
        if (count === undefined) return title;
        return (
            <Flex alignItems="center" gap={2}>
                <span>{title}</span>
                <Text color="secondary">{count}</Text>
            </Flex>
        );
    };
    const fieldLabel = (field: string, title: string, required = false) => (
        <label htmlFor={`${id}-${field}`}>
            <Text color="primary">{title}</Text>
            {required && (
                <>
                    {' '}
                    <Text color="danger" aria-hidden="true">
                        *
                    </Text>
                </>
            )}
        </label>
    );
    const textField = (
        field: 'queryName' | 'ytOperationTitle',
        binding: QuerySettingsFieldBinding<string> | undefined,
        title: string,
    ) => {
        if (!binding) return null;
        return (
            <FormField label={fieldLabel(field, title, binding.required)}>
                <TextInput
                    id={`${id}-${field}`}
                    controlProps={{
                        'aria-label': title,
                        'aria-required': binding.required || undefined,
                    }}
                    value={binding.value}
                    onUpdate={(value) => {
                        if (!disabled && !binding.disabled) binding.onChange(value);
                    }}
                    onBlur={binding.onBlur}
                    disabled={disabled || binding.disabled}
                    validationState={binding.error ? 'invalid' : undefined}
                    errorMessage={binding.error}
                />
            </FormField>
        );
    };
    return (
        <Flex direction="column" className={block(null, className)}>
            {general && (
                <Disclosure
                    defaultExpanded
                    summary={summary(i18n('title_general'), presentation?.generalCount)}
                    className={block('section')}
                >
                    <Flex direction="column" gap={3} className={block('content')}>
                        {textField('queryName', general.queryName, i18n('field_query-name'))}
                        {general.customFields}
                        {general.access && (
                            <FormField
                                label={fieldLabel(
                                    'access',
                                    i18n('field_access'),
                                    general.access.required,
                                )}
                            >
                                <Select
                                    id={`${id}-access`}
                                    aria-label={i18n('field_access')}
                                    ref={(control) =>
                                        setSelectRequired(control, general.access?.required)
                                    }
                                    width="max"
                                    value={[general.access.value]}
                                    options={[
                                        {value: 'everyone', content: i18n('value_everyone')},
                                        {value: 'private', content: i18n('value_only-me')},
                                    ]}
                                    onUpdate={([value]) => {
                                        if (
                                            !disabled &&
                                            !general.access?.disabled &&
                                            (value === 'everyone' || value === 'private')
                                        )
                                            general.access?.onChange(value);
                                    }}
                                    onBlur={general.access.onBlur}
                                    disabled={disabled || general.access.disabled}
                                    validationState={general.access.error ? 'invalid' : undefined}
                                    errorMessage={general.access.error}
                                />
                            </FormField>
                        )}
                        {general.tokens && (
                            <FormField
                                label={fieldLabel(
                                    'tokens',
                                    i18n('field_tokens'),
                                    general.tokens.required,
                                )}
                            >
                                <Select
                                    id={`${id}-tokens`}
                                    aria-label={i18n('field_tokens')}
                                    ref={(control) =>
                                        setSelectRequired(control, general.tokens?.required)
                                    }
                                    width="max"
                                    multiple
                                    hasClear
                                    placeholder={i18n('context_select-token')}
                                    value={general.tokens.value}
                                    options={general.tokens.items.map((token) => ({
                                        value: token.id,
                                        content: token.title,
                                        disabled: token.disabled,
                                    }))}
                                    onUpdate={(value) => {
                                        if (!disabled && !general.tokens?.disabled)
                                            general.tokens?.onChange(value);
                                    }}
                                    onBlur={general.tokens.onBlur}
                                    disabled={
                                        disabled ||
                                        general.tokens.disabled ||
                                        general.tokens.items.length === 0
                                    }
                                    validationState={general.tokens.error ? 'invalid' : undefined}
                                    errorMessage={general.tokens.error}
                                />
                            </FormField>
                        )}
                        {textField(
                            'ytOperationTitle',
                            general.ytOperationTitle,
                            i18n('field_yt-operation-title'),
                        )}
                    </Flex>
                </Disclosure>
            )}
            {attributes && (
                <Disclosure
                    defaultExpanded
                    summary={summary(i18n('title_attributes'), presentation?.attributesCount)}
                    className={block('section')}
                >
                    <QueryAttributesEditor<TValue>
                        key="attributes"
                        {...attributes}
                        disabled={disabled || attributes.disabled}
                        className={block('content', attributes.className)}
                    />
                </Disclosure>
            )}
            {sections.map((section) => (
                <Disclosure
                    key={section.id}
                    defaultExpanded={section.defaultExpanded ?? true}
                    summary={section.title}
                    className={block('section')}
                >
                    <div className={block('content')}>{section.content}</div>
                </Disclosure>
            ))}
            {afterSections}
        </Flex>
    );
}
