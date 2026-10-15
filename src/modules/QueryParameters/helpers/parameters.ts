import type {
    QueryParameter,
    QueryParameterErrors,
    QueryParameterNullLevel,
    QueryParameterType,
    QueryParameterValue,
} from '../../../types/queryParameters';
import {parseDate} from '../../../helpers/parameterDate';
import {validateNumericValue} from '../../../helpers/parameterValidation';
import i18n from '../i18n';

export const parameterKinds: QueryParameterType['kind'][] = [
    'Bool',
    'Date',
    'Date32',
    'Datetime',
    'Datetime64',
    'Timestamp',
    'Timestamp64',
    'TzDate',
    'TzDate32',
    'TzDatetime',
    'TzDatetime64',
    'TzTimestamp',
    'TzTimestamp64',
    'Decimal',
    'Double',
    'DyNumber',
    'Float',
    'Int8',
    'Int16',
    'Int32',
    'Int64',
    'Uint8',
    'Uint16',
    'Uint32',
    'Uint64',
    'Interval',
    'Interval64',
    'String',
    'Utf8',
    'Uuid',
    'Json',
    'JsonDocument',
    'Yson',
    'Number',
    'Enum',
    'Optional',
    'Pg',
    'List',
    'Tuple',
    'Variant',
    'Dict',
    'Struct',
];

export function isNumericType(type: QueryParameterType): boolean {
    return /^(Number|Decimal|Double|DyNumber|Float|(?:Uint|Int)(?:8|16|32|64))$/.test(type.kind);
}

export function isTextType(type: QueryParameterType): boolean {
    return ['String', 'Utf8', 'Uuid', 'Pg'].includes(type.kind);
}

export function isDocumentType(type: QueryParameterType): boolean {
    return ['Json', 'JsonDocument', 'Yson'].includes(type.kind);
}

export function isScalarType(type: QueryParameterType): boolean {
    return !['List', 'Tuple', 'Variant', 'Dict', 'Struct', 'Optional'].includes(type.kind);
}

let nextId = 0;
export function createId(): string {
    return `parameter-${Date.now().toString(36)}-${(++nextId).toString(36)}`;
}

export function defaultType(kind: QueryParameterType['kind']): QueryParameterType {
    switch (kind) {
        case 'Optional':
        case 'List':
            return {kind, item: {kind: 'String'}};
        case 'Tuple':
            return {kind, items: [{kind: 'String'}]};
        case 'Variant':
            return {kind, options: [{id: createId(), name: 'String', type: {kind: 'String'}}]};
        case 'Struct':
            return {kind, fields: [{id: createId(), name: 'field', type: {kind: 'String'}}]};
        case 'Unknown':
            return {kind, name: 'Unknown'};
        case 'Pg':
            return {kind, name: 'text'};
        case 'Enum':
            return {kind, options: ['value']};
        case 'Decimal':
            return {kind};
        case 'Dict':
            return {kind, key: {kind: 'String'}, value: {kind: 'String'}};
        default:
            return {kind};
    }
}

const MAX_DEPTH = 20;

export function validType(type: QueryParameterType, depth = 0): boolean {
    if (!type || depth > MAX_DEPTH) return false;
    switch (type.kind) {
        case 'String':
        case 'Number':
        case 'Json':
            return true;
        case 'Optional':
        case 'List':
            return validType(type.item, depth + 1);
        case 'Tuple':
            return (
                Array.isArray(type.items) &&
                type.items.length > 0 &&
                type.items.every((item) => validType(item, depth + 1))
            );
        case 'Dict':
            return validType(type.key, depth + 1) && validType(type.value, depth + 1);
        case 'Enum':
            return (
                Array.isArray(type.options) &&
                type.options.length > 0 &&
                type.options.every(
                    (option) => typeof option === 'string' && Boolean(option.trim()),
                ) &&
                new Set(type.options).size === type.options.length
            );
        case 'Unknown':
        case 'Pg':
            return typeof type.name === 'string' && Boolean(type.name.trim());
        case 'Decimal':
            return (
                (type.precision === undefined && type.scale === undefined) ||
                (typeof type.precision === 'number' &&
                    typeof type.scale === 'number' &&
                    Number.isInteger(type.precision) &&
                    Number.isInteger(type.scale) &&
                    type.precision > 0 &&
                    type.scale >= 0 &&
                    type.scale <= type.precision)
            );
        case 'Struct':
        case 'Variant': {
            const options = type.kind === 'Struct' ? type.fields : type.options;
            const names = new Set<string>();
            const ids = new Set<string>();
            return (
                Array.isArray(options) &&
                (type.kind === 'Struct' || options.length > 0) &&
                options.every((option) => {
                    if (!option || !option.id || ids.has(option.id) || !option.name?.trim())
                        return false;
                    if (type.kind === 'Struct' && names.has(option.name)) return false;
                    names.add(option.name);
                    ids.add(option.id);
                    return validType(option.type, depth + 1);
                })
            );
        }
        default:
            return parameterKinds.includes(type.kind);
    }
}

