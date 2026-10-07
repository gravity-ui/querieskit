# QueryExecutionPanel

A panel for one query execution. Requires the application's Gravity UI styles and
`ThemeProvider`. Data loading, backend normalization and panel placement belong to
the application.

Use `loading` to display a centered loader, or `error` with `onRetry` to display
the loading error illustration and Refresh action. Loading takes precedence over
error during retries. These states keep the header available and preserve visited
tab contents while marking them inactive. They are independent of query execution
errors displayed by the Info tab. The error illustration requires
`@gravity-ui/illustrations/styles/styles.scss` in the application stylesheet setup.

```tsx
import {QueryExecutionPanel} from '@gravity-ui/querieskit';
import type {QueryExecutionTab} from '@gravity-ui/querieskit';

const tabs: QueryExecutionTab<{name: string}>[] = [
  {
    id: 'result/0',
    type: 'result',
    title: 'Result 1',
    props: {
      columns: [{name: 'name', type: ['DataType', 'Utf8']}],
      rows: [{name: 'Example'}],
    },
  },
  {
    id: 'messages',
    type: 'info',
    props: {root: {id: 'root', severity: 'info', message: 'Completed'}},
  },
  {
    id: 'notes',
    type: 'custom',
    title: 'Notes',
    renderContent: ({active}) => <Notes active={active} />,
  },
];

<QueryExecutionPanel
  key={executionId}
  tabs={tabs}
  preferredActiveTab="result/0"
  execution={{startedAt: formattedStartTime, author: <UserLink />}}
  expanded={expanded}
  onExpandedChange={setExpanded}
  collapsed={collapsed}
  onCollapsedChange={setCollapsed}
/>;
```

## Tabs

Array order is display order. Any number of tabs can share a type, but every tab
must have a unique, non-empty ID. IDs are not reserved. Invalid IDs are skipped,
with a development warning; the first duplicate wins. Remove a configuration to
hide a tab, or set `disabled` to retain its header without allowing selection.

| Type         | Configuration                                              | Default title                 |
| ------------ | ---------------------------------------------------------- | ----------------------------- |
| `result`     | `props: QueryResultsProps<TRow>`                           | Result                        |
| `progress`   | `props: QueryProgressProps`                                | Progress                      |
| `info`       | `props?: ErrorTreeProps`                                   | Computed from the entire tree |
| `statistics` | `props: QueryStatisticsProps`                              | Statistics                    |
| `meta`       | `props: NavigationMetaProps<TMetaItem>`                    | Meta                          |
| `charts`     | `props: DashboardChartsProps` or `renderContent({active})` | Charts                        |
| `custom`     | `title`, `renderContent({active})`                         | Required                      |

Standard types other than Info accept an optional `title: ReactNode`. Info uses
Error > Warning > Info, including collapsed descendants. Without props, it shows
an empty message state. Its ID never changes when its title changes.

Charts accepts `props: DashboardChartsProps` to render the built-in dashboard.
It loads the dashboard on first activation and preserves it afterward. The built-in
chart editor hides while the tab is inactive and restores its draft when the tab
becomes active again. Existing
`renderContent({active})` callbacks remain supported for charts and custom tabs;
choose either `props` or `renderContent` for a charts tab. Custom content receives
`active` so it can pause subscriptions, animations or polling while hidden. Keep
these components mounted when inactive if their local state must survive.

Use the default series editor with `props: {dataSource: {line: lineSeriesMap}}`.
For type-specific column bindings, choose fields mode:

```tsx
const chartTab: QueryExecutionTab = {
  id: 'charts',
  type: 'charts',
  props: {
    editorMode: 'fields',
    chartFieldsEditorProps: {
      chartTypeOptions: [{value: 'line', content: 'Line'}],
      getFieldOptions: ({role}) =>
        role === 'dimension'
          ? [{value: 'time', content: 'Time'}]
          : [
              {value: 'revenue', content: 'Revenue'},
              {value: 'cost', content: 'Cost'},
            ],
      getInitialFormValues: () => ({
        chartType: 'line',
        dimensionAxisType: 'datetime',
        measureItems: [{id: 'first-measure'}],
      }),
      getChartData: buildChartFromColumns,
    },
    chartItems: savedItems,
    onItemsChange: saveItems,
  },
};
```

The application supplies the pure `getChartData(values)` adapter that builds chart
data from selected columns; return `undefined` when no chart can be built. The
editor applies appearance and, for XY charts, dimension-axis settings to that data. Save the complete
items from `onItemsChange`, including each item's `fieldsFormValues` alongside
`chartData`, to restore type-specific bindings and ordered measures or hierarchy levels when editing. Fields mode requires
`chartFieldsEditorProps`; series mode retains `dataSource` and `chartEditorProps`.
The ChartsWithSeries and ChartsWithFields stories demonstrate both direct forms.

Fields mode supports line, area, scatter, bar-x, bar-y, pie, treemap and sankey.
`getFieldOptions({chartType, role})` returns columns appropriate to each role:

| Family                            | Bindings                                                    | Axis settings                           |
| --------------------------------- | ----------------------------------------------------------- | --------------------------------------- |
| Line, area, scatter, bar-x, bar-y | `dimensionFieldId`, ordered `measureItems: [{id, fieldId}]` | `dimensionAxisType`, `xTitle`, `yTitle` |
| Pie                               | `categoryFieldId`, `valueFieldId`                           | None                                    |
| Treemap                           | Ordered `levels: [{id, fieldId}]`, `valueFieldId`           | None                                    |
| Sankey                            | `sourceFieldId`, `targetFieldId`, `valueFieldId`            | None                                    |

