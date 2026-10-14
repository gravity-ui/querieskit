/** Parsed type descriptor. Optional and tagged wrappers are metadata on the underlying type. */
export type ParameterType = {
    optional?: boolean;
    optionalLevel?: number;
    tagged?: boolean;
    tags?: string[];
    params?: unknown[];
} & (
    | {name: ParameterPrimitiveTypeName; complex?: false}
    | {name: 'List' | 'Set' | 'Stream'; complex?: true; type: ParameterType}
    | {name: 'Tuple'; complex?: true; type: ParameterType[]}
    | {name: 'Dict'; complex?: true; type: [ParameterType, ParameterType]}
    | {name: 'Struct' | 'Variant'; complex?: true; struct: ParameterTypeMember[]}
    | {name: 'Enum'; complex?: true; type: {name: string | number}[]}
);

export type ParameterPrimitiveTypeName =
    | 'Bool'
    | 'Int8'
    | 'Int16'
    | 'Int32'
    | 'Int64'
    | 'Uint8'
    | 'Uint16'
    | 'Uint32'
    | 'Uint64'
    | 'Float'
    | 'Double'
    | 'Decimal'
    | 'DyNumber'
    | 'String'
    | 'Utf8'
    | 'Uuid'
    | 'Json'
    | 'JsonDocument'
    | 'Yson'
    | 'Date'
    | 'Date32'
    | 'Datetime'
    | 'Datetime64'
    | 'Timestamp'
    | 'Timestamp64'
    | 'Interval'
    | 'Interval64'
    | 'TzDate'
    | 'TzDate32'
    | 'TzDatetime'
    | 'TzDatetime64'
    | 'TzTimestamp'
    | 'TzTimestamp64'
    | 'Void'
    | 'Null'
    | 'EmptyList'
    | 'EmptyDict'
    | 'Unknown'
    | `pg${string}`
    | `_pg${string}`;

export interface ParameterTypeMember {
    /** Strings identify struct fields; numbers identify tuple variants. */
    key: string | number;
    type: ParameterType;
}

/** Restricted JSON value, not JSON source text. Undefined denotes an unfilled field. */
export type ParameterValue =
    | undefined
    | null
    | boolean
    | string
    | number
    | ParameterValue[]
    | {[key: string]: ParameterValue};

export interface ParameterWizardProps {
    name: string;
    type: ParameterType;
    value: ParameterValue;
    onChange: (value: ParameterValue) => void;
    readOnly?: boolean;
    disabled?: boolean;
    className?: string;
    /** Presence of this callback enables the delete action. */
    onDelete?: () => void;
    /** The consumer owns the saved value and restores it in this callback. */
    onReset?: () => void;
    resetDisabled?: boolean;
    /** Includes incomplete values and invalid local input drafts. */
    onValidationChange?: (valid: boolean) => void;
}
