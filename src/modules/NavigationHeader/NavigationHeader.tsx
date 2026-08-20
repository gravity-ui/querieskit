import React, {FC} from 'react';
import {Button, Flex} from '@gravity-ui/uikit';
import {Breadcrumbs} from '../../components/Breadcrumbs';
import {NavigationHeaderAction, NavigationLocation} from '../../types/navigation';
import type {LoadPathSuggestions} from '../../types/pathEditor';

export type NavigationHeaderProps = {
    location: NavigationLocation;
    actions?: NavigationHeaderAction[];
    onUpdate: (location: NavigationLocation) => void;
    onLoadSuggestions?: LoadPathSuggestions;
    className?: string;
};

export const NavigationHeader: FC<NavigationHeaderProps> = ({
    location,
    actions,
    onUpdate,
    onLoadSuggestions,
    className,
}) => {
    const visibleActions = actions?.filter((action) => !action.hidden) ?? [];

    return (
        <Flex gap={2} justifyContent="space-between" alignItems="center" className={className}>
            <Breadcrumbs
                location={location}
                onUpdate={onUpdate}
                onLoadSuggestions={onLoadSuggestions}
            />
            {visibleActions.length > 0 && (
                <Flex gap={1} shrink={0}>
                    {visibleActions.map((action) => (
                        <Button
                            key={action.id}
                            view="flat"
                            size="s"
                            disabled={action.disabled}
                            title={action.title}
                            aria-label={action.title}
                            onClick={() => action.onClick(location)}
                        >
                            {action.content}
                        </Button>
                    ))}
                </Flex>
            )}
        </Flex>
    );
};
