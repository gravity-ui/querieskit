import {Flex} from '@gravity-ui/uikit';
import React, {FC} from 'react';
import {Breadcrumbs} from '../../components/Breadcrumbs';
import {NavigationActionButtons} from '../../components/NavigationActionButtons';
import type {NavigationHeaderProps} from '../../types/navigationHeaderProps';
export type {NavigationHeaderProps} from '../../types/navigationHeaderProps';

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
                <NavigationActionButtons size="m" actions={actions} arg={location} />
            )}
        </Flex>
    );
};
