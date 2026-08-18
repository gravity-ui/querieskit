import React from 'react';
import type {NavigationDetailConfig, NavigationItem} from '../../../types/navigation';
import {EmptyContent} from '../../../components';

export const createEmptyDetailConfig = (_item: NavigationItem): NavigationDetailConfig => ({
    tabs: [],
    emptyContent: <EmptyContent variant="no-files" />,
});
