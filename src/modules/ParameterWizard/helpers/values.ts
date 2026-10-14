import type {ParameterType, ParameterValue} from '../../../types/parameterWizard';
import {optionalDepth} from '../../../helpers/dataTypes';
export {optionalDepth} from '../../../helpers/dataTypes';
import {isValidBase64String} from './binary';

export const isPgType = (name: string) => /^_?pg/.test(name);
export const isRecord = (value: ParameterValue): value is Record<string, ParameterValue> =>
    value !== null && typeof value === 'object' && !Array.isArray(value);

export function wrapOptional(value: ParameterValue, depth: number): ParameterValue {
    let result = value;
    for (let i = 0; i < depth; i++) result = [result];
    return result;
}

export function readOptional(value: ParameterValue, depth: number) {
    let current = value;
    for (let level = 0; level < depth; level++) {
        if (current === null || (Array.isArray(current) && current.length === 0)) {
            return {value: undefined, nullLevel: level, validShape: true};
        }
        if (!Array.isArray(current) || current.length !== 1) {
            return {value: current, nullLevel: undefined, validShape: current === undefined};
        }
        current = current[0];
    }
    return {value: current, nullLevel: undefined, validShape: true};
}

export function defaultValue(type: ParameterType): ParameterValue {
    if (optionalDepth(type) || isPgType(type.name) || type.name === 'Null') return null;
    switch (type.name) {
        case 'Void':
            return 'Void';
        case 'List':
        case 'Set':
        case 'Dict':
        case 'EmptyList':
        case 'EmptyDict':
            return [];
        case 'Tuple':
            return type.type.map(defaultValue);
        case 'Struct':
            return Object.fromEntries(
                type.struct.map((field) => [field.key, defaultValue(field.type)]),
            );
        case 'Enum':
            return type.type[0] ? String(type.type[0].name) : undefined;
        default:
            return undefined;
    }
}

export function variantIndex(
    value: ParameterValue,
    type: Extract<ParameterType, {name: 'Struct' | 'Variant'}>,
) {
    if (!Array.isArray(value) || value.length !== 2) return -1;
    const selector = value[0];
    if (Array.isArray(selector) && selector.length === 1) {
        return type.struct.findIndex(
            (field) => typeof field.key === 'string' && field.key === selector[0],
        );
    }
    if (typeof selector !== 'string' || !/^\d+$/.test(selector)) return -1;
    const index = Number(selector);
    return index < type.struct.length ? index : -1;
}

export function variantValue(
    type: Extract<ParameterType, {name: 'Struct' | 'Variant'}>,
    index: number,
    value: ParameterValue,
): ParameterValue {
    const key = type.struct[index].key;
    return [typeof key === 'number' ? String(index) : [key], value];
}

export function isBinary(value: ParameterValue): value is [string] {
    return (
        Array.isArray(value) &&
        value.length === 1 &&
        typeof value[0] === 'string' &&
        isValidBase64String(value[0])
    );
}
