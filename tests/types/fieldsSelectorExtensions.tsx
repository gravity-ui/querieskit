import React from 'react';
import {FieldsSearchToolbar, FieldsSelector, NavigationPreview, NavigationSchema} from '../../src';
import type {FieldsSelectorProps, QueryListRow, QueryListVisibleFieldsConfig} from '../../src';

const selector: FieldsSelectorProps<'name' | 'state'> = {
    fields: [{id: 'name', title: <b>Name</b>, searchText: 'Name'}],
    value: ['name'],
    onChange: (_value: Array<'name' | 'state'>) => {},
    applyMode: 'explicit',
    searchable: true,
    showSelectedCount: true,
    buttonContent: 'Columns',
};
<FieldsSelector {...selector} />;
<FieldsSearchToolbar
    fields={selector.fields}
    visibleFields={selector.value}
    onVisibleFieldsChange={selector.onChange}
    fieldsSelectorProps={{applyMode: 'explicit', searchable: true}}
/>;
<NavigationSchema
    data={{columns: [], loaded: true}}
    fieldsSelectorProps={{applyMode: 'explicit'}}
/>;
<NavigationPreview
    data={{columns: [], rows: [], loaded: true}}
    fieldsSelectorProps={{searchable: true}}
/>;
export const list: QueryListVisibleFieldsConfig<QueryListRow> = {
    fields: [{id: 'title', title: 'Title'}],
    value: ['title'],
    onChange: () => {},
    applyMode: 'explicit',
    searchable: true,
};
// @ts-expect-error selection keys remain constrained
<FieldsSelector<'name'> fields={[]} value={['other']} onChange={() => {}} />;
