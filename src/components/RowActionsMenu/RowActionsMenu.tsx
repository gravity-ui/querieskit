import EllipsisIcon from '@gravity-ui/icons/svgs/ellipsis.svg';
import {Button, DropdownMenu, DropdownMenuItem, Icon} from '@gravity-ui/uikit';
import React, {MouseEvent, useMemo} from 'react';
import {QueryListRow} from '../../types/queryList';
import type {RowActionsMenuProps} from '../../types/rowActionsMenuProps';
export type {RowActionsMenuProps} from '../../types/rowActionsMenuProps';

export const RowActionsMenu = <T extends QueryListRow>({item, actions}: RowActionsMenuProps<T>) => {
    const items = useMemo(() => {
        return actions?.map<DropdownMenuItem>(({icon, text, theme, hidden, disabled, onClick}) => {
            return {
                text,
                theme,
                hidden,
                disabled,
                iconStart: icon,
                action: () => {
                    onClick(item);
                },
            };
        });
    }, [actions, item]);

    if (!actions?.length) return null;

    const handleClick = (event: MouseEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
    };

    return (
        <div onClick={handleClick}>
            <DropdownMenu
                size="s"
                renderSwitcher={(props) => (
                    <Button {...props} size="xs">
                        <Icon data={EllipsisIcon} size={12} />
                    </Button>
                )}
                items={items}
            />
        </div>
    );
};
