import React from 'react';
import {Flex, Text} from '@gravity-ui/uikit';
import type {QueryParameterItem, QueryParameterType} from '../../../types/queryParameters';
import {defaultValue, formatType} from '../helpers/parameters';
import type {RecursiveValueProps} from './parameterValueTypes';
import cn from 'bem-cn-lite';
import './StructValue.scss';
import {childProps} from './parameterValueHelpers';

const block = cn('qp-parameter-value');

export function StructValue(
    props: RecursiveValueProps & {type: Extract<QueryParameterType, {kind: 'Struct'}>},
) {
    const {ValueComponent, type, value, initialValue, onChange, editing} = props;
    const items = value as QueryParameterItem[];
    const baseline = Array.isArray(initialValue) ? initialValue : [];
    return (
        <Flex direction="column" gap={2}>
            {type.fields.map((field) => {
                const item = items.find(({id}) => id === field.id);
                const child = (
                    <ValueComponent
                        {...childProps(
                            props,
                            field.type,
                            item ? item.value : defaultValue(field.type),
                            baseline.find(({id}) => id === field.id)?.value,
                            field.id,
                            field.name,
                            (next) =>
                                onChange(
                                    type.fields.map((entry) => ({
                                        id: entry.id,
                                        value:
                                            entry.id === field.id
                                                ? next
                                                : (items.find(({id}) => id === entry.id)?.value ??
                                                  defaultValue(entry.type)),
                                    })),
                                ),
                        )}
                    />
                );
                return (
                    <Flex key={field.id} direction={editing ? 'column' : 'row'} gap={1}>
                        <Text className={editing ? undefined : block('field-name')}>
                            {field.name}
                            {editing && <Text color="secondary"> [{formatType(field.type)}]:</Text>}
                        </Text>
                        {child}
                    </Flex>
                );
            })}
        </Flex>
    );
}
