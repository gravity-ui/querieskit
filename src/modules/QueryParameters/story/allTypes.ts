import type {QueryParameter, QueryParameterType} from '../../../types/queryParameters';

type ScalarKind = Exclude<
    QueryParameterType['kind'],
    | 'Bool'
    | 'Pg'
    | 'Unknown'
    | 'Enum'
    | 'Optional'
    | 'Struct'
    | 'List'
    | 'Tuple'
    | 'Variant'
    | 'Dict'
>;

function scalar(kind: ScalarKind, value: string): QueryParameter {
    const type: QueryParameterType = kind === 'Decimal' ? {kind: 'Decimal'} : {kind};
    return {id: kind, name: kind.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase(), type, value};
}

/** The 42 Figma examples in design order, followed by contract edge cases. */
export const allTypesParameters: QueryParameter[] = [
    {id: 'Bool', name: 'bool', type: {kind: 'Bool'}, value: false},
    scalar('Date', '2025-01-01'),
    scalar('Date32', '2025-01-01'),
    scalar('Datetime', '2025-01-01T12:30:00Z'),
    scalar('Datetime64', '2025-01-01T12:30:00Z'),
    scalar('Decimal', '123.45'),
    {
        id: 'Dict',
        name: 'dict',
        type: {kind: 'Dict', key: {kind: 'String'}, value: {kind: 'Int32'}},
        value: [
            {id: 'dict-a', key: 'a', value: '1'},
            {id: 'dict-b', key: 'b', value: '2'},
        ],
    },
    scalar('Double', '3.14159'),
    scalar('DyNumber', '123.45'),
    {
        id: 'Enum',
        name: 'enum',
        type: {kind: 'Enum', options: ['red', 'green', 'blue']},
        value: 'green',
    },
    scalar('Float', '3.14'),
    scalar('Int16', '42'),
    scalar('Int32', '42'),
    scalar('Int64', '9007199254740993'),
    scalar('Int8', '42'),
    scalar('Interval', 'PT1M30S'),
    scalar('Interval64', '-P1DT0.123456S'),
    scalar('Json', '{\n  "a": 3\n}'),
    scalar('JsonDocument', '{\n  "a": 3\n}'),
    {
        id: 'List',
        name: 'list',
        type: {kind: 'List', item: {kind: 'String'}},
        value: [
            {id: 'list-1', value: 'hello'},
            {id: 'list-2', value: 'world'},
        ],
    },
    {
        id: 'NestedList',
        name: 'nested',
        type: {kind: 'List', item: {kind: 'List', item: {kind: 'String'}}},
        value: [
            {
                id: 'list-group-1',
                value: [
                    {id: 'nested-1', value: 'hello'},
                    {id: 'nested-2', value: 'world'},
                ],
            },
            {id: 'list-group-2', value: [{id: 'nested-3', value: 'example'}]},
        ],
    },
    {
        id: 'Optional',
        name: 'optional',
        type: {kind: 'Optional', item: {kind: 'Int32'}},
        value: null,
    },
    {id: 'Pg', name: 'pg_text', type: {kind: 'Pg', name: 'text'}, value: null},
    scalar('String', 'hello'),
    {
        id: 'Struct',
        name: 'struct',
        type: {
            kind: 'Struct',
            fields: [
                {id: 'age', name: 'age', type: {kind: 'Uint32'}},
                {id: 'name', name: 'name', type: {kind: 'Utf8'}},
            ],
        },
        value: [
            {id: 'age', value: '30'},
            {id: 'name', value: 'Anna'},
        ],
    },
    scalar('Timestamp', '2025-01-01T12:30:00.123456Z'),
    scalar('Timestamp64', '2025-01-01T12:30:00.123456Z'),
    {
        id: 'Tuple',
        name: 'tuple',
        type: {kind: 'Tuple', items: [{kind: 'Int32'}, {kind: 'String'}]},
        value: [
            {id: 'tuple-0', value: '42'},
            {id: 'tuple-1', value: 'hello'},
        ],
    },
    scalar('TzDate', '2025-01-01,Europe/Moscow'),
    scalar('TzDate32', '2025-01-01,Europe/Moscow'),
    scalar('TzDatetime', '2025-01-01T12:30:00,Europe/Moscow'),
    scalar('TzDatetime64', '2025-01-01T12:30:00,Europe/Moscow'),
    scalar('TzTimestamp', '2025-01-01T12:30:00.123456,Europe/Moscow'),
    scalar('TzTimestamp64', '2025-01-01T12:30:00.123456,Europe/Moscow'),
    scalar('Uint16', '42'),
    scalar('Uint32', '42'),
    scalar('Uint64', '18446744073709551615'),
    scalar('Uint8', '42'),
    scalar('Utf8', 'Привет, мир'),
    scalar('Uuid', '550e8400-e29b-41d4-a716-446655440000'),
    {
        id: 'Variant',
        name: 'variant',
        type: {
            kind: 'Variant',
            options: [
                {id: '0', name: '0', type: {kind: 'Int32'}},
                {id: '1', name: '1', type: {kind: 'String'}},
            ],
        },
        value: {optionId: '1', value: 'text'},
    },
    scalar('Yson', '{\n  "a": 3\n}'),
    {
        id: 'NestedOptional',
        name: 'nested_optional',
        type: {kind: 'Optional', item: {kind: 'Optional', item: {kind: 'Int32'}}},
        value: {kind: 'optional-null', depth: 1},
    },
    {
        id: 'OptionalPg',
        name: 'optional_pg',
        type: {kind: 'Optional', item: {kind: 'Pg', name: 'text'}},
        value: {kind: 'optional-null', depth: 1},
    },
    {
        id: 'Unknown',
        name: 'unknown',
        type: {kind: 'Unknown', name: 'CustomType'},
        value: '{\n  "exact": 9007199254740993\n}',
    },
];