export function defaultValue(type: QueryParameterType): QueryParameterValue {
    if (!validType(type)) throw new Error(i18n('alert_invalid-type'));
    switch (type.kind) {
        case 'Bool':
            return false;
        case 'Optional':
        case 'Pg':
            return null;
        case 'Enum':
            return type.options[0];
        case 'Struct':
            return type.fields.map((field) => ({id: field.id, value: defaultValue(field.type)}));
        case 'Interval':
        case 'Interval64':
            return 'PT0S';
        case 'Date':
        case 'Date32':
            return '1970-01-01';
        case 'Datetime':
        case 'Datetime64':
            return '1970-01-01T00:00:00Z';
        case 'Timestamp':
        case 'Timestamp64':
            return '1970-01-01T00:00:00.000000Z';
        case 'Uuid':
            return '00000000-0000-0000-0000-000000000000';
        case 'String':
            return '';
        case 'Number':
            return '0';
        case 'Unknown':
        case 'JsonDocument':
        case 'Yson':
        case 'Json':
            return '{}';
        case 'List':
        case 'Dict':
            return [];
        case 'Tuple':
            return type.items.map((item) => ({id: createId(), value: defaultValue(item)}));
        case 'Variant':
            return {optionId: type.options[0].id, value: defaultValue(type.options[0].type)};
        default:
            return isNumericType(type) ? '0' : '';
    }
}

export function formatType(type: QueryParameterType): string {
    if (!validType(type)) return i18n('alert_invalid-type');
    switch (type.kind) {
        case 'Optional':
            return `Optional<${formatType(type.item)}>`;
        case 'Unknown':
            return type.name;
        case 'Pg':
            return `Pg<${type.name}>`;
        case 'Enum':
            return `Enum<${type.options.join(', ')}>`;
        case 'Decimal':
            return type.precision === undefined
                ? 'Decimal'
                : `Decimal(${type.precision}, ${type.scale})`;
        case 'Struct':
            return `Struct<${type.fields.map((field) => `${field.name}: ${formatType(field.type)}`).join(', ')}>`;
        case 'List':
            return `List<${formatType(type.item)}>`;
        case 'Tuple':
            return `Tuple<${type.items.map(formatType).join(', ')}>`;
        case 'Dict':
            return `Dict<${formatType(type.key)}, ${formatType(type.value)}>`;
        case 'Variant':
            return `Variant<${type.options.map((option) => `${option.name}: ${formatType(option.type)}`).join(', ')}>`;
        default:
            return type.kind;
    }
}

