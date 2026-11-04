import type {ReactNode} from 'react';
import type {
    QueryAttributesEditorProps,
    QuerySettingsAttribute,
    QuerySettingsAttributeCodec,
    QuerySettingsAttributeErrors,
    QuerySettingsAttributePermissions,
} from './queryAttributesEditor';

// Preserve the existing settings entrypoint while the standalone editor owns these types.
export type {
    QuerySettingsAttribute,
    QuerySettingsAttributeCodec,
    QuerySettingsAttributeErrors,
    QuerySettingsAttributePermissions,
} from './queryAttributesEditor';

export type QuerySettingsChangeOperation<TCustom extends object = Record<string, unknown>> =
    | {section: 'fields'; field: QuerySettingsField}
    | {section: 'custom'; field: keyof TCustom}
    | {section: 'attributes'; operation: 'add' | 'remove' | 'rename' | 'update-value'; id: string};

/** One Apply can rename an attribute and update its value atomically. */
export type QuerySettingsChange<TCustom extends object = Record<string, unknown>> = {
    changes: readonly QuerySettingsChangeOperation<TCustom>[];
};

export type QuerySettingsValue<
    TCustom extends object = Record<string, unknown>,
    TValue = string,
> = {
    queryName: string;
    access: 'everyone' | 'private';
    ytOperationTitle: string;
    tokenIds: string[];
    attributes: QuerySettingsAttribute<TValue>[];
    custom: TCustom;
};

export type QuerySettingsField = 'queryName' | 'access' | 'ytOperationTitle' | 'tokenIds';
export type QuerySettingsHiddenField = QuerySettingsField | 'tokens' | 'attributes';

export type QuerySettingsToken = {id: string; title: string; disabled?: boolean};

export type QuerySettingsErrors<TCustom extends object = Record<string, unknown>> = {
    fields?: Partial<Record<QuerySettingsField, string>>;
    /** Attribute errors are keyed by stable row ID, not the editable key or array index. */
    attributes?: Record<string, Partial<Record<'key' | 'value', string>>>;
    custom?: Partial<Record<keyof TCustom, string>>;
};

export type QuerySettingsFieldReference<TCustom extends object = Record<string, unknown>> =
    | {section: 'fields'; field: QuerySettingsField}
    | {section: 'attributes'; id: string; field: 'key' | 'value'}
    | {section: 'custom'; field: keyof TCustom};

export type QuerySettingsCustomFieldsContext<
    TCustom extends object = Record<string, unknown>,
    TValue = string,
> = {
    value: QuerySettingsValue<TCustom, TValue>;
    onChange: (
        value: QuerySettingsValue<TCustom, TValue>,
        change?: QuerySettingsChange<TCustom>,
    ) => void;
    errors?: QuerySettingsErrors<TCustom>;
    onFieldBlur?: (field: QuerySettingsFieldReference<TCustom>) => void;
    disabled: boolean;
};

export type QuerySettingsProps<
    TCustom extends object = Record<string, unknown>,
    TValue = string,
> = {
    mode?: never;
    value: QuerySettingsValue<TCustom, TValue>;
    /** Receives the full next value. Attribute drafts are emitted only when applied. */
    onChange: (
        value: QuerySettingsValue<TCustom, TValue>,
        change?: QuerySettingsChange<TCustom>,
    ) => void;
    /** Omit to hide Tokens; an empty list renders a disabled selector. */
    tokens?: QuerySettingsToken[];
    /** Hiding a field never clears its value. */
    hiddenFields?: QuerySettingsHiddenField[];
    /** Rendered immediately after Query name. The caller owns custom controls and validation. */
    renderCustomFields?: (context: QuerySettingsCustomFieldsContext<TCustom, TValue>) => ReactNode;
    /** Additional sections rendered after Attributes, outside General. */
    renderCustomSections?: (
        context: QuerySettingsCustomFieldsContext<TCustom, TValue>,
    ) => ReactNode;
    errors?: QuerySettingsErrors<TCustom>;
    onFieldBlur?: (field: QuerySettingsFieldReference<TCustom>) => void;
    /** Omitted permissions allow the operation. Global disabled takes precedence. */
    getAttributePermissions?: (
        attribute: QuerySettingsAttribute<TValue>,
    ) => QuerySettingsAttributePermissions;
    /** Synchronous draft validation before Apply; errors keep the editor open. */
    validateAttribute?: (
        draft: QuerySettingsAttribute<TValue>,
        attributes: readonly QuerySettingsAttribute<TValue>[],
    ) => QuerySettingsAttributeErrors | undefined;
    /** Opt-in exact, case-sensitive duplicate check against other applied rows. */
    checkDuplicateAttributeKeys?: boolean;
    disabled?: boolean;
    className?: string;
} & ([TValue] extends [string]
    ? [string] extends [TValue]
        ? {attributeCodec?: QuerySettingsAttributeCodec<TValue>}
        : {attributeCodec: QuerySettingsAttributeCodec<TValue>}
    : {attributeCodec: QuerySettingsAttributeCodec<TValue>});

/** An independently controlled standard field. Omit its binding to omit the control. */
export type QuerySettingsFieldBinding<T> = {
    value: T;
    onChange: (value: T) => void;
    onBlur?: () => void;
    /** Required-field presentation and accessibility; defaults to false in section mode. */
    required?: boolean;
    error?: string;
    disabled?: boolean;
};

/** Optional opinionated standard fields. Use custom sections without general for other models. */
export type QuerySettingsStandardFields = {
    queryName?: QuerySettingsFieldBinding<string>;
    access?: QuerySettingsFieldBinding<'everyone' | 'private'>;
    ytOperationTitle?: QuerySettingsFieldBinding<string>;
    tokens?: QuerySettingsFieldBinding<string[]> & {items: QuerySettingsToken[]};
    customFields?: ReactNode;
};

export type QuerySettingsSection = {
    id: string;
    title: ReactNode;
    content: ReactNode;
    defaultExpanded?: boolean;
};

/** Independent bindings for applications whose settings do not share one state object. */
export type QuerySettingsSectionsProps<TValue = string> = {
    mode: 'sections';
    value?: never;
    onChange?: never;
    tokens?: never;
    hiddenFields?: never;
    renderCustomFields?: never;
    renderCustomSections?: never;
    errors?: never;
    onFieldBlur?: never;
    getAttributePermissions?: never;
    validateAttribute?: never;
    attributeCodec?: never;
    checkDuplicateAttributeKeys?: never;
    /** Optional standard-field bindings; generic sections do not require this preset. */
    general?: QuerySettingsStandardFields;
    attributes?: QueryAttributesEditorProps<TValue>;
    sections?: QuerySettingsSection[];
    disabled?: boolean;
    className?: string;
};
