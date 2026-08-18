import React, {FC} from 'react';
import {Flex} from '@gravity-ui/uikit';
import {Breadcrumbs} from '../../components/Breadcrumbs';
import {NavigationActionButtons} from '../../components';
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
    return (
        <Flex gap={2} justifyContent="space-between" alignItems="center" className={className}>
            <Breadcrumbs
                location={location}
                onUpdate={onUpdate}
                onLoadSuggestions={onLoadSuggestions}
            />
            <NavigationActionButtons actions={actions} arg={location} />
        </Flex>
    );
};
