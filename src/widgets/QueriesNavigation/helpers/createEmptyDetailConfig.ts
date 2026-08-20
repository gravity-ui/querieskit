import React from 'react';
import type {NavigationDetailConfig, NavigationItem} from '../../../types/navigation';
import {EmptyContent} from '../../../components';

/**
 * Fallback detail config for leaf nodes that have no type-specific view.
 * Renders a single tab with an empty state so a click on a leaf node always
 * produces a visible result instead of a dead click.
 */
export const createEmptyDetailConfig = (_item: NavigationItem): NavigationDetailConfig => ({
    tabs: [
        {
            id: 'empty',
            title: '',
            content: React.createElement(EmptyContent, {variant: 'no-files'}),
        },
    ],
});
