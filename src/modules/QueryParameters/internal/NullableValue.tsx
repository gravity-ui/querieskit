import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Flex, Select, Switch, Text} from '@gravity-ui/uikit';
import type {QueryParameterType, QueryParameterValue} from '../../../types/queryParameters';
import {defaultValue, isNullLevel, isNullValue, nullableInfo} from '../helpers/parameters';
import i18n from '../i18n';
import type {RecursiveValueProps} from './parameterValueTypes';
import cn from 'bem-cn-lite';
import './NullableValue.scss';

const block = cn('qp-parameter-value');

export function NullableValue(
    props: RecursiveValueProps & {
        type: Extract<QueryParameterType, {kind: 'Optional' | 'Pg'}>;
        ContentComponent: React.ComponentType<RecursiveValueProps>;
    },
) {
    const {ContentComponent} = props;
    const {type, value, initialValue, editing, horizontal, header, disabled, label, onChange} =
        props;
    const {type: childType, levels} = nullableInfo(type);
    const nullActive = isNullValue(type, value);
    const lastValue = useRef<QueryParameterValue | undefined>(nullActive ? undefined : value);
    if (!nullActive) lastValue.current = value;
    const [level, setLevel] = useState(isNullLevel(value) ? value.depth : 0);
    const selectedLevel = nullActive ? (isNullLevel(value) ? value.depth : 0) : level;
    const [revision, setRevision] = useState(0);
    // Keep child drafts mounted, but suspend their validity while the NULL value is active.
    const pending = useRef(new Set<string>());
    const validity = useRef(props.onValidityChange);
    validity.current = props.onValidityChange;
    const active = useRef(nullActive);
    active.current = nullActive;
    const reportValidity = useCallback((path: string, invalid: boolean) => {
        if (invalid) pending.current.add(path);
        else pending.current.delete(path);
        validity.current?.(path, invalid && !active.current);
    }, []);
    useEffect(() => {
        pending.current.forEach((path) => validity.current?.(path, !nullActive));
    }, [nullActive]);
    const reset = () => {
        const next = initialValue === undefined ? defaultValue(type) : initialValue;
        lastValue.current = isNullValue(type, next) ? undefined : next;
        setLevel(isNullLevel(next) ? next.depth : 0);
        pending.current.forEach((path) => validity.current?.(path, false));
        pending.current.clear();
        setRevision((current) => current + 1);
        onChange(next);
    };
    const childValue = nullActive
        ? (lastValue.current ?? (childType.kind === 'Pg' ? '' : defaultValue(childType)))
        : value;
    const child = (
        <ContentComponent
            {...props}
            key={revision}
            type={childType}
            value={childValue}
            header={undefined}
            horizontal={false}
            nullActive={nullActive}
            disabled={disabled || nullActive}
            errors={nullActive ? undefined : props.errors}
            onValidityChange={reportValidity}
            onReset={reset}
        />
    );
    if (!editing)
        return (
            <Flex direction="column" gap={1} className={block(null, props.className)}>
                {header}
                {nullActive ? (
                    <Text
                        title={`${i18n('field_null-level')}: ${selectedLevel + 1}`}
                        aria-label={`NULL: ${i18n('field_null-level')} ${selectedLevel + 1}`}
                    >
                        NULL
                    </Text>
                ) : (
                    child
                )}
            </Flex>
        );
    return (
        <div className={block({nullable: true, horizontal}, props.className)}>
            <div className={block('header')}>{header}</div>
            <Flex gap={2} alignItems="center" className={block('null-controls')}>
                <Switch
                    size="m"
                    checked={nullActive}
                    disabled={disabled}
                    controlProps={{'aria-label': `NULL: ${label}`}}
                    onUpdate={(checked) => {
                        setLevel(selectedLevel);
                        onChange(
                            checked
                                ? selectedLevel === 0
                                    ? null
                                    : {kind: 'optional-null', depth: selectedLevel}
                                : childValue,
                        );
                    }}
                >
                    NULL
                </Switch>
                {levels > 1 && (
                    <Select
                        size="m"
                        aria-label={`${i18n('field_null-level')}: ${label}`}
                        value={[String(selectedLevel)]}
                        disabled={disabled || !nullActive}
                        options={Array.from({length: levels}, (_, depth) => ({
                            value: String(depth),
                            content: String(depth + 1),
                        }))}
                        onUpdate={([next]) => {
                            const depth = Number(next);
                            setLevel(depth);
                            onChange(depth === 0 ? null : {kind: 'optional-null', depth});
                        }}
                    />
                )}
            </Flex>
            <div className={block('content')}>
                {child}
                {nullActive && props.errors?.[props.path ?? '$'] && (
                    <Text color="danger" role="alert">
                        {props.errors[props.path ?? '$']}
                    </Text>
                )}
            </div>
        </div>
    );
}
