import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
    Button,
    Flex,
    Icon,
    Radio,
    SegmentedRadioGroup,
    Select,
    Switch,
    Text,
    TextArea,
    TextInput,
} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';
import {DataTypePopup} from '../../../components/DataTypePopup';
import {toParameterType} from '../helpers/dataTypes';
import TrashBinIcon from '@gravity-ui/icons/svgs/trash-bin.svg';
import ChevronDownIcon from '@gravity-ui/icons/svgs/chevron-down.svg';
import ChevronRightIcon from '@gravity-ui/icons/svgs/chevron-right.svg';
import ResetIcon from '@gravity-ui/icons/svgs/arrow-rotate-left.svg';
import PlusIcon from '@gravity-ui/icons/svgs/plus.svg';
import RawIcon from './icons/RawIcon';
import BinaryIcon from './icons/BinaryIcon';
import {ParameterDocument} from './ParameterDocument';
import {ParameterDateInput} from './ParameterDateInput';
import type {
    QueryParameterEntry,
    QueryParameterItem,
    QueryParameterType,
    QueryParameterValue,
} from '../../../types/queryParameters';
import {
    createId,
    defaultValue,
    escapeString,
    formatType,
    fromRaw,
    isDocumentType,
    isNullLevel,
    isNullValue,
    isNumericType,
    isScalarType,
    isTextType,
    nullableInfo,
    parameterFormatExample,
    toRaw,
    unescapeString,
    validType,
} from '../helpers/parameters';
import i18n from '../i18n';
import './ParameterValue.scss';

const block = cn('qp-parameter-value');
type Props = {
    type: QueryParameterType;
    value: QueryParameterValue;
    initialValue?: QueryParameterValue;
    header?: React.ReactNode;
    horizontal?: boolean;
    nullActive?: boolean;
    onChange: (value: QueryParameterValue) => void;
    onReset?: () => void;
    editing: boolean;
    disabled?: boolean;
    label: string;
    path?: string;
    errors?: Record<string, string>;
    onValidityChange?: (path: string, invalid: boolean) => void;
    className?: string;
};

function isDateType(type: QueryParameterType) {
    return /^(Date|Date32|Datetime|Datetime64|Timestamp|Timestamp64)$/.test(type.kind);
}

