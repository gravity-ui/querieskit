import React, {useState} from 'react';
import {Flex, Text, TextArea} from '@gravity-ui/uikit';
import {defaultValue, isDocumentType, isScalarType} from '../helpers/parameters';
import type {RecursiveValueProps} from './parameterValueTypes';
import cn from 'bem-cn-lite';
import './ParameterValueContent.scss';
import {useChildValidity} from './useChildValidity';
import {useRepresentation} from './useRepresentation';
import {ValueActions} from './ValueActions';
import {BoxHeader, ListHeader} from './ParameterValueHeaders';
import {ScalarValue} from './ScalarValue';
import {StructValue} from './StructValue';
import {CollectionValue} from './CollectionValue';
import {VariantValue} from './VariantValue';

const block = cn('qp-parameter-value');

export function ParameterValueContent(props: RecursiveValueProps) {
    const {
        type,
        value,
        initialValue,
        header,
        horizontal = false,
        onChange,
        editing,
        disabled,
        label,
        path = '$',
        errors,
        onValidityChange,
        className,
    } = props;
    const [expanded, setExpanded] = useState(true);
    const [generation, setGeneration] = useState(0);
    const {pending, childValidity, clearChildren} = useChildValidity(onValidityChange);
    const representation = useRepresentation(props);
    const reset = () => {
        if (props.onReset) {
            props.onReset();
            return;
        }
        const nextValue = initialValue ?? defaultValue(type);
        representation.clear(nextValue);
        clearChildren();
        setGeneration((current) => current + 1);
        onChange(nextValue);
    };
    const scalar = isScalarType(type);
    const boxed =
        ['Variant', 'Dict', 'Struct'].includes(type.kind) || (editing && type.kind === 'Tuple');
    const actions =
        editing && !isDocumentType(type) && type.kind !== 'Bool' ? (
            <ValueActions
                label={label}
                disabled={disabled}
                raw={representation.mode === 'raw'}
                rawDisabled={representation.invalid || pending.size > 0}
                onRaw={
                    !scalar || type.kind === 'String'
                        ? () => representation.toggle('raw')
                        : undefined
                }
                onReset={reset}
            />
        ) : null;
    const error = props.nullActive ? undefined : representation.error || errors?.[path];
    const collection = Array.isArray(value) ? value : [];
    const contentProps = {...props, onValidityChange: childValidity};
    let content: React.ReactNode;
    if (scalar) {
        content = (
            <ScalarValue
                {...props}
                actions={actions}
                representation={representation}
                error={error}
            />
        );
    } else if (representation.mode === 'raw') {
        content = (
            <TextArea
                value={representation.text}
                onUpdate={representation.update}
                disabled={disabled}
                minRows={3}
                maxRows={12}
                controlProps={{'aria-label': `RAW: ${label}`}}
                validationState={error ? 'invalid' : undefined}
                errorMessage={error}
            />
        );
    } else {
        content = (
            <div key={generation}>
                {type.kind === 'Variant' ? (
                    <VariantValue {...contentProps} type={type} pending={pending.size > 0} />
                ) : type.kind === 'Struct' ? (
                    <StructValue {...contentProps} type={type} />
                ) : (
                    <CollectionValue {...contentProps} />
                )}
            </div>
        );
    }
    return (
        <Flex
            direction="column"
            gapRow={scalar ? 0 : 2}
            className={block({boxed, horizontal: horizontal && editing}, className)}
        >
            {!boxed && header && <div className={block('header')}>{header}</div>}
            {boxed && (
                <BoxHeader
                    className={block('box-heading')}
                    type={type}
                    header={header}
                    label={label}
                    expanded={expanded}
                    disabled={disabled}
                    onToggle={() => setExpanded(!expanded)}
                    count={collection.length}
                    actions={actions}
                />
            )}
            {type.kind === 'List' && (
                <ListHeader
                    className={block('list-header')}
                    type={type}
                    label={label}
                    disabled={disabled}
                    expanded={expanded}
                    onToggle={() => setExpanded(!expanded)}
                    count={collection.length}
                    actions={actions}
                />
            )}
            <div className={block('content')} hidden={!expanded || (props.nullActive && !scalar)}>
                {content}
            </div>
            {error && !scalar && representation.mode !== 'raw' && (
                <Text className={block('error')} color="danger" role="alert">
                    {error}
                </Text>
            )}
        </Flex>
    );
}
