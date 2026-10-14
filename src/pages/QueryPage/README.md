# QueryPage

A shared `QueriesSidebar` beside a strip of `QueryTabs`. Each query tab owns its
own `QueryEditor` and `QueryExecutionPanel`, including settings and results layout.
The tab strip stays visible above the workspace even when results are expanded.

```tsx
import {QueryPage} from '@gravity-ui/querieskit/pages/QueryPage';

<div style={{height: 800}}>
  <QueryPage
    sidebarProps={sidebarProps}
    tabsProps={{
      activeTab: activeQueryId,
      onActiveTabChange: setActiveQueryId,
      onAddTab: addQuery,
      onCloseTab: closeQuery,
      items: queries.map((query) => ({
        id: query.id,
        type: 'query',
        title: query.title,
        status: query.status,
        editorProps: query.editorProps,
        executionPanelProps: query.executionPanelProps,
      })),
    }}
  />
</div>;
```

`QueryPage`, `QueryPageProps`, and `QueryPageTab` are available from the package root
and the page entrypoint. The parent must provide a bounded height. The page scrolls
when minimum sizes do not fit; it does not automatically switch to a mobile layout.

## Contracts and tab lifecycle

| Prop | Contract |
| --- | --- |
| `sidebarProps` | Full `QueriesSidebarProps`, shared by all query tabs |
| `tabsProps` | Full `QueryTabsProps`, with `items` replaced by `QueryPageTab[]` |
| `tabsProps.items[].editorProps` | Full `QueryEditorProps`, including settings, parameters, extensions and actions |
| `tabsProps.items[].executionPanelProps` | Full `QueryExecutionPanelProps`, including typed results and metadata |
| `className` | Optional class on the page root for application layout |

Query items combine their tab metadata with editor and execution panel props.
Comparison items use `comparisonProps: QueryComparisonProps` instead. Generics preserve custom sidebar data, editor settings, results rows, and
metadata types. Mutually exclusive editor options remain exclusive: for example,
provide either `settings` or `settingsProps`. Widget classes and callbacks remain available.
A `comparison` item renders `QueryComparison` across the workspace, without an
editor or execution panel. Its full props contract supports version selection,
split/unified mode, editable blocks, and save/reset/create actions.

The first visit mounts a workspace. Switching tabs hides the previous workspace
without unmounting it, retaining its Monaco instance, undo history, internal forms,
selected result tab, and uncontrolled results layout. Removing an item unmounts its
workspace. Keep IDs stable and unique; adding a previously removed ID creates a fresh
workspace. An absent or invalid `activeTab` falls back to the first item without
emitting a selection callback. An empty list leaves the shared sidebar and tab strip
available, with no workspace.

The application owns the list, selection, creation, close confirmation, and removal.
Bind callbacks to the item's stable ID, not the currently selected ID, because an
inactive workspace stays mounted and can still receive asynchronous updates.
The application also owns controlled widget state and query data: provide distinct
values and callbacks per item to keep drafts, settings and execution data independent.

See the [sidebar guide](../../widgets/QueriesSidebar/README.md),
[editor guide](../../widgets/QueryEditor/README.md), and
[execution panel guide](../../widgets/QueryExecutionPanel/README.md) for the widget APIs.

## Layout state

Omit a controlled prop to let the page maintain that state. Its `default…` prop
chooses the initial value. Controlled state must be updated in its change callback.

| Location | State | Controlled prop | Initial uncontrolled prop | Callback |
| --- | --- | --- | --- | --- |
| Page | Sidebar width | `sidebarWidth` | `defaultSidebarWidth` (300 px) | `onSidebarWidthChange` |
| Page | Hidden sidebar | `sidebarCollapsed` | `defaultSidebarCollapsed` (`false`) | `onSidebarCollapsedChange` |
| Each tab item | Results height | `executionPanelHeight` | `defaultExecutionPanelHeight` (300 px) | `onExecutionPanelHeightChange` |