function record(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Collapse consecutive Optional wrappers, including the intrinsic nullable Pg level. */
export function nullableInfo(type: QueryParameterType): {type: QueryParameterType; levels: number} {
    let levels = 0;
    while (type.kind === 'Optional' && levels <= MAX_DEPTH) {
        levels++;
        type = type.item;
    }
    if (type.kind === 'Pg') levels++;
    return {type, levels};
}

export function isNullLevel(value: unknown): value is QueryParameterNullLevel {
    return (
        record(value) &&
        value.kind === 'optional-null' &&
        Object.keys(value).length === 2 &&
        typeof value.depth === 'number' &&
        Number.isInteger(value.depth) &&
        value.depth > 0
    );
}

export function isNullValue(type: QueryParameterType, value: unknown): boolean {
    const {levels} = nullableInfo(type);
    return levels > 0 && (value === null || (isNullLevel(value) && value.depth < levels));
}

export function parameterFormatExample(type: QueryParameterType): string | undefined {
    switch (type.kind) {
        case 'Date':
        case 'Date32':
            return '2026-10-13';
        case 'Datetime':
        case 'Datetime64':
            return '2026-10-13T12:34:56Z';
        case 'Timestamp':
        case 'Timestamp64':
            return '2026-10-13T12:34:56.123456Z';
        case 'Interval':
        case 'Interval64':
            return 'PT1M30S';
        case 'Uuid':
            return '12345678-1234-1234-1234-123456789abc';
        case 'Json':
        case 'JsonDocument':
        case 'Yson':
        case 'Unknown':
            return '{"key": "value"}';
        default:
            return undefined;
    }
}

/** Preserve the query editor's short/signed extended years when using the shared parser. */
function validDateValue(kind: string, value: string): boolean {
    const extended = /(?:32|64)$/.test(kind);
    const pattern = extended ? /^([+-]?)(\d{1,6})(-.*)$/ : /^()(\d{4})(-.*)$/;
    const match = pattern.exec(value);
    if (!match) return false;
    const normalized = `${match[1] === '-' ? '-' : ''}${match[2].padStart(4, '0')}${match[3]}`;
    return parseDate(normalized, kind) !== undefined;
}

function valueErrors(
    type: QueryParameterType,
    value: unknown,
    path: string,
    errors: Record<string, string>,
): void {
    const invalid = () => {
        errors[path] = i18n('alert_invalid-value');
    };
    if (type.kind === 'Optional') {
        if (isNullValue(type, value)) return;
        valueErrors(nullableInfo(type).type, value, path, errors);
        return;
    }
    if (isScalarType(type)) {
        if (type.kind === 'Bool') {
            if (typeof value !== 'boolean') invalid();
            return;
        }
        if (type.kind === 'Pg' && value === null) return;
        if (typeof value !== 'string') {
            invalid();
            return;
        }
        if (isNumericType(type)) {
            const params =
                type.kind === 'Decimal' && type.precision !== undefined && type.scale !== undefined
                    ? [type.precision, type.scale]
                    : undefined;
            if (!validateNumericValue(value, type.kind, params))
                errors[path] = i18n('alert_invalid-number');
        }
        if (isDocumentType(type) || type.kind === 'Unknown') {
            try {
                JSON.parse(value);
            } catch {
                errors[path] = i18n('alert_invalid-json');
            }
        }
        if (
            /^(Date(?:32)?|Datetime(?:64)?|Timestamp(?:64)?)$/.test(type.kind) &&
            !validDateValue(type.kind, value)
        )
            errors[path] = i18n('alert_invalid-date');
        if (
            (type.kind === 'Interval' || type.kind === 'Interval64') &&
            parseDate(value, type.kind) === undefined
        )
            errors[path] = i18n('alert_invalid-interval');
        if (
            type.kind === 'Uuid' &&
            !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)
        )
            errors[path] = i18n('alert_invalid-uuid');
        if (type.kind === 'Enum' && !type.options.includes(value)) invalid();
        return;
    }
    switch (type.kind) {
        case 'Variant': {
            if (!record(value)) {
                invalid();
                return;
            }
            const option = type.options.find(({id}) => id === value.optionId);
            if (!option) {
                invalid();
                return;
            }
            valueErrors(option.type, value.value, `${path}/${option.id}`, errors);
            return;
        }
        default: {
            if (!Array.isArray(value)) {
                invalid();
                return;
            }
            if (type.kind === 'Tuple' && value.length !== type.items.length) invalid();
            if (
                type.kind === 'Struct' &&
                (value.length !== type.fields.length ||
                    type.fields.some(
                        (field) => !value.some((item) => record(item) && item.id === field.id),
                    ))
            )
                invalid();
            const ids = new Set<string>();
            const keys = new Set<string>();
            value.forEach((item, index) => {
                if (!record(item) || typeof item.id !== 'string' || !item.id) {
                    invalid();
                    return;
                }
                const itemPath = `${path}/${item.id}`;
                if (ids.has(item.id)) errors[itemPath] = i18n('alert_duplicate-id');
                ids.add(item.id);
                if (type.kind === 'Dict') {
                    valueErrors(type.key, item.key, `${itemPath}/key`, errors);
                    const keyPath = `${itemPath}/key`;
                    if (
                        !Object.keys(errors).some(
                            (errorPath) =>
                                errorPath === keyPath || errorPath.startsWith(`${keyPath}/`),
                        )
                    ) {
                        const key = JSON.stringify(
                            encode(type.key, item.key as QueryParameterValue),
                        );
                        if (keys.has(key)) errors[keyPath] = i18n('alert_duplicate-key');
                        keys.add(key);
                    }
                    valueErrors(type.value, item.value, `${itemPath}/value`, errors);
                } else {
                    const childType =
                        type.kind === 'List'
                            ? type.item
                            : type.kind === 'Tuple'
                              ? type.items[index]
                              : type.kind === 'Struct'
                                ? type.fields.find((field) => field.id === item.id)?.type
                                : undefined;
                    if (!childType) {
                        invalid();
                        return;
                    }
                    if (childType) valueErrors(childType, item.value, itemPath, errors);
                }
            });
        }
    }
}

