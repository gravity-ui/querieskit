import React from 'react';
import {createTableDetailConfig} from '../../src/modules/QueriesNavigation';
import type {NavigationItem} from '../../src/types/navigation';
import type {
    CreateTableDetailConfigOptions,
    TableDetailTab,
} from '../../src';

type Table = NavigationItem & {database: string};
export const tabs: readonly TableDetailTab[] = [
    'meta',
    {id: 'schema', content: <span>Custom schema</span>},
    {id: 'preview', renderContent: ({search}) => search},
    {id: 'application', title: 'Application', content: 'Custom'},
];
export const options: CreateTableDetailConfigOptions<Table> = {
    tabs: (item) => [...tabs, {id: 'database', title: item.database, content: item.path}],
};
export const resolve = createTableDetailConfig(options);
// @ts-expect-error Unknown standard tab names must be supplied as full custom descriptors.
export const invalidBuiltin: TableDetailTab = 'metadata';
// @ts-expect-error A custom tab needs a title.
export const invalidCustom: TableDetailTab = {id: 'application', content: 'Custom'};
