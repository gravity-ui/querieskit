import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Button, Flex, Icon, Radio, Text, TextArea, TextInput} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';
import TrashBinIcon from '@gravity-ui/icons/svgs/trash-bin.svg';
import ChevronDownIcon from '@gravity-ui/icons/svgs/chevron-down.svg';
import ChevronRightIcon from '@gravity-ui/icons/svgs/chevron-right.svg';
import ResetIcon from '@gravity-ui/icons/svgs/arrow-rotate-left.svg';
import PlusIcon from '@gravity-ui/icons/svgs/plus.svg';
import RawIcon from './icons/RawIcon';
import BinaryIcon from './icons/BinaryIcon';
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
    onChange: (value: QueryParameterValue) => void;
    editing: boolean;
    disabled?: boolean;
    label: string;
    path?: string;
    errors?: Record<string, string>;
    onValidityChange?: (path: string, invalid: boolean) => void;
    className?: string;
};

function shapeValid(type: QueryParameterType, value: QueryParameterValue) {
    if (type.kind === 'List' || type.kind === 'Tuple' || type.kind === 'Dict') {
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
    return <ParameterValueContent {...props} />;
}

function needsEscapes(type: QueryParameterType, value: QueryParameterValue) {
    return type.kind === 'String' && typeof value === 'string' && /[\r\n]/.test(value);
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
        const nextValue = initialValue ?? defaultValue(type);
        representation.clear(nextValue);
        clearChildren();
        setGeneration((current) => current + 1);
        onChange(nextValue);
    };
    const scalar = ['String', 'Number', 'Json'].includes(type.kind);
    const boxed = ['Tuple', 'Variant', 'Dict'].includes(type.kind);
    const actions =
        editing && type.kind !== 'Json' ? (
            <ValueActions
                label={label}
                disabled={disabled}
                raw={representation.mode === 'raw'}
                rawDisabled={representation.invalid || pending.size > 0}
                onRaw={type.kind === 'Number' ? undefined : () => representation.toggle('raw')}
                onReset={reset}
            />
        ) : null;
    const error = representation.error || errors?.[path];
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
                ) : (
                    <CollectionValue {...contentProps} />
                )}
            </div>
        );
    }
    return (
        <Flex direction="column" gap={2} className={block({boxed}, className)}>
            {!boxed && header}
            {boxed && (
                <BoxHeader
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
                    type={type}
                    label={label}
                    disabled={disabled}
                    expanded={expanded}
                    onToggle={() => setExpanded(!expanded)}
                    count={collection.length}
                    actions={actions}
                />
            )}
            <div hidden={!expanded}>{content}</div>
            {error && !scalar && representation.mode !== 'raw' && (
                <Text color="danger" role="alert">
                    {error}
                </Text>
            )}
        </Flex>
    );
}

