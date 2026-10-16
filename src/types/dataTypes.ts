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
    | 'Number'
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
