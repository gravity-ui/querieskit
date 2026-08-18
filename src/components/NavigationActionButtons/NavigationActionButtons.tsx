import React from 'react';
import {Button, Flex} from '@gravity-ui/uikit';
import type {NavigationAction} from '../../types/navigation';

export type NavigationActionButtonsProps<TArg> = {
    actions?: Array<NavigationAction<TArg>>;
    arg: TArg;
    className?: string;
    buttonClassName?: string;
};

export function NavigationActionButtons<TArg>({
    actions,
    arg,
    className,
    buttonClassName,
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
                    size="s"
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
