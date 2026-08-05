import React, {MouseEvent, useMemo} from 'react';
import {Button, DropdownMenu, DropdownMenuItem, Icon} from '@gravity-ui/uikit';
import EllipsisIcon from '@gravity-ui/icons/svgs/ellipsis.svg';
import {QueryHistoryRow, QueryHistoryRowAction} from '../../types/history';

type Props<T extends QueryHistoryRow> = {
    item: T;
    actions?: QueryHistoryRowAction<T>[];
};

export const HistoryRowMenu = <T extends QueryHistoryRow>({item, actions}: Props<T>) => {
    const items = useMemo(() => {
        return actions?.map<DropdownMenuItem>(({icon, text, hidden, disabled, onClick}) => {
            return {
                text,
                hidden,
                disabled,
                iconStart: icon,
                action: () => {
                    onClick(item);
                },
            };
        });
    }, [actions, item]);

    if (!actions || !actions.length) return null;

    const handleClick = (e: MouseEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    return (
        <div onClick={handleClick}>
            <DropdownMenu
                size="s"
                renderSwitcher={(props) => {
                    return (
                        <Button {...props} size="xs">
                            <Icon data={EllipsisIcon} size={12} />
                        </Button>
                    );
                }}
                items={items}
            />
        </div>
    );
};
