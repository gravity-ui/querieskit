import React from 'react';
import {Button, Flex, Icon, Text} from '@gravity-ui/uikit';
import ChevronDownIcon from '@gravity-ui/icons/svgs/chevron-down.svg';
import ChevronRightIcon from '@gravity-ui/icons/svgs/chevron-right.svg';
import type {QueryParameterType} from '../../../types/queryParameters';
import {formatType} from '../helpers/parameters';
import i18n from '../i18n';
import cn from 'bem-cn-lite';
import './ParameterValueHeaders.scss';

const block = cn('qp-parameter-value');

export function BoxHeader({
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
            {collapsible && type.kind !== 'Variant' && (
                <Text color="secondary" variant="caption-2" className={block('count')}>
                    {i18n(type.kind === 'Struct' ? 'value_fields' : 'value_elements', {
                        count: elements,
                    })}
                </Text>
            )}
            {actions}
        </Flex>
    );
}

export function ListHeader({
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
                {i18n('value_elements', {count})}
            </Text>
            {actions}
        </Flex>
    );
}
