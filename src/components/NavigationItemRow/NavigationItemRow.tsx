import {Flex, Icon, Text} from '@gravity-ui/uikit';
import StarFillIcon from '@gravity-ui/icons/svgs/star-fill.svg';
import cn from 'bem-cn-lite';
import React, {useEffect, useState} from 'react';
import {getDefaultNavigationIcon} from '../../helpers/getDefaultNavigationIcon';
import type {NavigationItem} from '../../types/navigation';
import type {NavigationItemRowProps} from '../../types/navigationItemRowProps';
import {NavigationActionButtons} from '../NavigationActionButtons';
import {NavigationActionsMenu} from '../NavigationActionsMenu';
import i18n from './i18n';
import './NavigationItemRow.scss';
export type {NavigationItemRowProps} from '../../types/navigationItemRowProps';

const block = cn('qp-navigation-item-row');

export const NavigationItemRow = <T extends NavigationItem = NavigationItem>({
    item,
    isFavorite,
    description,
    indicators,
    actions,
    menuActions,
    menuActionGroups,
    actionsVisibility = 'hover',
    actionsMenuOpen = false,
    renderMenuTrigger,
    className,
}: NavigationItemRowProps<T>) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const hasCustomMenu = Boolean(renderMenuTrigger);
    const visibleMenuActions = menuActions?.filter((action) => !action.hidden) ?? [];
    const hasMenuGroups = menuActionGroups?.some((group) =>
        group.actions.some((action) => !action.hidden),
    );
    const visibleActions = actions?.filter((action) => !action.hidden) ?? [];
    const hasStandardMenu = visibleMenuActions.length > 0 || Boolean(hasMenuGroups);
    useEffect(() => setMenuOpen(false), [item.path, item.disabled, hasCustomMenu, hasStandardMenu]);
    const hasActions = visibleActions.length > 0 || hasCustomMenu || hasStandardMenu;

    return (
        <Flex gap={2} alignItems="center" className={block({disabled: item.disabled}, className)}>
            <Flex
                width={20}
                height={20}
                shrink={0}
                alignItems="center"
                justifyContent="center"
                className={block('icon')}
            >
                {item.icon ?? (
                    <Icon
                        data={getDefaultNavigationIcon(item.kind, item.targetPathBroken)}
                        size={16}
                    />
                )}
                {isFavorite && (
                    <span
                        className={block('favorite')}
                        role="img"
                        aria-label={i18n('context_favorite')}
                        title={i18n('context_favorite')}
                    >
                        <Icon data={StarFillIcon} size={10} />
                    </span>
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
                    className={block('actions', {
                        hover: actionsVisibility === 'hover',
                        open: hasCustomMenu ? actionsMenuOpen : menuOpen,
                    })}
                    // React events from the portalled menu also bubble through this boundary.
                    onClick={(event) => event.stopPropagation()}
                    onDoubleClick={(event) => event.stopPropagation()}
                    onMouseDown={(event) => event.stopPropagation()}
                    onMouseUp={(event) => event.stopPropagation()}
                    onPointerDown={(event) => event.stopPropagation()}
                    onPointerUp={(event) => event.stopPropagation()}
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
                    {renderMenuTrigger ? (
                        renderMenuTrigger({item, disabled: Boolean(item.disabled)})
                    ) : (
                        <NavigationActionsMenu
                            key={item.path}
                            size="s"
                            arg={item}
                            disabled={item.disabled}
                            actions={visibleMenuActions}
                            groups={menuActionGroups}
                            open={menuOpen}
                            onOpenToggle={setMenuOpen}
                        />
                    )}
                </Flex>
            )}
        </Flex>
    );
};
