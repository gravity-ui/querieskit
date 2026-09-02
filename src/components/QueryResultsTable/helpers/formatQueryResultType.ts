import type {QueryResultDataType} from '../../../types/queryResults';

function isQueryResultDataType(value: unknown): value is QueryResultDataType {
    return Array.isArray(value) && typeof value[0] === 'string';
}

function formatParameter(value: unknown): string {
    if (Array.isArray(value)) {
        if (isQueryResultDataType(value)) {
            return formatQueryResultType(value);
        }

        return value.map(formatParameter).join(', ');
    }

    return String(value);
}

export function formatQueryResultType(type: QueryResultDataType): string {
    const [name, ...params] = type;

    switch (name) {
        case 'DataType':
            return [params[0], ...params.slice(1)].filter(Boolean).join(', ');
        case 'OptionalType':
            return `Optional<${formatParameter(params[0])}>`;
        case 'TaggedType':
            return `Tagged<${formatParameter(params[0])}, ${formatParameter(params[1])}>`;
        case 'ListType':
        case 'StreamType':
            return `${name.replace('Type', '')}<${formatParameter(params[0])}>`;
        case 'DictType':
            return `Dict<${params.map(formatParameter).join(', ')}>`;
        case 'TupleType':
            return `Tuple<${formatParameter(params[0])}>`;
        case 'StructType':
            return `Struct<${Array.isArray(params[0]) ? params[0].map(formatParameter).join(', ') : ''}>`;
        case 'VariantType':
            return `Variant<${formatParameter(params[0])}>`;
        case 'PgType':
            return `Pg<${formatParameter(params[0])}>`;
        default:
            return params.length ? `${name}<${params.map(formatParameter).join(', ')}>` : name;
    }
}

const NUMERIC_TYPES = new Set([
    'Double',
    'Float',
    'Int64',
    'Int32',
    'Int16',
    'Int8',
    'Uint64',
    'Uint32',
    'Uint16',
    'Uint8',
]);

export function isQueryResultNumericType(type: QueryResultDataType): boolean {
    const [name, ...params] = type;

    if (name === 'DataType') {
        return typeof params[0] === 'string' && NUMERIC_TYPES.has(params[0]);
    }

    if (name === 'OptionalType') {
        return isQueryResultDataType(params[0]) && isQueryResultNumericType(params[0]);
    }

    if (name === 'TaggedType') {
        return isQueryResultDataType(params[1]) && isQueryResultNumericType(params[1]);
    }

    return false;
}
