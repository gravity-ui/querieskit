import React from 'react';
import {
    type HistoryFilterConfig as RootFilterConfig,
    createHistoryFilter as createFromRoot,
} from '../../src';
import {HistoryFilter, createHistoryFilter} from '../../src/components/HistoryFilter';
import type {
    CustomHistoryFilterOptions,
    HistoryFilterConfig,
    HistoryFilterProps,
} from '../../src/types/historyFilter';
import type {QueryListFilterConfig} from '../../src/types/queryList';
import type {QueriesHistoryProps} from '../../src/types/queriesHistory';
import type {QueriesSidebarProps} from '../../src/types/queriesSidebar';

interface Values {
    owner: string;
    limit: number;
}

export interface ExtendedLegacyConfig extends QueryListFilterConfig {
    consumerOption?: boolean;
}
export interface ExtendedLegacyProps extends HistoryFilterProps {
    consumerOption?: boolean;
}
export const legacyFields: QueryListFilterConfig['fields'] = [{id: 'mine', type: 'switch'}];
export const legacy = <HistoryFilter fields={legacyFields} onApply={(values) => values.mine} />;

const initialValues: Values = {owner: '', limit: 10};
export const custom = createHistoryFilter({
    initialValues,
    renderFields: ({value, onChange}) => {
        value.limit.toFixed();
        value.owner.toUpperCase();
        // @ts-expect-error A custom field must preserve the form's data contract.
        onChange({owner: '', limit: '10'});
        return <span>{value.owner}</span>;
    },
    onApply: (value) => value.limit.toFixed(),
});
export const customElement = <HistoryFilter {...custom} />;
export const rootConfig: RootFilterConfig = createFromRoot({
    initialValues,
    renderFields: ({value}) => <span>{value.limit.toFixed()}</span>,
});
export const historyFilter: QueriesHistoryProps['filter'] = custom;
export const sidebar: QueriesSidebarProps = {
    tabs: [
        {
            id: 'history',
            type: 'history',
            props: {items: [], search: {onUpdate: () => {}}, filter: custom},
        },
    ],
};
// @ts-expect-error Fields from SimpleForm cannot be combined with a custom form adapter.
export const mixed: HistoryFilterConfig = {...custom, fields: legacyFields};

export const invalidOptions: CustomHistoryFilterOptions<Values> = {
    initialValues,
    renderFields: () => null,
    // @ts-expect-error onApply receives the same typed data as renderFields.
    onApply: (value: {limit: string}) => value.limit,
};
