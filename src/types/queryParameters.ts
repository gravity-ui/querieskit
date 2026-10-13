/** UI schema, independent of a query engine's wire format. */
export type QueryParameterType =
    | {kind: 'String' | 'Number' | 'Json'}
    | {kind: 'List'; item: QueryParameterType}
    | {kind: 'Tuple'; items: QueryParameterType[]}
    | {kind: 'Variant'; options: QueryParameterOption[]}
    | {kind: 'Dict'; key: QueryParameterType; value: QueryParameterType};

export type QueryParameterOption = {id: string; name: string; type: QueryParameterType};

/** Numbers and JSON documents stay as text to avoid precision loss while editing. */
export type QueryParameterValue =
    | string
    | QueryParameterItem[]
    | QueryParameterEntry[]
    | {optionId: string; value: QueryParameterValue};

export type QueryParameterItem = {id: string; value: QueryParameterValue};
export type QueryParameterEntry = {
    id: string;
    key: QueryParameterValue;
    value: QueryParameterValue;
};

export type QueryParameter = {
    id: string;
    /** Name without the leading $. */
    name: string;
    type: QueryParameterType;
    value: QueryParameterValue;
    /** Deleted rows stay in the controlled collection until Remove all is applied. */
    deleted?: boolean;
};

export type QueryParameterErrors = {
    name?: string;
    type?: string;
    /** Value paths: $, $/item-id, $/entry-id/key, $/entry-id/value, $/option-id. */
    value?: Record<string, string>;
};

export type QueryParametersProps = {
    value: QueryParameter[];
    /** Called on Save or Remove all. Reject to keep the draft and show an error. */
    onChange: (value: QueryParameter[]) => void | Promise<void>;
    /** Optional refresh action. The application supplies the resulting value. */
    onUpdate?: () => void | Promise<void>;
    /** Wide layout. The host expands the existing panel container within its workspace. */
    expanded?: boolean;
    /** Providing this callback shows the fullscreen toggle. */
    onExpandedChange?: (expanded: boolean) => void;
    /** Providing this callback shows the close button. */
    onClose?: () => void;
    errors?: Record<string, QueryParameterErrors>;
    disabled?: boolean;
    loading?: boolean;
    className?: string;
};