For bar-y, the dimension lies on Y and measures on X; other XY types use the
opposite orientation. Treemap level order controls the hierarchy. Each union
variant includes `chartType`, `chartTitle` and `showLegend`; before a chart type is
selected, the form may contain only appearance settings. The adapter receives
`ChartSelectedFormValues`, so branch on `values.chartType` to access the correct
bindings. Switching chart type resets incompatible bindings.

Aggregation is application-specific. The [demo adapter](../DashboardCharts/story/fieldsData.ts)
sums duplicate pie categories and source-target flows, and builds treemap nodes
with collision-safe IDs from ordered paths. These policies are examples rather
than built-in data inference. `getInitialFormValues(chartType)` supplies optional
initial bindings for each Add chart choice.

Panels mount their content on first activation and keep it mounted afterward.
Disabling a visited tab preserves its content; removal unmounts it. IDs and types
should stay stable. Changing a type resets that tab's content. Changing the
panel's React `key` to a new execution ID resets all content and selection state.

## Selection

Without `activeTab`, the panel chooses an available `defaultActiveTab`, then
`preferredActiveTab`, then the first enabled tab. The default is used only at
initialization. Subsequent changes to the available preferred ID are followed
until the first manual selection, including selecting the current tab again.

If the selected tab disappears or becomes disabled, the panel selects the
available preferred tab or the first enabled tab. This fallback does not restore
automatic following after manual selection. An unavailable preferred ID does not
replace a valid current selection.

`onActiveTabChange` reports actual changes after initialization, including automatic
transitions. No callback is emitted for an empty selection. With no enabled tabs,
`emptyContent` is rendered, or the localized default empty state.

With `activeTab`, the parent owns selection. User selection requests are reported
through `onActiveTabChange`; the panel waits for new props. `defaultActiveTab` and
`preferredActiveTab` are ignored. If the external ID is unavailable, the first
enabled tab is displayed temporarily without a callback. Do not switch between
controlled and uncontrolled modes during the lifetime of an instance.

## Header and layout

`execution.startedAt` and `execution.author` are optional React nodes. Format dates
and timezones in the application. The panel localizes its own labels in English
and Russian.

The cross button collapses the panel to its header; it does not remove the panel.
It becomes a double-chevron button that restores the content. Selecting a tab also
reveals its content. Visited tabs retain their state and receive `active: false`
while collapsed. No tab is highlighted while the content is hidden.

Use `collapsed` with `onCollapsedChange` for controlled state, or `defaultCollapsed`
for an initially collapsed panel that manages its own state. The deprecated
`onClose` is only a collapse notification: migrate handlers that unmount the panel
to `onCollapsedChange` instead.

Providing `onExpandedChange` displays the separate fullscreen button, which requests
`!expanded` and reveals collapsed content. Collapsing an expanded panel also requests
`onExpandedChange(false)` to release the fullscreen layout. Change CSS/layout on an existing parent to expand the panel;
do not conditionally move it between different React subtrees. The ApplicationLayout
story demonstrates this without losing tab state. Use `className` for external
positioning and give the container a height for graph/timeline layouts.

## Query Tracker integration

The application constructs `tabs` and `preferredActiveTab` separately. See
[the example adapter](./story/queryTrackerAdapter.tsx) and the QueryTrackerLifecycle
story. Its input is already normalized; no YTsaurus package is required.

For the Query Tracker policy, build the array in this order:

1. Error (`type: 'info'`) when FAILED.
2. One Result per result set when COMPLETED.
3. Progress if a valid single-progress plan has nodes or edges.
4. One Charts tab per available chart configuration when COMPLETED with results.
5. Statistics when COMPLETED with statistics from valid single progress.
6. Meta whenever a query exists.

With no query, pass an empty array. Normalize `isSingleProgress`, result count,
plan/statistics fields and chart feature availability before calling the example
adapter. Prefer the first available ID among error, first result, progress and
meta. The widget has no knowledge of these backend fields or statuses.

## Individual imports

Import QueryResults from `@gravity-ui/querieskit/modules/QueryResults` or the package
root. Import QueryExecutionPanel directly from
`@gravity-ui/querieskit/widgets/QueryExecutionPanel` to avoid unrelated entrypoints.

## Result schema

A `result` tab's existing `props` also configure its Schema view. Set
`props.defaultView: 'schema'` to open it initially. Pass `columns` even when
`rows` is empty; no application adapter or custom `renderSchema` is required.
The standard schema displays expandable types, optional markers and tags, with
indices starting at 1. `displayIndices`, `stripedRows` and `stickyHead` apply to
both Result and Schema. Optional `column.schemaType` provides a neutral type
description without changing Result value formatting or replacing required
`column.type`. See [QueryResults](../../modules/QueryResults/README.md#standard-schema-view)
for the contract and expansion lifecycle. Only supplied columns can be displayed.

The `Widgets/QueryExecutionPanel/Schema` story uses the real Result module and
opens Schema with no result rows, including optional String, Int64 and Float
columns and a nested structure with modifiers.
