import {DropdownMenu, Flex, Icon, Text} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';
import React from 'react';
import {getDefaultNavigationIcon} from '../../helpers/getDefaultNavigationIcon';
import type {NavigationItem} from '../../types/navigation';
import type {NavigationItemRowProps} from '../../types/navigationItemRowProps';
import {NavigationActionButtons} from '../NavigationActionButtons';
import i18n from './i18n';
import './NavigationItemRow.scss';
export type {NavigationItemRowProps} from '../../types/navigationItemRowProps';

const block = cn('qp-navigation-item-row');

export const NavigationItemRow = <T extends NavigationItem = NavigationItem>({
    item,
    description,
    indicators,
    actions,
    menuActions,
    className,
}: NavigationItemRowProps<T>) => {
    const visibleMenuActions = menuActions?.filter((action) => !action.hidden) ?? [];
    const visibleActions = actions?.filter((action) => !action.hidden) ?? [];
    const hasActions = visibleActions.length > 0 || visibleMenuActions.length > 0;

    return (
        <Flex gap={2} alignItems="center" className={block({disabled: item.disabled}, className)}>
            <Flex width={20} height={20} shrink={0} alignItems="center" justifyContent="center">
                {item.icon ?? (
                    <Icon
                        data={getDefaultNavigationIcon(item.kind, item.targetPathBroken)}
                        size={16}
                    />
                )}
            </Flex>
            <Flex direction="column" className={block('text')}>
                <Text
                    className={block('title')}
                    color={item.disabled ? 'secondary' : undefined}
                    ellipsis
                >
                    {item.title}
                </Text>
                {description && (
                    <Text variant="caption-2" color="secondary" ellipsis title={description}>
                        {description}
                    </Text>
                )}
            </Flex>
            {indicators !== null && indicators !== undefined && (
                <Flex shrink={0} gap={1} alignItems="center">
                    {indicators}
                </Flex>
            )}
            {hasActions && (
                <Flex
                    gap={1}
                    shrink={0}
                    alignItems="center"
                    // React events from the portalled menu also bubble through this boundary.
                    onClick={(event) => event.stopPropagation()}
                    onKeyDown={(event) => event.stopPropagation()}
                    onKeyUp={(event) => event.stopPropagation()}
                >
                    <NavigationActionButtons
                        actions={visibleActions.map((action) => ({
                            ...action,
                            disabled: item.disabled || action.disabled,
                        }))}
                        arg={item}
                    />
                    {visibleMenuActions.length > 0 && (
                        <DropdownMenu
                            size="s"
                            disabled={item.disabled}
                            defaultSwitcherProps={{'aria-label': i18n('action_more')}}
                            items={visibleMenuActions.map((action) => ({
                                text: action.title,
                                iconStart: action.content,
                                disabled: item.disabled || action.disabled,
                                qa: action.qa,
                                action: (event) => {
                                    event.stopPropagation();
                                    action.onClick(item);
                                },
                            }))}
                        />
                    )}
                </Flex>
            )}
        </Flex>
    );
};
