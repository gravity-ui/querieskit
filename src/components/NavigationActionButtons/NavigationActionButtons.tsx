import {Button, Flex} from '@gravity-ui/uikit';
import React from 'react';
import type {NavigationActionButtonsProps} from '../../types/navigationActionButtonsProps';
export type {NavigationActionButtonsProps} from '../../types/navigationActionButtonsProps';

export function NavigationActionButtons<TArg>({
    actions,
    arg,
    className,
    buttonClassName,
    size = 's',
}: NavigationActionButtonsProps<TArg>) {
    const visibleActions = actions?.filter((action) => !action.hidden) ?? [];

    if (visibleActions.length === 0) {
        return null;
    }

    return (
        <Flex gap={1} shrink={0} className={className}>
            {visibleActions.map((action) => (
                <Button
                    key={action.id}
                    view="flat"
                    size={size}
                    disabled={action.disabled}
                    title={action.title}
                    aria-label={action.title}
                    qa={action.qa}
                    className={buttonClassName}
                    onClick={(e) => {
                        e.stopPropagation();
                        action.onClick(arg);
                    }}
                >
                    {action.content}
                </Button>
            ))}
        </Flex>
    );
}