export function validateParameters(
    parameters: QueryParameter[],
): Record<string, QueryParameterErrors> {
    const result: Record<string, QueryParameterErrors> = Object.create(null);
    const names = new Map<string, number>();
    const ids = new Map<string, number>();
    parameters.forEach((parameter) => {
        ids.set(parameter.id, (ids.get(parameter.id) ?? 0) + 1);
        if (!parameter.deleted) names.set(parameter.name, (names.get(parameter.name) ?? 0) + 1);
    });
    parameters.forEach((parameter) => {
        const errors: QueryParameterErrors = {};
        if (!parameter.id || (ids.get(parameter.id) ?? 0) > 1)
            errors.name = i18n('alert_duplicate-id');
        if (!parameter.deleted) {
            if (!parameter.name.trim()) errors.name = i18n('alert_invalid-name');
            else if ((names.get(parameter.name) ?? 0) > 1)
                errors.name = i18n('alert_duplicate-name');
            if (!validType(parameter.type)) errors.type = i18n('alert_invalid-type');
            else {
                const errorsByPath: Record<string, string> = Object.create(null);
                valueErrors(parameter.type, parameter.value, '$', errorsByPath);
                if (Object.keys(errorsByPath).length) errors.value = errorsByPath;
            }
        }
        if (Object.keys(errors).length) result[parameter.id] = errors;
    });
    return result;
}

function encode(type: QueryParameterType, value: QueryParameterValue): unknown {
    if (isNullValue(type, value)) return value;
    if (isNullLevel(value)) throw new Error(i18n('alert_invalid-raw'));
    if (type.kind === 'Optional') return encode(nullableInfo(type).type, value);
    if (value === null || typeof value === 'boolean' || typeof value === 'string') return value;
    if (type.kind === 'Struct' && Array.isArray(value)) {
        return Object.fromEntries(
            type.fields.map((field) => [
                field.name,
                encode(field.type, value.find((item) => item.id === field.id)!.value),
            ]),
        );
    }
    if (!Array.isArray(value)) {
        const option =
            type.kind === 'Variant' && type.options.find(({id}) => id === value.optionId);
        if (!option) throw new Error(i18n('alert_invalid-raw'));
        return {optionId: value.optionId, value: encode(option.type, value.value)};
    }
    return value.map((item, index) => {
        if (type.kind === 'Dict' && 'key' in item)
            return [encode(type.key, item.key), encode(type.value, item.value)];
        if (type.kind === 'Tuple') return encode(type.items[index], item.value);
        if (type.kind === 'List') return encode(type.item, item.value);
        throw new Error(i18n('alert_invalid-raw'));
    });
}

export function toRaw(type: QueryParameterType, value: QueryParameterValue): string {
    assertValue(type, value);
    return JSON.stringify(encode(type, value), null, 2);
}

function assertValue(type: QueryParameterType, value: QueryParameterValue): void {
    if (!validType(type)) throw new Error(i18n('alert_invalid-type'));
    const errors = {};
    valueErrors(type, value, '$', errors);
    if (Object.keys(errors).length) throw new Error(i18n('alert_invalid-raw'));
}

