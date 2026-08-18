import React from 'react';
import {Flex} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';
import {NavigationItem, RenderNavigationItem} from '../../../types/navigation';
import {NavigationItemRow} from '../../../components';

const block = cn('qp-navigation-items-list');

export type NavigationItemsListEmptyStateProps<T extends NavigationItem = NavigationItem> = {
    parentRow?: T;
    emptyContent?: React.ReactNode;
    renderRowItem?: RenderNavigationItem<T>;
    onItemClick?: (item: T) => void;
};

export const NavigationItemsListEmptyState = <T extends NavigationItem = NavigationItem>({
    parentRow,
    emptyContent,
    renderRowItem,
    onItemClick,
}: NavigationItemsListEmptyStateProps<T>) => {
    return (
        <div className={block('empty')}>
            {parentRow && (
                <Flex
                    className={block('parent-row')}
                    alignItems="center"
                    onClick={() => {
                        if (!parentRow.disabled) {
                            onItemClick?.(parentRow);
                        }
                    }}
                >
                    {renderRowItem?.({
                        item: parentRow,
                        index: 0,
                        isActive: false,
                        isParentRow: true,
                    }) ?? <NavigationItemRow item={parentRow} />}
                </Flex>
            )}
            <div className={block('empty-content')}>{emptyContent}</div>
        </div>
    );
};
