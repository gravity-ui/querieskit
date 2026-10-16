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

A draft with no execution tabs, execution metadata, status content, loading, or error
hides the execution panel and its resize handle, giving the editor the full workspace
height. Any of these props, or a status other than `draft` (including `running`),
shows the panel. A supplied result tab counts even when its table has zero rows.
Header actions and empty-state content alone do not show the panel.
Visibility follows current props without changing collapse/expand state or invoking
layout callbacks. The hidden panel stays mounted with `active=false`, retaining its
layout and internal state; its expanded state does not hide the editor.

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
and query tabs remain accessible. Collapsed results show their header and any supplied status content;
collapse takes precedence when both flags are true.

Resizing, hiding the sidebar, and expanding or collapsing results do not unmount
widgets. Nested widget policies still apply: for example, `sidebarProps.keepMounted`
preserves visited sidebar tabs. Removing the page unmounts all workspaces.

## Custom workspace composition

Each query item can supply `renderWorkspace({children, active})`. `children` is the
complete standard editor/results layout, including its resize handle. The callback
is first invoked when the tab is visited and remains mounted until the tab is removed.
It is a render function, not a component: put hooks in a separate component returned
by the function. Comparison tabs, the sidebar and query tab strip are unaffected.
`QueryPageWorkspaceContext` is exported from the package root and page entrypoint.

```tsx
renderWorkspace: ({children, active}) => (
  <FileWorkspace active={active} expanded={fileExpanded}>
    {children}
  </FileWorkspace>
),
executionPanelProps: {
  ...executionPanelProps,
  active: !fileExpanded,
  headerActions: <StopButton onClick={stop} />,
  statusContent: <ExecutionStatus progress={progress} />,
},
```

`FileWorkspace`, `StopButton` and `ExecutionStatus` above are application components.
Keep the workspace wrapper and the position of `children` stable when opening,
closing or expanding a sibling editor. Hide the standard region with `hidden` or
CSS instead of removing it. A fresh callback on every render does not itself reset
state, but changing component types, keys or parent structure can recreate Monaco
and clear undo history, results selection and charts. Adding/removing the callback
while switching between wrapped and unwrapped layouts has the same limitation.

The wrapper must provide a bounded height through every ancestor of `children`,
with `min-width: 0` and `min-height: 0` on its grid/flex regions. Use flexible grid
tracks such as `minmax(0, 1fr)` and preserve the normal region when maximizing the
sibling editor. File data, saving and sibling layout dimensions belong to the application.

`active` means this query tab is selected, not that the application has kept its
standard workspace visible. When a sibling editor covers the standard workspace,
set `executionPanelProps.active` to `false`; restore it when revealing results.
This pauses activity-aware results and hides the chart editor modal while retaining
its draft. Custom slot content and other application overlays own their activity
and visibility; CSS hiding alone does not hide portalled overlays.

The **ExternalState** Storybook example demonstrates a single controlled query,
custom settings and attachments, engine-specific action visibility, execution
actions/status, and a retained sibling file editor. It also connects `editorRef`,
preset/provider/extension hooks, diagnostics and line navigation. Its execution and
storage are local demonstrations; the application supplies real services.

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

The default history Delete action opens a confirmation dialog with the query name and an
irrecoverable-data warning. `onDelete` is called only after confirmation; canceling or
closing the dialog leaves the query unchanged. Custom `getRowActions` retain their own behavior.
