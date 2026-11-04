export type QuerySettingsAttribute<TValue = string> = {id: string; key: string; value: TValue};

/** Parsing is explicit: the library never infers JSON, numbers or booleans from text. */
export type QuerySettingsAttributeCodec<TValue> = {
    format: (value: TValue) => string;
    parse: (text: string) => {value: TValue} | {error: string};
};

export type QuerySettingsAttributePermissions = {
    canEditKey?: boolean;
    canEditValue?: boolean;
    canRemove?: boolean;
};
export type QuerySettingsAttributeErrors = Partial<Record<'key' | 'value', string>>;

export type QueryAttributesChangeOperation = {
    operation: 'add' | 'remove' | 'rename' | 'update-value';
    id: string;
};
export type QueryAttributesEditorProps<TValue = string> = {
    items: QuerySettingsAttribute<TValue>[];
    /** One Apply emits one transaction, including combined rename and value update. */
    onChange: (
        items: QuerySettingsAttribute<TValue>[],
        changes: readonly QueryAttributesChangeOperation[],
    ) => void;
    errors?: Record<string, QuerySettingsAttributeErrors>;
    onFieldBlur?: (field: {id: string; field: 'key' | 'value'}) => void;
    getAttributePermissions?: (
        attribute: QuerySettingsAttribute<TValue>,
    ) => QuerySettingsAttributePermissions;
    validateAttribute?: (
        draft: QuerySettingsAttribute<TValue>,
        attributes: readonly QuerySettingsAttribute<TValue>[],
    ) => QuerySettingsAttributeErrors | undefined;
    checkDuplicateAttributeKeys?: boolean;
    disabled?: boolean;
    className?: string;
} & ([TValue] extends [string]
    ? [string] extends [TValue]
        ? {attributeCodec?: QuerySettingsAttributeCodec<NoInfer<TValue>>}
        : {attributeCodec: QuerySettingsAttributeCodec<NoInfer<TValue>>}
    : {attributeCodec: QuerySettingsAttributeCodec<NoInfer<TValue>>});
