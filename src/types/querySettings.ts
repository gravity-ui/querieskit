import type {ReactNode} from 'react';

export type QuerySettingsAttribute = {id: string; key: string; value: string};

export type QuerySettingsValue<TCustom extends object = Record<string, unknown>> = {
    queryName: string;
    access: 'everyone' | 'private';
    ytOperationTitle: string;
    tokenIds: string[];
    attributes: QuerySettingsAttribute[];
    custom: TCustom;
};

export type QuerySettingsField = 'queryName' | 'access' | 'ytOperationTitle' | 'tokenIds';
export type QuerySettingsHiddenField = 'tokens' | 'attributes';
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

export type QuerySettingsCustomFieldsContext<TCustom extends object = Record<string, unknown>> = {
    value: QuerySettingsValue<TCustom>;
    onChange: (value: QuerySettingsValue<TCustom>) => void;
    errors?: QuerySettingsErrors<TCustom>;
    onFieldBlur?: (field: QuerySettingsFieldReference<TCustom>) => void;
    disabled: boolean;
};

export type QuerySettingsProps<TCustom extends object = Record<string, unknown>> = {
    value: QuerySettingsValue<TCustom>;
    /** Receives the full next value. Attribute drafts are emitted only when applied. */
    onChange: (value: QuerySettingsValue<TCustom>) => void;
    /** Omit to hide Tokens; an empty list renders a disabled selector. */
    tokens?: QuerySettingsToken[];
    /** Hiding a field never clears its value. */
    hiddenFields?: QuerySettingsHiddenField[];
    /** Rendered immediately after Query name. The caller owns custom controls and validation. */
    renderCustomFields?: (context: QuerySettingsCustomFieldsContext<TCustom>) => ReactNode;
    errors?: QuerySettingsErrors<TCustom>;
    onFieldBlur?: (field: QuerySettingsFieldReference<TCustom>) => void;
    disabled?: boolean;
    className?: string;
};
