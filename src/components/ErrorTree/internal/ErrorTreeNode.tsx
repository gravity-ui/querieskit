import React, {useState} from 'react';
import ChevronDownIcon from '@gravity-ui/icons/svgs/chevron-down.svg';
import ChevronUpIcon from '@gravity-ui/icons/svgs/chevron-up.svg';
import CircleInfoIcon from '@gravity-ui/icons/svgs/circle-info.svg';
import SquareExclamationIcon from '@gravity-ui/icons/svgs/square-exclamation.svg';
import TriangleExclamationIcon from '@gravity-ui/icons/svgs/triangle-exclamation.svg';
import ArrowUpIcon from '@gravity-ui/icons/svgs/arrow-up.svg';
import {Button, Disclosure, Flex, Icon, Text} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';

import type {ErrorTreeItem, ErrorTreeProps} from '../../../types/errorTree';
import {formatAttributes} from '../helpers/formatAttributes';
import i18n from '../i18n';
import {ErrorTreeChildren} from './ErrorTreeChildren';

import './ErrorTreeNode.scss';

const block = cn('qp-error-tree');

const SEVERITY_ICONS = {
    error: TriangleExclamationIcon,
    warning: SquareExclamationIcon,
    info: CircleInfoIcon,
};

type ErrorTreeNodeProps = Pick<
    ErrorTreeProps,
    'defaultExpanded' | 'defaultInfoExpanded' | 'renderAttributes' | 'onPositionClick'
> & {
    className?: string;
    item: ErrorTreeItem;
    level: number;
    defaultNodeExpanded: boolean;
    renderChildren?: (className: string) => React.ReactNode;
    onShowParent?: () => void;
};

export function ErrorTreeNode({
    className,
    item,
    level,
    defaultExpanded = true,
    defaultInfoExpanded = false,
    defaultNodeExpanded,
    renderAttributes,
    onPositionClick,
    renderChildren,
    onShowParent,
}: ErrorTreeNodeProps) {
    const [attributesExpanded, setAttributesExpanded] = useState(false);
    const children = item.children ?? [];
    const hasChildren = children.length > 0;
    const hasAttributes = item.attributes !== undefined;
    const position = item.position;
    const hasCode = item.code !== undefined;
    const formattedAttributes = hasAttributes ? formatAttributes(item.attributes) : null;

    let attributesContent: React.ReactNode = null;

    if (hasAttributes) {
        if (renderAttributes) {
            attributesContent = renderAttributes(item.attributes as Record<string, unknown>, item);
        } else if (formattedAttributes === null) {
            attributesContent = (
                <Text color="secondary">{i18n('context_attributes-unavailable')}</Text>
            );
        } else {
            attributesContent = (
                <pre className={block('attributes-content')}>{formattedAttributes}</pre>
            );
        }
    }

    const line = (
        <Flex alignItems="center" gap={2} className={block('line')}>
            {onShowParent && (
                <Button
                    view="flat-secondary"
                    size="s"
                    title={i18n('action_show-parent')}
                    aria-label={i18n('action_show-parent')}
                    className={block('show-parent')}
                    onClick={onShowParent}
                >
                    <Icon data={ArrowUpIcon} size={16} />
                </Button>
            )}
            <Icon
                data={SEVERITY_ICONS[item.severity]}
                size={16}
                className={block('severity-icon', {[item.severity]: true})}
            />
            {hasAttributes && (
                <Button
                    view="flat-secondary"
                    size="s"
                    className={block('attributes-button')}
                    onClick={() => setAttributesExpanded((expanded) => !expanded)}
                >
                    {i18n('field_attributes')}
                    <Icon data={attributesExpanded ? ChevronUpIcon : ChevronDownIcon} size={16} />
                </Button>
            )}
            {position && (
                <span className={block('position')}>{`${position.row}:${position.column}`}</span>
            )}
            {position && onPositionClick ? (
                <Button
                    view="flat-secondary"
                    size="s"
                    className={block('message-button')}
                    title={item.message}
                    onClick={() => onPositionClick(item, position)}
                >
                    {item.message}
                </Button>
            ) : (
                <span className={block('message')} title={item.message}>
                    {item.message}
                </span>
            )}
            {hasCode && (
                <span className={block('code')}>{`${i18n('field_code')}: ${item.code}`}</span>
            )}
        </Flex>
    );

    const details = (
        <>
            {attributesExpanded && <div className={block('attributes')}>{attributesContent}</div>}
            {hasChildren && (
                <>
                    {renderChildren ? (
                        renderChildren(block('children'))
                    ) : (
                        <ErrorTreeChildren
                            className={block('children')}
                            items={children}
                            level={level + 1}
                            defaultExpanded={defaultExpanded}
                            defaultInfoExpanded={defaultInfoExpanded}
                            renderAttributes={renderAttributes}
                            onPositionClick={onPositionClick}
                        />
                    )}
                </>
            )}
        </>
    );

    if (!hasChildren) {
        return (
            <div className={block('node', className)}>
                <Flex alignItems="center" gap={1} className={block('summary')}>
                    <span className={block('expand-placeholder')} />
                    {line}
                </Flex>
                {attributesExpanded && (
                    <div className={block('attributes')}>{attributesContent}</div>
                )}
            </div>
        );
    }

    return (
        <Disclosure defaultExpanded={defaultNodeExpanded} className={block('node', className)}>
            <Disclosure.Summary>
                {(_props, defaultButton) => (
                    <Flex alignItems="center" gap={1} className={block('summary')}>
                        <span className={block('expand-button')}>{defaultButton}</span>
                        {line}
                    </Flex>
                )}
            </Disclosure.Summary>
            <Disclosure.Details>{details}</Disclosure.Details>
        </Disclosure>
    );
}
