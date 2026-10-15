import type {QueryParameterType, QueryParameterValue} from '../../../types/queryParameters';
import {isNullValue, nullableInfo} from '../helpers/parameters';
import type {ParameterValueProps as Props} from './parameterValueTypes';

export function shapeValid(type: QueryParameterType, value: QueryParameterValue): boolean {
    if (type.kind === 'Optional')
        return isNullValue(type, value) || shapeValid(nullableInfo(type).type, value);
    if (type.kind === 'Pg') return value === null || typeof value === 'string';
    if (type.kind === 'Bool') return typeof value === 'boolean';
    if (
        type.kind === 'List' ||
        type.kind === 'Tuple' ||
        type.kind === 'Dict' ||
        type.kind === 'Struct'
    ) {
        return (
            Array.isArray(value) &&
            value.every(
                (entry) =>
                    entry &&
                    typeof entry === 'object' &&
                    typeof entry.id === 'string' &&
                    'value' in entry &&
                    (type.kind !== 'Dict' || 'key' in entry),
            )
        );
    }
    if (type.kind === 'Variant')
        return Boolean(
            value &&
            typeof value === 'object' &&
            !Array.isArray(value) &&
            'optionId' in value &&
            typeof value.optionId === 'string' &&
            'value' in value,
        );
    return typeof value === 'string';
}

export function childProps(
    props: Props,
    type: QueryParameterType,
    value: QueryParameterValue,
    initialValue: QueryParameterValue | undefined,
    suffix: string,
    label: string,
    onChange: Props['onChange'],
): Props {
    return {
        type,
        value,
        initialValue,
        label: `${props.label}: ${label}`,
        path: `${props.path ?? '$'}/${suffix}`,
        editing: props.editing,
        disabled: props.disabled,
        errors: props.errors,
        onValidityChange: props.onValidityChange,
        onChange,
    };
}
