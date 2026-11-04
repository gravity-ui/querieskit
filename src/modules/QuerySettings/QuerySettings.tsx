import React from 'react';
import type {
    QuerySettingsAttribute,
    QuerySettingsChange,
    QuerySettingsField,
    QuerySettingsFieldBinding,
    QuerySettingsHiddenField,
    QuerySettingsProps,
    QuerySettingsSectionsProps,
    QuerySettingsValue,
} from '../../types/querySettings';
import type {
    QueryAttributesChangeOperation,
    QueryAttributesEditorProps,
} from '../../types/queryAttributesEditor';
import {QuerySettingsSections} from './internal/QuerySettingsSections';
import './QuerySettings.scss';

/** Adapt the convenience form to the same independent bindings used by section consumers. */
function AggregateQuerySettings<TCustom extends object, TValue>({
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
    checkDuplicateAttributeKeys,
    disabled = false,
    className,
}: QuerySettingsProps<TCustom, TValue>) {
    const isVisible = (field: QuerySettingsHiddenField) => !hiddenFields.includes(field);
    const showTokens = tokens !== undefined && isVisible('tokens') && isVisible('tokenIds');
    const change = (
        next: QuerySettingsValue<TCustom, TValue>,
        details?: QuerySettingsChange<TCustom>,
    ) => {
        if (disabled) return;
        if (details) onChange(next, details);
        else onChange(next);
    };
    const bindField = <TField extends QuerySettingsField>(
        field: TField,
    ): QuerySettingsFieldBinding<QuerySettingsValue<TCustom, TValue>[TField]> => ({
        value: value[field],
        onChange: (next) =>
            change({...value, [field]: next}, {changes: [{section: 'fields', field}]}),
        onBlur: () => onFieldBlur?.({section: 'fields', field}),
        error: errors?.fields?.[field],
    });
    const context = {value, onChange: change, errors, onFieldBlur, disabled};
    const attributeBindings = {
        items: value.attributes,
        onChange: (
            items: QuerySettingsAttribute<TValue>[],
            operations: readonly QueryAttributesChangeOperation[],
        ) =>
            change(
                {...value, attributes: items},
                {
                    changes: operations.map((operation) => ({
                        ...operation,
                        section: 'attributes' as const,
                    })),
                },
            ),
        errors: errors?.attributes,
        onFieldBlur: (field: {id: string; field: 'key' | 'value'}) =>
            onFieldBlur?.({...field, section: 'attributes'}),
        getAttributePermissions,
        validateAttribute,
        checkDuplicateAttributeKeys,
    };
    // Both public contracts require the codec for non-string values. Preserve that
    // correlation when forwarding the destructured conditional generic props.
    const attributes = {...attributeBindings, attributeCodec} as QueryAttributesEditorProps<TValue>;
    return (
        <QuerySettingsSections<TValue>
            general={{
                queryName: isVisible('queryName')
                    ? {...bindField('queryName'), required: true}
                    : undefined,
                access: isVisible('access') ? bindField('access') : undefined,
                ytOperationTitle: isVisible('ytOperationTitle')
                    ? {...bindField('ytOperationTitle'), required: true}
                    : undefined,
                tokens: showTokens ? {...bindField('tokenIds'), items: tokens} : undefined,
                customFields: renderCustomFields?.(context),
            }}
            attributes={isVisible('attributes') ? attributes : undefined}
            presentation={{
                generalCount:
                    Number(isVisible('queryName')) +
                    Number(isVisible('access')) +
                    Number(isVisible('ytOperationTitle')) +
                    Number(showTokens),
                attributesCount: value.attributes.length,
            }}
            afterSections={renderCustomSections?.(context)}
            disabled={disabled}
            className={className}
        />
    );
}

export function QuerySettings<TCustom extends object = Record<string, unknown>, TValue = string>(
    props: QuerySettingsProps<TCustom, TValue> | QuerySettingsSectionsProps<TValue>,
) {
    if (props.mode === 'sections') return <QuerySettingsSections {...props} />;
    return <AggregateQuerySettings key="aggregate" {...props} />;
}
