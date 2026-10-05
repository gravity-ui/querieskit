# Navigation preview and result tables

`NavigationPreview` always renders data using `QueryResultsTable`. Its `view`
accepts `QueryResultsTableSettings<Row>`, the same cell and table settings accepted
by `QueryResults`. Search and column selection remain navigation features.
See [standard result cells](../QueryResults/README.md) for formatting, copying,
expansion, incomplete values, and the preview lifecycle.

Search uses the formatted text of visible standard cells, including wire
envelopes and nested collections, with the table and cell formatter settings.
Clipboard text overrides do not affect search. Custom-rendered columns retain
search by their raw string, number, or boolean values. The exported
`filterPreviewRows` helper accepts typed columns and optional cell settings as
its fourth argument; existing calls with string column names remain supported.

## API migration

This change requires consumer migration; there is no legacy table fallback.

- Replace string columns with `QueryResultColumn<Row>` objects containing `name`
  and the original YQL `type`. Types are required and are never inferred from data.
- Replace `view.tableColumns` with `data.columns`. Move `view.extraColumns` into
  that same array, including a YQL `type` for every column.
- Put custom cell content in `column.render`. This overrides standard cell
  formatting and actions only for that column; adjacent columns retain them.
- Remove imports and calls to `buildPreviewColumns`. Pass the typed column array
  directly to `NavigationPreview` instead of constructing DataTable columns.
- Replace `NavigationPreviewFormatterConfig` with `NavigationPreviewViewConfig<Row>`,
  which exposes the complete shared table settings.
- `NavigationPreviewRow` is now `Record<string, unknown>`, allowing wire envelopes
  such as `{val: 'partial', inc: true}`. `NavigationViewRow` retains `ReactNode`
  values as a separate contract. When explicitly supplying factory generics,
  its fifth generic now specifies the `NavigationView` row independently.

For example, replace `columns: ['id', 'value']` with:

```tsx
const columns: QueryResultColumn<Row>[] = [
  {name: 'id', type: ['DataType', 'Utf8']},
  {name: 'value', type: ['DataType', 'Utf8']},
];
```

Row indices remain off by default in navigation and on in results. Set
`displayIndices` explicitly to use the same presentation. Other shared options
include `rowKey`, `stripedRows`, `stickyHead`, `formatterSettings`,
`maxVisibleLines`, `collapseAfterLines`, `maxInlineTextLength`, `getCellOptions`,
and `onCellPreview`.

## Direct and factory usage

```tsx
import {NavigationPreview, createTableDetailConfig} from '@gravity-ui/querieskit';
import type {QueryResultColumn, QueryResultsTableSettings} from '@gravity-ui/querieskit';

type Row = {id: string; value: unknown};

const columns: QueryResultColumn<Row>[] = [
  {name: 'id', type: ['DataType', 'Utf8']},
  {name: 'value', type: ['DataType', 'Utf8']},
];
const rows: Row[] = [{id: 'example', value: {val: 'partial text', inc: true}}];

const view: QueryResultsTableSettings<Row> = {
  rowKey: (row) => row.id,
  displayIndices: true,
  formatterSettings: {treatValAsData: true},
  maxVisibleLines: 5,
  collapseAfterLines: 8,
  maxInlineTextLength: 10000,
  // The application owns this handler, requests, and immutable row updates.
  onCellPreview: handlePreview,
};

<NavigationPreview<Row> data={{columns, rows, loaded: true}} view={view} />;

// The same settings are available through the standard detail factory.
const detailConfig = createTableDetailConfig({
  resolvePreview: () => ({columns, rows, loaded: true}),
  resolvePreviewView: () => view,
});
```

Both resolver callbacks receive the selected navigation item, so settings and
preview callbacks can depend on its identity. Preserve stable row keys and update
rows immutably after loading the full value. A rejected preview Promise displays
a local error and permits retry; opening a dialog remains application-owned.

## Storybook verification

`Modules/NavigationPreview` includes **Custom Columns**, demonstrating standard
cells next to custom rendering, and **Inline Preview And Retry**, demonstrating
partial wire objects, loading, retry, row replacement, and local expansion.
Verify column selection and search alongside these actions. Check that expanded
rows and sticky headers remain aligned when scrolling in light and dark themes.
