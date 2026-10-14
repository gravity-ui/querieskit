import type {ParameterType, ParameterValue} from '../../../types/parameterWizard';
import {isDateType, isDateValue} from './date';
import {isBinary, isPgType, isRecord, optionalDepth, variantIndex} from './values';

const decimalPattern = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i;
const specialNumberPattern = /^[+-]?(?:inf|nan)$/i;

function validateInteger(value: ParameterValue, name: string, bits: bigint) {
    if (typeof value !== 'string' || !/^-?\d+$/.test(value)) return false;
    const unsigned = name.startsWith('Uint');
    const min = unsigned ? 0n : -(2n ** (bits - 1n));
    const max = unsigned ? 2n ** bits - 1n : 2n ** (bits - 1n) - 1n;
    return BigInt(value) >= min && BigInt(value) <= max;
}

function validateDecimal(value: ParameterValue, type: ParameterType) {
    if (typeof value !== 'string') return false;
    if (specialNumberPattern.test(value)) return true;
    const match = /^[+-]?(\d+)(?:\.(\d*))?$/.exec(value);
    if (!match) return false;
    const [precision, scale] = type.params?.map(Number) || [];
    if (!Number.isInteger(precision) || !Number.isInteger(scale)) return true;
    return (
        match[1].replace(/^0+/, '').length <= precision - scale && (match[2]?.length || 0) <= scale
    );
}

const primitiveValidators: Record<string, (value: ParameterValue) => boolean> = {
    Bool: (value) => typeof value === 'boolean',
    String: (value) => typeof value === 'string' || isBinary(value),
    Uuid: (value) => isBinary(value) && atob(value[0]).length === 16,
    Utf8: (value) => typeof value === 'string',
    Float: (value) =>
        typeof value === 'string' &&
        (specialNumberPattern.test(value) || decimalPattern.test(value)),
    Double: (value) =>
        typeof value === 'string' &&
        (specialNumberPattern.test(value) || decimalPattern.test(value)),
    DyNumber: (value) => typeof value === 'string' && decimalPattern.test(value),
    Void: (value) => value === 'Void',
    Null: (value) => value === null,
    EmptyList: (value) => Array.isArray(value) && value.length === 0,
    EmptyDict: (value) =>
        (Array.isArray(value) && value.length === 0) ||
        (isRecord(value) && Object.keys(value).length === 0),
};

function validateStruct(
    value: ParameterValue,
    type: Extract<ParameterType, {name: 'Struct' | 'Variant'}>,
) {
    if (Array.isArray(value))
        return (
            value.length === type.struct.length &&
            type.struct.every((field, index) => validateValue(value[index], field.type))
        );
    if (!isRecord(value)) return false;
    if (Object.keys(value).some((key) => !type.struct.some((field) => String(field.key) === key)))
        return false;
    return type.struct.every((field) => {
        if (Object.prototype.hasOwnProperty.call(value, field.key))
            return validateValue(value[field.key], field.type);
        return Boolean(field.type.optional);
    });
}

function validateDict(value: ParameterValue, type: Extract<ParameterType, {name: 'Dict'}>) {
    const entries =
        isRecord(value) && !type.type[0].optional && ['String', 'Utf8'].includes(type.type[0].name)
            ? Object.entries(value)
            : value;
    return (
        Array.isArray(entries) &&
        entries.every(
            (entry) =>
                Array.isArray(entry) &&
                entry.length === 2 &&
                validateValue(entry[0], type.type[0]) &&
                validateValue(entry[1], type.type[1]),
        )
    );
}

function validateContainer(value: ParameterValue, type: ParameterType): boolean {
    switch (type.name) {
        case 'Struct':
            return validateStruct(value, type);
        case 'Dict':
            return validateDict(value, type);
        case 'Enum':
            return (
                typeof value === 'string' && type.type.some((entry) => String(entry.name) === value)
            );
        case 'List':
        case 'Stream':
            return Array.isArray(value) && value.every((item) => validateValue(item, type.type));
        case 'Set':
            return (
                Array.isArray(value) &&
                value.every(
                    (item) =>
                        Array.isArray(item) &&
                        item.length === 2 &&
                        validateValue(item[0], type.type) &&
                        item[1] === 'Void',
                )
            );
        case 'Tuple':
            return (
                Array.isArray(value) &&
                value.length === type.type.length &&
                type.type.every((child, index) => validateValue(value[index], child))
            );
        case 'Variant': {
            const index = variantIndex(value, type);
            return (
                index >= 0 &&
                Array.isArray(value) &&
                validateValue(value[1], type.struct[index].type)
            );
        }
        default:
            return true;
    }
}

/** Checks the restricted JSON representation without coercing numbers through JS Number. */
export function validateValue(value: ParameterValue, type: ParameterType): boolean {
    if (value === undefined) return false;
    const depth = optionalDepth(type);
    if (depth) {
        if (value === null || (Array.isArray(value) && value.length === 0)) return true;
        return (
            Array.isArray(value) &&
            value.length === 1 &&
            validateValue(value[0], {...type, optional: depth > 1, optionalLevel: depth - 1})
        );
    }
    const name = type.name;
    if (isPgType(name)) return value === null || typeof value === 'string' || isBinary(value);
    if (isDateType(name)) return typeof value === 'string' && isDateValue(value, name);
    const int = /^(?:Uint|Int)(8|16|32|64)$/.exec(name);
    if (int) return validateInteger(value, name, BigInt(int[1]));
    if (name === 'Decimal') return validateDecimal(value, type);
    if (name.startsWith('Tz')) return typeof value === 'string';
    if (Object.prototype.hasOwnProperty.call(primitiveValidators, name))
        return primitiveValidators[name](value);
    return validateContainer(value, type);
}