Dimensions are numbers in pixels. Minimums are 240 px for the sidebar, 120 px for
open results, and 160 px for the editor. Drag separators or focus them and use arrow
keys to resize by 16 px (64 px with Shift); Home and End select minimum and maximum.
The sidebar toggle is in the right-hand actions of the query tab strip, alongside
`tabsProps.actions`. Hiding removes the entire sidebar and its separator from the
layout while preserving the mounted sidebar and its preferred width. Default dimensions are not design
measurements, and layout state is not automatically persisted in localStorage.

Use each item's `executionPanelProps.expanded` / `onExpandedChange` and
`collapsed` / `onCollapsedChange` to control its results layout. Omitted flags are
managed independently per workspace, while supplied callbacks still receive changes.
`defaultCollapsed` supplies initial collapse state; results start unexpanded.
Expanded results fill the workspace **below the query tab strip**. The shared sidebar
and query tabs remain accessible. Collapsed results show only their header;
collapse takes precedence when both flags are true.

Resizing, hiding the sidebar, and expanding or collapsing results do not unmount
widgets. Nested widget policies still apply: for example, `sidebarProps.keepMounted`
preserves visited sidebar tabs. Removing the page unmounts all workspaces.

## Migration from the single-workspace API

Move top-level `editorProps` and `executionPanelProps` into each `tabsProps.items`
entry. Move `executionPanelHeight`, `defaultExecutionPanelHeight`, and
`onExecutionPanelHeightChange` into the corresponding item as well. Replace
`editorHeader={<QueryTabs {...tabsProps} />}` with the page's built-in `tabsProps`.
For a single-query page, supply one item and set `hideCloseOnLastTab` as appropriate.
Sidebar props and layout controls remain at page level.

Data loading, execution, saving, routing, validation and persistence belong to the
application. Global navigation, footer content and mobile layout remain outside
this page's contract.

## History actions and comparison

History sidebar tabs receive Rename, Select for Compare, and Delete menu actions
by default. Supply `historyActions.onRename(item, title, historyTabId)`,
`onDelete(item, historyTabId)`, and `onCompare(original, modified, historyTabId)`
to enable them. The page manages transient rename and pair-selection UI; the
application updates history data and owns confirmation, persistence, data loading,
and comparison tab creation. Missing callbacks disable their actions.

```tsx
historyActions={{
  onRename: (item, title) => renameQuery(item.id, title),
  onDelete: (item) => deleteQuery(item.id),
  onCompare: (original, modified) => {
    const id = createTabId();
    setTabs((tabs) => [...tabs, {
      id,
      type: 'comparison',
      leftTitle: original.title,
      rightTitle: modified.title,
      comparisonProps: {
        items: buildComparisonItems(original, modified),
      },
    }]);
    setActiveTab(id);
  },
}}
```

`buildComparisonItems` belongs to the application: it can include query text,
configuration, and attachments, fetching missing contents as needed. Pass the
complete `comparisonProps` to wire version selectors and editing actions.
Without `onBlockChange`, comparisons are read-only. Keep the modified blocks in
application state, update them from `onBlockChange`, and supply
`actions.onCreateQuery` to open a query containing the current draft. The
HistoryComparison story demonstrates editing, reset, save, and query creation.
Changing only the baseline keeps the working draft intact.

Custom history `getRowActions` replaces the default menu. Supplied `comparison`
remains controlled by the consumer; its default selection action is disabled.
An explicit `editing.rowId` also remains controlled; otherwise `editing.onSubmit`
can supply rename persistence when `historyActions.onRename` is omitted.
Selections are independent for each history sidebar tab; selecting a third row
keeps the first row and replaces the second. Cancel clears the selection.

`QueryPageQueryTab`, `QueryPageComparisonTab`, and `QueryPageHistoryActions` are
exported from the root and page entrypoint. Existing comparison entries must
replace `editorProps` and `executionPanelProps` with `comparisonProps`.
