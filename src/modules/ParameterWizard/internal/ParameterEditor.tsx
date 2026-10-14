import React, {useState} from 'react';
import {ChevronDown, ChevronRight} from '@gravity-ui/icons';
import {ActionTooltip, Button, Flex, Icon, Text} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';
import {DataTypePopup} from '../../../components/DataTypePopup';
import {
    defaultValue,
    isPgType,
    isRecord,
    optionalDepth,
    readOptional,
    variantIndex,
    wrapOptional,
} from '../helpers/values';
import i18n from '../i18n';
import {ContainerEditor} from './ContainerEditor';
import {PrimitiveEditor} from './PrimitiveEditor';
import {OptionalValueControl} from './OptionalValueControl';
import {RawEditor} from './RawEditor';
import type {EditorProps} from './types';
import './ParameterEditor.scss';

const block = cn('qp-parameter-editor');

function ExpandButton({expanded, onClick}: {expanded: boolean; onClick: () => void}) {
    return (
        <ActionTooltip title={i18n(expanded ? 'action_collapse' : 'action_expand')}>
            <Button
                className={block('toggle')}
                view="flat-secondary"
                size="m"
                aria-label={i18n(expanded ? 'action_collapse' : 'action_expand')}
                aria-expanded={expanded}
                onClick={onClick}
            >
                <Icon data={expanded ? ChevronDown : ChevronRight} size={12} />
            </Button>
        </ActionTooltip>
    );
}

function EditorContent({
    container,
    expanded,
    actionsInHeader,
    actions,
    itemAction,
    children,
}: {
    container: boolean;
    expanded: boolean;
    actionsInHeader: boolean;
    actions?: React.ReactNode;
    itemAction?: React.ReactNode;
    children: React.ReactNode;
}) {
    return (
        <div className={block('content', {container})} hidden={container && !expanded}>
            <Flex gap={2} alignItems="start">
                <div className={block('value')}>{children}</div>
                {!actionsInHeader && actions}
                {!container && itemAction}
            </Flex>
        </div>
    );
}

function hasContainerShape({type, value}: EditorProps) {
    if (value === undefined) return true;
    switch (type.name) {
        case 'Struct':
            return Array.isArray(value)
                ? value.length <= type.struct.length
                : isRecord(value) &&
                      Object.keys(value).every((key) =>
                          type.struct.some((field) => String(field.key) === key),
                      );
        case 'Dict':
            return Array.isArray(value)
                ? value.every((item) => Array.isArray(item) && item.length === 2)
                : isRecord(value) &&
                      !type.type[0].optional &&
                      ['String', 'Utf8'].includes(type.type[0].name);
        case 'Tuple':
            return Array.isArray(value) && value.length <= type.type.length;
        case 'Set':
            return (
                Array.isArray(value) &&
                value.every(
                    (item) => Array.isArray(item) && item.length === 2 && item[1] === 'Void',
                )
            );
        case 'List':
            return Array.isArray(value);
        case 'Variant':
            return variantIndex(value, type) >= 0;
        default:
            return true;
    }
}

function renderValue(
    props: EditorProps,
    editorProps: EditorProps,
    raw: boolean,
    isNull: boolean,
    container: boolean,
) {
    if (raw) return <RawEditor {...props} />;
    if (isNull) return <Text color="secondary">NULL</Text>;
    if (container)
        return (
            <ContainerEditor
                {...editorProps}
                renderEditor={(child) => <ParameterEditor {...child} />}
            />
        );
    return <PrimitiveEditor {...editorProps} />;
}

export function ParameterEditor(props: EditorProps & {actions?: React.ReactNode}) {
    const {type, value, name, onChange, disabled, readOnly, actions, itemAction, hideLabel} = props;
    const [raw, setRaw] = useState(false);
    const [expanded, setExpanded] = useState(true);
    const depth = optionalDepth(type);
    const optional = readOptional(value, depth);
    const pgNull = isPgType(type.name) && optional.value === null;
    const isNull = optional.nullLevel !== undefined || pgNull;
    const baseType = {...type, optional: false, optionalLevel: 0};
    const editorProps: EditorProps = {
        ...props,
        type: baseType,
        value: optional.value,
        onChange: (v) => onChange(wrapOptional(v, depth)),
    };
    const container = ['List', 'Tuple', 'Struct', 'Dict', 'Set', 'Variant'].includes(type.name);
    const actionsInHeader =
        container || ['Json', 'JsonDocument', 'Yson', 'Unknown'].includes(type.name);
    const invalidShape = !optional.validShape || (!isNull && !hasContainerShape(editorProps));
    const useRaw = raw || invalidShape;
    if (invalidShape && !raw) setRaw(true);
    const nullable = depth > 0 || isPgType(type.name);
    const showLabel = !hideLabel || 'type' in type || 'struct' in type;
    const showHeader = showLabel || nullable || Boolean(actionsInHeader && actions);
    const editor = renderValue(props, editorProps, useRaw, isNull, container);
    return (
        <Flex className={block({container})} direction="column" gap={container ? 4 : 2}>
            {showHeader && (
                <Flex gap={1} alignItems="center" wrap="wrap">
                    {container && (
                        <ExpandButton expanded={expanded} onClick={() => setExpanded(!expanded)} />
                    )}
                    {showLabel && (
                        <>
                            <Text className={block('name')} variant="subheader-1">
                                {name}
                            </Text>
                            <DataTypePopup type={type} className={block('type')}>
                                <Text variant="code-1" color="secondary">
                                    {type.name}
                                </Text>
                            </DataTypePopup>
                        </>
                    )}
                    {nullable && <OptionalValueControl {...props} />}
                    {container && optional.value === undefined && !isNull && !readOnly && (
                        <Button
                            size="s"
                            disabled={disabled}
                            onClick={() => editorProps.onChange(defaultValue(baseType))}
                        >
                            {i18n('action_set-value')}
                        </Button>
                    )}
                    <Flex className={block('actions')} gap={1} alignItems="center">
                        {container && (
                            <Button
                                size="s"
                                view="flat-secondary"
                                selected={useRaw}
                                disabled={invalidShape}
                                onClick={() => setRaw(!raw)}
                            >
                                {i18n('action_raw')}
                            </Button>
                        )}
                        {actionsInHeader && actions}
                        {container && itemAction}
                    </Flex>
                </Flex>
            )}
            <EditorContent
                container={container}
                expanded={expanded}
                actionsInHeader={actionsInHeader}
                actions={actions}
                itemAction={itemAction}
            >
                {editor}
            </EditorContent>
        </Flex>
    );
}