function decode(
    type: QueryParameterType,
    raw: unknown,
    previous?: QueryParameterValue,
): QueryParameterValue {
    const invalid = () => new Error(i18n('alert_invalid-raw'));
    if (isNullValue(type, raw)) return raw as null | QueryParameterNullLevel;
    if (type.kind === 'Optional') return decode(nullableInfo(type).type, raw, previous);
    if (isScalarType(type)) {
        if (type.kind === 'Bool' && typeof raw === 'boolean') return raw;
        if (type.kind === 'Pg' && raw === null) return raw;
        if (type.kind !== 'Bool' && typeof raw === 'string') return raw;
        throw invalid();
    }
    switch (type.kind) {
        case 'Struct': {
            if (
                !record(raw) ||
                Object.keys(raw).length !== type.fields.length ||
                type.fields.some((field) => !Object.prototype.hasOwnProperty.call(raw, field.name))
            )
                throw invalid();
            return type.fields.map((field) => ({
                id: field.id,
                value: decode(
                    field.type,
                    raw[field.name],
                    Array.isArray(previous)
                        ? previous.find((item) => item.id === field.id)?.value
                        : undefined,
                ),
            }));
        }
        case 'Variant': {
            if (!record(raw)) throw invalid();
            const option = type.options.find(({id}) => id === raw.optionId);
            if (!option) throw invalid();
            const oldValue =
                previous &&
                typeof previous === 'object' &&
                !Array.isArray(previous) &&
                'optionId' in previous &&
                previous.optionId === option.id
                    ? previous.value
                    : undefined;
            return {optionId: option.id, value: decode(option.type, raw.value, oldValue)};
        }
        default:
            if (!Array.isArray(raw) || (type.kind === 'Tuple' && raw.length !== type.items.length))
                throw invalid();
            return raw.map((item, index) => {
                const oldItem = Array.isArray(previous) ? previous[index] : undefined;
                const id = oldItem?.id || createId();
                if (type.kind === 'Dict') {
                    if (!Array.isArray(item) || item.length !== 2) throw invalid();
                    return {
                        id,
                        key: decode(
                            type.key,
                            item[0],
                            oldItem && 'key' in oldItem
                                ? (oldItem.key as QueryParameterValue)
                                : undefined,
                        ),
                        value: decode(type.value, item[1], oldItem?.value),
                    };
                }
                return {
                    id,
                    value: decode(
                        type.kind === 'List'
                            ? type.item
                            : type.kind === 'Tuple'
                              ? type.items[index]
                              : (() => {
                                    throw invalid();
                                })(),
                        item,
                        oldItem?.value,
                    ),
                };
            });
    }
}

export function fromRaw(
    type: QueryParameterType,
    text: string,
    previousValue?: QueryParameterValue,
): QueryParameterValue {
    if (!validType(type)) throw new Error(i18n('alert_invalid-type'));
    let parsed: unknown;
    try {
        parsed = JSON.parse(text);
    } catch {
        throw new Error(i18n('alert_invalid-raw'));
    }
    const value = decode(type, parsed, previousValue);
    assertValue(type, value);
    return value;
}

/** Reversible UTF-16 escapes; literal backslashes are always escaped. */
export function escapeString(value: string): string {
    return value
        .split('')
        .map((character) => {
            if (character === '\\') return '\\\\';
            const code = character.charCodeAt(0);
            if (code >= 32 && code < 127) return character;
            return code <= 0xff
                ? `\\x${code.toString(16).padStart(2, '0')}`
                : `\\u${code.toString(16).padStart(4, '0')}`;
        })
        .join('');
}

export function unescapeString(text: string): string {
    let result = '';
    for (let index = 0; index < text.length; index++) {
        if (text[index] !== '\\') {
            result += text[index];
            continue;
        }
        const kind = text[++index];
        if (kind === '\\') {
            result += '\\';
            continue;
        }
        const length = ({x: 2, u: 4} as Record<string, number>)[kind] ?? 0;
        const hex = text.slice(index + 1, index + 1 + length);
        if (!length || hex.length !== length || !/^[0-9a-f]+$/i.test(hex))
            throw new Error(i18n('alert_invalid-escape'));
        result += String.fromCharCode(parseInt(hex, 16));
        index += length;
    }
    return result;
}
