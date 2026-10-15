import type {ParameterType} from '../../../types/dataTypes';
import type {QueryParameterType} from '../../../types/queryParameters';
import {validType} from './parameters';

function convertType(type: QueryParameterType): ParameterType {
    switch (type.kind) {
        case 'Optional': {
            const item = convertType(type.item);
            return {...item, optional: true, optionalLevel: (item.optionalLevel ?? 0) + 1};
        }
        case 'List':
            return {name: 'List', type: convertType(type.item)};
        case 'Tuple':
            return {name: 'Tuple', type: type.items.map(convertType)};
        case 'Dict':
            return {name: 'Dict', type: [convertType(type.key), convertType(type.value)]};
        case 'Struct':
            return {
                name: 'Struct',
                struct: type.fields.map((field) => ({
                    key: field.name,
                    type: convertType(field.type),
                })),
            };
        case 'Variant':
            return {
                name: 'Variant',
                struct: type.options.map((option) => ({
                    key: option.name,
                    type: convertType(option.type),
                })),
            };
        case 'Enum':
            return {name: 'Enum', type: type.options.map((name) => ({name}))};
        case 'Decimal':
            return {
                name: 'Decimal',
                params: type.precision === undefined ? undefined : [type.precision, type.scale],
            };
        case 'Pg':
            return {name: `pg${type.name}`};
        case 'Unknown':
            return {name: 'Unknown', params: type.name === 'Unknown' ? undefined : [type.name]};
        default:
            return {name: type.kind};
    }
}

/** Adapt the query parameter schema to the shared type inspector. */
export function toParameterType(type: QueryParameterType): ParameterType | undefined {
    return validType(type) ? convertType(type) : undefined;
}
