import type {ParameterType} from '../types/parameterWizard';

export const optionalDepth = (type: ParameterType) =>
    type.optional ? Math.max(1, type.optionalLevel || 1) : 0;

export function formatType(type: ParameterType): string {
    let result: string = type.name;
    if ('struct' in type)
        result += `<${type.struct.map((field) => `${field.key}: ${formatType(field.type)}`).join(', ')}>`;
    else if ('type' in type) {
        result += `<${Array.isArray(type.type) ? type.type.map((item) => (type.name === 'Enum' ? item.name : formatType(item as ParameterType))).join(', ') : formatType(type.type)}>`;
    } else if (type.params?.length) result += `(${type.params.join(', ')})`;
    for (const tag of type.tags || []) result = `Tagged<${result}, ${tag}>`;
    return result + '?'.repeat(optionalDepth(type));
}