function shapeValid(type: QueryParameterType, value: QueryParameterValue): boolean {
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

export function ParameterValue(props: Props) {
    if (!validType(props.type) || !shapeValid(props.type, props.value)) {
        return (
            <Text className={props.className} color="danger" role="alert">
                {i18n(validType(props.type) ? 'alert_invalid-value' : 'alert_invalid-type')}
            </Text>
        );
    }
    if (props.type.kind === 'Optional' || props.type.kind === 'Pg') {
        return <NullableValue {...props} type={props.type} />;
    }
    return <ParameterValueContent {...props} />;
}

function NullableValue(
    props: Props & {type: Extract<QueryParameterType, {kind: 'Optional' | 'Pg'}>},
) {
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
        <ParameterValueContent
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
                    <div className={block('content', {nested: type.kind === 'Optional'})}>
                        {child}
                    </div>
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
            <div className={block('content', {nested: type.kind === 'Optional' && !nullActive})}>
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

function StructValue(props: Props & {type: Extract<QueryParameterType, {kind: 'Struct'}>}) {
    const {type, value, initialValue, onChange, editing} = props;
    const items = value as QueryParameterItem[];
    const baseline = Array.isArray(initialValue) ? initialValue : [];
    return (
        <Flex direction="column" gap={2}>
            {type.fields.map((field) => {
                const item = items.find(({id}) => id === field.id);
                const child = (
                    <ParameterValue
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
                            <DataTypePopup type={toParameterType(field.type)}>
                                <Text color="secondary"> [{formatType(field.type)}]:</Text>
                            </DataTypePopup>
                        </Text>
                        {child}
                    </Flex>
                );
            })}
        </Flex>
    );
}

function needsEscapes(type: QueryParameterType, value: QueryParameterValue) {
    return (
        (type.kind === 'String' || type.kind === 'Pg') &&
        typeof value === 'string' &&
        /[\r\n]/.test(value)
    );
}

/** Representation drafts stay local until they can be decoded without losing data. */
function useRepresentation(props: Props) {
    const {type, value, editing, path = '$', onChange, onValidityChange} = props;
    const multiline = needsEscapes(type, value);
    const [mode, setMode] = useState<'raw' | 'escaped' | null>(multiline ? 'escaped' : null);
    const [text, setText] = useState(() => (multiline ? escapeString(String(value)) : ''));
    const [invalid, setInvalid] = useState(false);
    const callback = useRef(onValidityChange);
    callback.current = onValidityChange;
    useEffect(() => {
        callback.current?.(path, editing && invalid);
    }, [editing, invalid, path]);
    useEffect(() => () => callback.current?.(path, false), [path]);
    useEffect(() => {
        if (multiline && mode === null) {
            setMode('escaped');
            setText(escapeString(String(value)));
        }
    }, [multiline, mode, value]);
    const toggle = (next: 'raw' | 'escaped') => {
        if (invalid) return;
        if (mode === next) {
            setMode(multiline ? 'escaped' : null);
            if (multiline) setText(escapeString(String(value)));
            return;
        }
        try {
            setText(next === 'escaped' ? escapeString(String(value)) : toRaw(type, value));
            setMode(next);
        } catch {
            /* Invalid structured values must be corrected before changing representation. */
        }
    };
    const update = (next: string) => {
        setText(next);
        try {
            const decoded = mode === 'escaped' ? unescapeString(next) : fromRaw(type, next, value);
            setInvalid(false);
            onChange(decoded);
        } catch {
            setInvalid(true);
        }
    };
    const clear = (nextValue: QueryParameterValue = value) => {
        const escaped = needsEscapes(type, nextValue);
        setMode(escaped ? 'escaped' : null);
        setInvalid(false);
        setText(escaped ? escapeString(String(nextValue)) : '');
    };
    const error = invalid
        ? i18n(mode === 'escaped' ? 'alert_invalid-escape' : 'alert_invalid-raw')
        : undefined;
    return {mode, text, invalid, toggle, update, clear, error, multiline};
}

function ValueActions({
    label,
    disabled,
    raw,
    rawDisabled,
    onRaw,
    onReset,
}: {
    label: string;
    disabled?: boolean;
    raw?: boolean;
    rawDisabled?: boolean;
    onRaw?: () => void;
    onReset: () => void;
}) {
    return (
        <Flex alignItems="center" className={block('actions')}>
            {onRaw && (
                <Button
                    view="flat-secondary"
                    size="m"
                    className={block('raw')}
                    selected={raw}
                    disabled={disabled || rawDisabled}
                    onClick={onRaw}
                    aria-label={`RAW: ${label}`}
                >
                    <Icon data={RawIcon} size={16} />
                </Button>
            )}
            <Button
                view="flat-secondary"
                size="m"
                disabled={disabled}
                onClick={onReset}
                aria-label={`${i18n('action_reset-value')}: ${label}`}
            >
                <Icon data={ResetIcon} size={12} />
            </Button>
        </Flex>
    );
}

function useChildValidity(onValidityChange: Props['onValidityChange']) {
    const [pending, setPending] = useState<Set<string>>(() => new Set());
    const callback = useRef(onValidityChange);
    callback.current = onValidityChange;
    const childValidity = useCallback((childPath: string, invalid: boolean) => {
        setPending((current) => {
            if (current.has(childPath) === invalid) return current;
            const next = new Set(current);
            if (invalid) next.add(childPath);
            else next.delete(childPath);
            return next;
        });
        callback.current?.(childPath, invalid);
    }, []);
    const clearChildren = () => {
        pending.forEach((childPath) => callback.current?.(childPath, false));
        setPending(new Set());
    };
    return {pending, childValidity, clearChildren};
}

function ParameterValueContent(props: Props) {
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
    const boxed = ['Variant', 'Dict', 'Struct', 'Tuple'].includes(type.kind);
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
            <div
                className={block('content', {nested: !scalar})}
                hidden={!expanded || (props.nullActive && !scalar)}
            >
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

function BoxHeader({
    className,
    type,
    header,
    label,
    expanded,
    disabled,
    onToggle,
    count,
    actions,
}: {
    className?: string;
    type: QueryParameterType;
    header?: React.ReactNode;
    label: string;
    expanded: boolean;
    disabled?: boolean;
    onToggle: () => void;
    count: number;
    actions: React.ReactNode;
}) {
    const collapsible = ['Dict', 'Variant', 'Struct', 'Tuple'].includes(type.kind);
    const elements =
        type.kind === 'Struct'
            ? type.fields.length
            : type.kind === 'Variant'
              ? type.options.length
              : count;
    return (
        <Flex alignItems="center" gap={1} className={block('box-header', className)}>
            {collapsible && (
                <Button
                    className={block('toggle')}
                    view="flat-secondary"
                    size="m"
                    disabled={disabled}
                    aria-expanded={expanded}
                    aria-label={`${i18n(expanded ? 'action_collapse' : 'action_expand')}: ${label}`}
                    onClick={onToggle}
                >
                    <Icon data={expanded ? ChevronDownIcon : ChevronRightIcon} size={12} />
                </Button>
            )}
            <div className={block('cell')}>
                {header ?? (
                    <DataTypePopup type={toParameterType(type)}>
                        <Text variant="code-1">{formatType(type)}</Text>
                    </DataTypePopup>
                )}
            </div>
            {collapsible && type.kind !== 'Variant' && (
                <Text color="secondary" variant="caption-2" className={block('count')}>
                    {i18n(
                        type.kind === 'Struct'
                            ? elements === 1
                                ? 'value_field'
                                : 'value_fields'
                            : elements === 1
                              ? 'value_element'
                              : 'value_elements',
                        {count: elements},
                    )}
                </Text>
            )}
            {actions}
        </Flex>
    );
}

function ListHeader({
    className,
    type,
    label,
    disabled,
    expanded,
    onToggle,
    count,
    actions,
}: {
    className?: string;
    type: Extract<QueryParameterType, {kind: 'List'}>;
    label: string;
    disabled?: boolean;
    expanded: boolean;
    onToggle: () => void;
    count: number;
    actions: React.ReactNode;
}) {
    return (
        <Flex gap={1} alignItems="center" className={className}>
            <Button
                className={block('toggle')}
                view="flat"
                size="m"
                disabled={disabled}
                aria-expanded={expanded}
                aria-label={`${i18n(expanded ? 'action_collapse' : 'action_expand')}: ${label}`}
                onClick={onToggle}
            >
                <Icon data={expanded ? ChevronDownIcon : ChevronRightIcon} size={12} />
            </Button>
            <DataTypePopup type={toParameterType(type)}>
                <Text variant="code-1">
                    {'List '}
                    <Text variant="code-1" color="secondary">
                        {`<${formatType(type.item)}>`}
                    </Text>
                </Text>
            </DataTypePopup>
            <Text color="secondary" variant="caption-2" className={block('cell')}>
                {i18n(count === 1 ? 'value_element' : 'value_elements', {count})}
            </Text>
            {actions}
        </Flex>
    );
}

function ScalarValue({
    onChange,
    type,
    value,
    editing,
    disabled,
    label,
    actions,
    representation,
    error,
    nullActive,
}: Props & {
    actions: React.ReactNode;
    representation: ReturnType<typeof useRepresentation>;
    error?: string;
}) {
    if (isDocumentType(type))
        return (
            <Flex direction="column" gap={1}>
                <ParameterDocument
                    value={nullActive ? '' : String(value)}
                    onUpdate={onChange}
                    editing={editing}
                    disabled={disabled}
                    label={label}
                    error={error}
                />
                {!editing && error && (
                    <Text color="danger" role="alert">
                        {error}
                    </Text>
                )}
            </Flex>
        );
    if (!editing)
        return (
            <Flex direction="column" gap={1}>
                <pre className={block('text')}>
                    {isTextType(type) && type.kind !== 'Uuid'
                        ? JSON.stringify(value)
                        : String(value)}
                </pre>
                {error && (
                    <Text color="danger" role="alert">
                        {error}
                    </Text>
                )}
            </Flex>
        );
    const text = nullActive ? '' : representation.mode ? representation.text : String(value);
    const update = representation.mode ? representation.update : onChange;
    const format = parameterFormatExample(type);
    const controlProps = {
        title: format ? i18n('context_format', {format}) : undefined,
        'aria-label': representation.mode
            ? `${representation.mode === 'raw' ? 'RAW' : i18n('action_escaped')}: ${label}`
            : label,
    };
    if (type.kind === 'Unknown')
        return (
            <Flex gap={1} alignItems="flex-start">
                <TextArea
                    className={block('cell')}
                    value={text}
                    onUpdate={onChange}
                    disabled={disabled}
                    minRows={3}
                    controlProps={{'aria-label': `RAW: ${label}`}}
                    validationState={error ? 'invalid' : undefined}
                    errorMessage={error}
                />
                {actions}
            </Flex>
        );
    if (type.kind === 'Bool')
        return (
            <Flex direction="column" gap={1}>
                <SegmentedRadioGroup
                    value={nullActive ? '' : String(value)}
                    onUpdate={(next) => onChange(next === 'true')}
                    disabled={disabled}
                    aria-label={label}
                    options={[
                        {value: 'true', content: 'True'},
                        {value: 'false', content: 'False'},
                    ]}
                />
                {error && (
                    <Text color="danger" role="alert">
                        {error}
                    </Text>
                )}
            </Flex>
        );
    if (type.kind === 'Enum')
        return (
            <Flex gap={1}>
                <Select
                    className={block('cell')}
                    width="max"
                    value={nullActive ? [] : [String(value)]}
                    options={type.options.map((option) => ({value: option, content: option}))}
                    onUpdate={([next]) => {
                        if (next !== undefined) onChange(next);
                    }}
                    disabled={disabled}
                    aria-label={label}
                    validationState={error ? 'invalid' : undefined}
                    errorMessage={error}
                />
                {actions}
            </Flex>
        );
    if (isDateType(type))
        return (
            <Flex gap={1} alignItems="flex-start">
                <div className={block('cell')}>
                    <ParameterDateInput
                        value={text}
                        onUpdate={update}
                        kind={type.kind}
                        placeholder={parameterFormatExample(type)}
                        label={label}
                        disabled={disabled}
                        error={error}
                    />
                </div>
                {actions}
            </Flex>
        );
    return (
        <Flex gap={1} alignItems="flex-start">
            {(type.kind === 'String' || type.kind === 'Pg') && (
                <Button
                    view="outlined"
                    size="m"
                    className={block('binary')}
                    selected={representation.mode === 'escaped'}
                    disabled={
                        disabled ||
                        representation.invalid ||
                        (representation.mode === 'escaped' && representation.multiline)
                    }
                    onClick={() => representation.toggle('escaped')}
                    aria-label={`${i18n('action_escaped')}: ${label}`}
                >
                    <Icon data={BinaryIcon} size={16} />
                </Button>
            )}
            <TextInput
                className={block('cell')}
                size="m"
                value={text}
                placeholder={parameterFormatExample(type)}
                onUpdate={update}
                disabled={disabled}
                controlProps={controlProps}
                endContent={actions}
                validationState={error ? 'invalid' : undefined}
                errorMessage={error}
            />
        </Flex>
    );
}

function childProps(
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

function CollectionValue(props: Props) {
    const {type, value, initialValue, editing, disabled, label, onChange} = props;
    const root = useRef<HTMLDivElement>(null);
    const addButton = useRef<HTMLButtonElement>(null);
    const focusNew = useRef(false);
    useEffect(() => {
        if (focusNew.current) {
            const inputs = root.current?.querySelectorAll<HTMLInputElement>('input, textarea');
            inputs?.[inputs.length - 1]?.focus();
            focusNew.current = false;
        }
    }, [value]);
    if (type.kind !== 'List' && type.kind !== 'Tuple' && type.kind !== 'Dict') return null;
    const items = value as QueryParameterItem[];
    const baseline = Array.isArray(initialValue) ? initialValue : [];
    const remove = (id: string) => {
        onChange(items.filter((item) => item.id !== id));
        addButton.current?.focus();
    };
    return (
        <Flex ref={root} direction="column" gap={2} className={block('collection')}>
            {items.map((item, index) => {
                const initial = baseline.find(({id}) => id === item.id);
                const update = (next: QueryParameterValue) =>
                    onChange(
                        items.map((entry) =>
                            entry.id === item.id ? {...entry, value: next} : entry,
                        ),
                    );
                let itemType: QueryParameterType | undefined;
                if (type.kind === 'List') itemType = type.item;
                if (type.kind === 'Tuple') itemType = type.items[index];
                return (
                    <Flex key={item.id} gap={1} alignItems="flex-start">
                        <div className={block('cell')}>
                            {type.kind === 'Dict' ? (
                                <DictEntry
                                    {...props}
                                    type={type}
                                    entry={item as QueryParameterEntry}
                                    initial={initial as QueryParameterEntry | undefined}
                                    index={index}
                                />
                            ) : (
                                itemType && (
                                    <ParameterValue
                                        {...childProps(
                                            props,
                                            itemType,
                                            item.value,
                                            initial?.value,
                                            item.id,
                                            String(index + 1),
                                            update,
                                        )}
                                    />
                                )
                            )}
                        </div>
                        {editing && type.kind !== 'Tuple' && (
                            <Button
                                view="flat-secondary"
                                size="m"
                                disabled={disabled}
                                onClick={() => remove(item.id)}
                                aria-label={`${i18n('action_remove-item')}: ${label} ${index + 1}`}
                            >
                                <Icon data={TrashBinIcon} size={16} />
                            </Button>
                        )}
                    </Flex>
                );
            })}
            {editing && type.kind !== 'Tuple' && (
                <Button
                    ref={addButton}
                    size="m"
                    className={block('add')}
                    disabled={disabled}
                    onClick={() => {
                        focusNew.current = true;
                        const next =
                            type.kind === 'Dict'
                                ? {
                                      id: createId(),
                                      key: defaultValue(type.key),
                                      value: defaultValue(type.value),
                                  }
                                : {id: createId(), value: defaultValue(type.item)};
                        onChange([...items, next]);
                    }}
                >
                    <Icon data={PlusIcon} size={12} />
                    {i18n('action_add')}
                </Button>
            )}
        </Flex>
    );
}

function DictEntry(
    props: Props & {
        type: Extract<QueryParameterType, {kind: 'Dict'}>;
        entry: QueryParameterEntry;
        initial?: QueryParameterEntry;
        index: number;
    },
) {
    const {type, entry, initial, index, value, onChange, editing, disabled} = props;
    const entries = value as QueryParameterEntry[];
    const [generation, setGeneration] = useState(0);
    const {pending, childValidity, clearChildren} = useChildValidity(props.onValidityChange);
    const childrenProps = {...props, onValidityChange: childValidity};
    const update = (next: QueryParameterEntry) =>
        onChange(entries.map((item) => (item.id === entry.id ? next : item)));
    const pairType: QueryParameterType = {kind: 'Tuple', items: [type.key, type.value]};
    const pair = [
        {id: 'key', value: entry.key},
        {id: 'value', value: entry.value},
    ];
    const pairProps = {
        ...props,
        header: undefined,
        type: pairType,
        value: pair,
        path: `${props.path ?? '$'}/${entry.id}`,
        label: `${props.label}: ${index + 1}`,
        onChange: (next: QueryParameterValue) => {
            const parts = next as QueryParameterItem[];
            update({...entry, key: parts[0].value, value: parts[1].value});
        },
    };
    const representation = useRepresentation(pairProps);
    const paired =
        typeof entry.key === 'string' &&
        typeof entry.value === 'string' &&
        (isTextType(type.key) || isNumericType(type.key)) &&
        (isTextType(type.value) || isNumericType(type.value)) &&
        !needsEscapes(type.key, entry.key) &&
        !needsEscapes(type.value, entry.value);
    const actions = editing && (
        <ValueActions
            label={pairProps.label}
            disabled={disabled}
            raw={representation.mode === 'raw'}
            rawDisabled={representation.invalid || pending.size > 0}
            onRaw={() => representation.toggle('raw')}
            onReset={() => {
                representation.clear();
                clearChildren();
                setGeneration((current) => current + 1);
                update({
                    ...entry,
                    key: initial?.key ?? defaultValue(type.key),
                    value: initial?.value ?? defaultValue(type.value),
                });
            }}
        />
    );
    if (representation.mode === 'raw')
        return (
            <Flex gap={1} alignItems="flex-start">
                <TextArea
                    className={block('cell')}
                    value={representation.text}
                    onUpdate={representation.update}
                    disabled={disabled}
                    minRows={2}
                    controlProps={{'aria-label': `RAW: ${pairProps.label}`}}
                    validationState={representation.invalid ? 'invalid' : undefined}
                    errorMessage={representation.error}
                />
                {actions}
            </Flex>
        );
    if (!paired)
        return (
            <Flex key={generation} direction="column" gap={2}>
                <ParameterValue
                    {...childProps(
                        childrenProps,
                        type.key,
                        entry.key,
                        initial?.key,
                        `${entry.id}/key`,
                        `${index + 1}: ${i18n('field_key')}`,
                        (key) => update({...entry, key}),
                    )}
                />
                <ParameterValue
                    {...childProps(
                        childrenProps,
                        type.value,
                        entry.value,
                        initial?.value,
                        `${entry.id}/value`,
                        `${index + 1}: ${i18n('field_value')}`,
                        (next) => update({...entry, value: next}),
                    )}
                />
            </Flex>
        );
    return (
        <Flex key={generation} gap={2} alignItems="flex-start">
            {(['key', 'value'] as const).map((field) => {
                return editing ? (
                    <div key={field} className={block('cell')}>
                        <ParameterValue
                            {...childProps(
                                childrenProps,
                                field === 'key' ? type.key : type.value,
                                entry[field],
                                initial?.[field],
                                `${entry.id}/${field}`,
                                `${index + 1}: ${i18n(field === 'key' ? 'field_key' : 'field_value')}`,
                                (next) => update({...entry, [field]: next}),
                            )}
                        />
                    </div>
                ) : (
                    <pre key={field} className={block('text', {paired: true})}>
                        {field === 'value' && isTextType(type.value)
                            ? JSON.stringify(entry[field])
                            : String(entry[field])}
                    </pre>
                );
            })}
            {actions}
        </Flex>
    );
}

function VariantValue(
    props: Props & {type: Extract<QueryParameterType, {kind: 'Variant'}>; pending: boolean},
) {
    const {type, value, initialValue, editing, disabled, pending, onChange} = props;
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
                                    <DataTypePopup type={toParameterType(option.type)}>
                                        <Text color="secondary">[{formatType(option.type)}]:</Text>
                                    </DataTypePopup>
                                </Text>
                                <ParameterValue
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
