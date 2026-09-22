import React, {FC} from 'react';
import {Flex} from '@gravity-ui/uikit';
import {Breadcrumbs} from '../../components/Breadcrumbs';
import {NavigationActionButtons} from '../../components/NavigationActionButtons';
import type {
    GetNavigationBreadcrumbHref,
    NavigationHeaderAction,
    NavigationLocation,
    RenderNavigationHeaderActions,
} from '../../types/navigation';
import type {LoadPathSuggestions} from '../../types/pathEditor';

export type NavigationHeaderProps = {
    location: NavigationLocation;
    actions?: NavigationHeaderAction[];
    renderActions?: RenderNavigationHeaderActions;
    getBreadcrumbHref?: GetNavigationBreadcrumbHref;
    onUpdate: (location: NavigationLocation) => void;
    onLoadSuggestions?: LoadPathSuggestions;
    className?: string;
};

export const NavigationHeader: FC<NavigationHeaderProps> = ({
    location,
    actions,
    renderActions,
    getBreadcrumbHref,
    onUpdate,
    onLoadSuggestions,
    className,
}) => {
    return (
        <Flex gap={2} justifyContent="space-between" alignItems="center" className={className}>
            <Breadcrumbs
                location={location}
                onUpdate={onUpdate}
                getBreadcrumbHref={getBreadcrumbHref}
                onLoadSuggestions={onLoadSuggestions}
            />
            {renderActions ? (
                renderActions({location, actions: actions ?? []})
            ) : (
                <NavigationActionButtons actions={actions} arg={location} />
            )}
        </Flex>
    );
};
