import React, {useState} from 'react';
import {Flex, Radio, Text} from '@gravity-ui/uikit';
import type {QueryParameterType, QueryParameterValue} from '../../../types/queryParameters';
import {defaultValue, formatType} from '../helpers/parameters';
import type {RecursiveValueProps} from './parameterValueTypes';
import cn from 'bem-cn-lite';
import './VariantValue.scss';
import {childProps} from './parameterValueHelpers';

const block = cn('qp-parameter-value');

export function VariantValue(
    props: RecursiveValueProps & {
        type: Extract<QueryParameterType, {kind: 'Variant'}>;
        pending: boolean;
    },
) {
    const {ValueComponent, type, value, initialValue, editing, disabled, pending, onChange} = props;
    const selected = value as {optionId: string; value: QueryParameterValue};
    const baseline =
        initialValue &&
        typeof initialValue === 'object' &&
        !Array.isArray(initialValue) &&
        'optionId' in initialValue
            ? initialValue
            : undefined;
    const [drafts] = useState(
        () =>
            new Map(
                type.options.map((option) => [
                    option.id,
                    option.id === selected.optionId ? selected.value : defaultValue(option.type),
                ]),
            ),
    );
    const groupName = React.useId();
    return (
        <Flex direction="column" gap={2}>
            {type.options
                .filter((option) => editing || option.id === selected.optionId)
                .map((option) => {
                    const active = option.id === selected.optionId;
                    const optionValue = active
                        ? selected.value
                        : (drafts.get(option.id) ?? defaultValue(option.type));
                    return (
                        <Flex key={option.id} gap={2} alignItems="flex-start">
                            {editing && (
                                <Radio
                                    className={block('radio')}
                                    name={groupName}
                                    value={option.id}
                                    checked={active}
                                    disabled={disabled || pending}
                                    controlProps={{'aria-label': `${props.label}: ${option.name}`}}
                                    onUpdate={() => {
                                        drafts.set(selected.optionId, selected.value);
                                        onChange({optionId: option.id, value: optionValue});
                                    }}
                                />
                            )}
                            <Flex
                                direction={editing ? 'column' : 'row'}
                                gap={2}
                                className={block('cell')}
                            >
                                <Text variant="code-1" color={active ? 'primary' : 'secondary'}>
                                    {option.name}{' '}
                                    <Text color="secondary">[{formatType(option.type)}]:</Text>
                                </Text>
                                <ValueComponent
                                    {...childProps(
                                        props,
                                        option.type,
                                        optionValue,
                                        baseline?.optionId === option.id
                                            ? baseline.value
                                            : undefined,
                                        option.id,
                                        option.name,
                                        (next) => onChange({optionId: option.id, value: next}),
                                    )}
                                    disabled={disabled || !active}
                                    errors={active ? props.errors : undefined}
                                />
                            </Flex>
                        </Flex>
                    );
                })}
        </Flex>
    );
}