function BoxHeader({
    type,
    header,
    label,
    expanded,
    disabled,
    onToggle,
    count,
    actions,
}: {
    type: QueryParameterType;
    header?: React.ReactNode;
    label: string;
    expanded: boolean;
    disabled?: boolean;
    onToggle: () => void;
    count: number;
    actions: React.ReactNode;
}) {
    const collapsible = type.kind === 'Dict' || type.kind === 'Variant';
    const elements = type.kind === 'Variant' ? type.options.length : count;
    return (
        <Flex alignItems="center" gap={1}>
            {collapsible && (
                <Button
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
                {header ?? <Text variant="code-1">{formatType(type)}</Text>}
            </div>
            {collapsible && (
                <Text color="secondary" variant="caption-2" className={block('count')}>
                    {i18n(elements === 1 ? 'value_element' : 'value_elements', {count: elements})}
                </Text>
            )}
            {actions}
        </Flex>
    );
}

function ListHeader({
    type,
    label,
    disabled,
    expanded,
    onToggle,
    count,
    actions,
}: {
    type: Extract<QueryParameterType, {kind: 'List'}>;
    label: string;
    disabled?: boolean;
    expanded: boolean;
    onToggle: () => void;
    count: number;
    actions: React.ReactNode;
}) {
    return (
        <Flex gap={1} alignItems="center">
            <Button
                className={block('list-toggle')}
                view="flat"
                size="m"
                disabled={disabled}
                aria-expanded={expanded}
                aria-label={`${i18n(expanded ? 'action_collapse' : 'action_expand')}: ${label}`}
                onClick={onToggle}
            >
                <Icon data={expanded ? ChevronDownIcon : ChevronRightIcon} size={12} />
                <Text variant="code-1">
                    {'List '}
                    <Text variant="code-1" color="secondary">
                        {`<${formatType(type.item)}>`}
                    </Text>
                </Text>
            </Button>
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
}: Props & {
    actions: React.ReactNode;
    representation: ReturnType<typeof useRepresentation>;
    error?: string;
}) {
    if (!editing)
        return (
            <Flex direction="column" gap={1}>
                <pre className={block('text')}>{String(value) || i18n('value_empty')}</pre>
                {error && (
                    <Text color="danger" role="alert">
                        {error}
                    </Text>
                )}
            </Flex>
        );
    const text = representation.mode ? representation.text : String(value);
    const update = representation.mode ? representation.update : onChange;
    const controlProps = {
        'aria-label': representation.mode
            ? `${representation.mode === 'raw' ? 'RAW' : i18n('action_escaped')}: ${label}`
            : label,
    };
    if (type.kind === 'Json')
        return (
            <TextArea
                value={text}
                onUpdate={update}
                disabled={disabled}
                minRows={3}
                maxRows={12}
                controlProps={controlProps}
                validationState={error ? 'invalid' : undefined}
                errorMessage={error}
            />
        );
    return (
        <Flex gap={2} alignItems="flex-start">
            {type.kind === 'String' && (
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
        <Flex
            ref={root}
            direction="column"
            gap={2}
            className={block('collection', {list: type.kind === 'List'})}
        >
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
        ['String', 'Number'].includes(type.key.kind) &&
        ['String', 'Number'].includes(type.value.kind) &&
        !needsEscapes(type.key, entry.key) &&
        !needsEscapes(type.value, entry.value);
    const actions = editing && (
        <ValueActions
            label={pairProps.label}
            disabled={disabled}
            raw={representation.mode === 'raw'}
            rawDisabled={representation.invalid}
            onRaw={() => representation.toggle('raw')}
            onReset={() => {
                representation.clear();
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
            <Flex direction="column" gap={2}>
                <ParameterValue
                    {...childProps(
                        props,
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
                        props,
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
        <Flex gap={2} alignItems="flex-start">
            {(['key', 'value'] as const).map((field) => {
                const error = props.errors?.[`${pairProps.path}/${field}`];
                const label = `${pairProps.label}: ${i18n(field === 'key' ? 'field_key' : 'field_value')}`;
                return editing ? (
                    <TextInput
                        key={field}
                        className={block('cell')}
                        size="m"
                        value={String(entry[field])}
                        onUpdate={(next) => update({...entry, [field]: next})}
                        disabled={disabled}
                        placeholder={i18n(field === 'key' ? 'field_key' : 'field_value')}
                        controlProps={{'aria-label': label}}
                        validationState={error ? 'invalid' : undefined}
                        errorMessage={error}
                        endContent={field === 'value' ? actions : undefined}
                    />
                ) : (
                    <pre key={field} className={block('text')}>
                        {String(entry[field]) || i18n('value_empty')}
                    </pre>
                );
            })}
        </Flex>
    );
}

function VariantValue(
    props: Props & {type: Extract<QueryParameterType, {kind: 'Variant'}>; pending: boolean},
) {
    const {type, value, initialValue, editing, disabled, pending, onChange} = props;
    const selected = value as {optionId: string; value: QueryParameterValue};
    const baseline =
        initialValue && !Array.isArray(initialValue) && typeof initialValue !== 'string'
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
                            <Flex direction="column" gap={1} className={block('cell')}>
                                <Text variant="code-1" color={active ? 'primary' : 'secondary'}>
                                    {option.name}
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
