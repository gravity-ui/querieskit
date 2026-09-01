import React, {useCallback, useMemo, useState} from 'react';
import {Button, Disclosure, Flex, Text} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';

import type {ErrorTreeItem, ErrorTreeProps} from '../../../types/errorTree';
import {getIntermediateChain} from '../helpers/getIntermediateChain';
import i18n from '../i18n';
import {ErrorTreeNode} from './ErrorTreeNode';

import './IntermediateMessages.scss';

const block = cn('qp-error-tree');

type IntermediateMessagesProps = Pick<
    ErrorTreeProps,
    'defaultExpanded' | 'defaultInfoExpanded' | 'renderAttributes' | 'onPositionClick'
> & {
    item: ErrorTreeItem;
    level: number;
};

export function IntermediateMessages({
    item,
    level,
    defaultExpanded = true,
    defaultInfoExpanded = false,
    renderAttributes,
    onPositionClick,
}: IntermediateMessagesProps) {
    const {hiddenItems, terminalItem} = useMemo(() => getIntermediateChain(item), [item]);
    const nodeDefaultExpanded =
        terminalItem.severity === 'info' ? defaultInfoExpanded : defaultExpanded;
    const [revealedParents, setRevealedParents] = useState(0);
    const [expanded, setExpanded] = useState(nodeDefaultExpanded);
    const [showAllVersion, setShowAllVersion] = useState(0);
    const isCompact = hiddenItems.length > 1;

    const renderChain = useCallback(
        (itemIndex: number, className?: string): React.ReactNode => {
            const currentItem =
                itemIndex < hiddenItems.length ? hiddenItems[itemIndex] : terminalItem;
            const hasHiddenParent = itemIndex > 0;
            const hasNextItem = itemIndex < hiddenItems.length;
            const currentDefaultExpanded =
                currentItem.severity === 'info' ? defaultInfoExpanded : defaultExpanded;

            return (
                <ErrorTreeNode
                    key={`${currentItem.id}-${showAllVersion}`}
                    className={className}
                    item={currentItem}
                    level={level + itemIndex}
                    defaultNodeExpanded={showAllVersion > 0 || currentDefaultExpanded}
                    defaultExpanded={defaultExpanded}
                    defaultInfoExpanded={defaultInfoExpanded}
                    renderAttributes={renderAttributes}
                    onPositionClick={onPositionClick}
                    onShowParent={
                        hasHiddenParent ? () => setRevealedParents((value) => value + 1) : undefined
                    }
                    renderChildren={
                        hasNextItem
                            ? (childClassName) => renderChain(itemIndex + 1, childClassName)
                            : undefined
                    }
                />
            );
        },
        [
            defaultExpanded,
            defaultInfoExpanded,
            hiddenItems,
            level,
            onPositionClick,
            renderAttributes,
            showAllVersion,
            terminalItem,
        ],
    );

    if (!isCompact) {
        return (
            <ErrorTreeNode
                item={item}
                level={level}
                defaultNodeExpanded={
                    item.severity === 'info' ? defaultInfoExpanded : defaultExpanded
                }
                defaultExpanded={defaultExpanded}
                defaultInfoExpanded={defaultInfoExpanded}
                renderAttributes={renderAttributes}
                onPositionClick={onPositionClick}
            />
        );
    }

    const firstVisibleItemIndex = Math.max(hiddenItems.length - revealedParents, 0);

    return (
        <Disclosure expanded={expanded} onUpdate={setExpanded} className={block('intermediate')}>
            <Disclosure.Summary>
                {(_props, defaultButton) => (
                    <Flex alignItems="center" gap={2} className={block('intermediate-summary')}>
                        {defaultButton}
                        <Text color="secondary">
                            {i18n('context_intermediate-messages', {count: hiddenItems.length})}
                        </Text>
                        <Button
                            view="flat-secondary"
                            size="s"
                            onClick={() => {
                                setExpanded(true);
                                setRevealedParents(hiddenItems.length);
                                setShowAllVersion((version) => version + 1);
                            }}
                        >
                            {i18n('action_show-all')}
                        </Button>
                    </Flex>
                )}
            </Disclosure.Summary>
            <Disclosure.Details>
                {renderChain(firstVisibleItemIndex, block('intermediate-details'))}
            </Disclosure.Details>
        </Disclosure>
    );
}
