import {DropdownMenu} from '@gravity-ui/uikit';
import type {DropdownMenuItem} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';
import React, {useCallback, useEffect, useState} from 'react';
import type {NavigationAction} from '../../types/navigation';
import type {NavigationActionsMenuProps} from '../../types/navigationActionsMenuProps';
import i18n from './i18n';

export type {
    NavigationActionGroup,
    NavigationActionsMenuProps,
} from '../../types/navigationActionsMenuProps';

const block = cn('qp-navigation-actions-menu');

export function NavigationActionsMenu<TArg>({
    arg,
    actions,
    groups,
    disabled,
    size = 's',
    open,
    onOpenToggle,
    renderSwitcher,
    className,
}: NavigationActionsMenuProps<TArg>) {
    const [internalOpen, setInternalOpen] = useState(false);
    const isOpen = open ?? internalOpen;
    const toItems = (entries: Array<NavigationAction<TArg>> = []): DropdownMenuItem<TArg>[] =>
        entries
            .filter((action) => !action.hidden)
            .map((action) => ({
                text: action.title,
                iconStart: action.content,
                disabled: disabled || action.disabled,
                qa: action.qa,
                action: (event) => {
                    event.stopPropagation();
                    action.onClick(arg);
                },
            }));

    const items: DropdownMenuItem<TArg>[][] = [];
    const ungroupedItems = toItems(actions);
    if (ungroupedItems.length > 0) {
        items.push(ungroupedItems);
    }
    for (const group of groups ?? []) {
        const groupItems = toItems(group.actions);
        if (groupItems.length === 0) {
            continue;
        }
        if (group.title) {
            groupItems.unshift({
                text: group.title,
                disabled: true,
                action: (event) => event.stopPropagation(),
            });
        }
        items.push(groupItems);
    }

    const canOpen = items.length > 0 && !disabled;
    // UIKit's controlled menu can pass a state updater rather than a boolean.
    const handleOpenToggle = useCallback(
        (value: React.SetStateAction<boolean>) => {
            const nextOpen = canOpen && (typeof value === 'function' ? value(isOpen) : value);
            if (open === undefined) {
                setInternalOpen(nextOpen);
            }
            onOpenToggle?.(nextOpen);
        },
        [canOpen, isOpen, onOpenToggle, open],
    );

    useEffect(() => {
        if (isOpen && !canOpen) {
            handleOpenToggle(false);
        }
    }, [canOpen, handleOpenToggle, isOpen]);

    if (items.length === 0) {
        return null;
    }

    return (
        <DropdownMenu
            items={items}
            size={size}
            disabled={disabled}
            open={isOpen && canOpen}
            onOpenToggle={handleOpenToggle}
            renderSwitcher={renderSwitcher}
            switcherWrapperClassName={block(null, className)}
            defaultSwitcherProps={{'aria-label': i18n('action_more')}}
            onSwitcherClick={(event) => event.stopPropagation()}
        />
    );
}
