# QueriesKit · [![npm package](https://img.shields.io/npm/v/@gravity-ui/querieskit?logo=npm)](https://www.npmjs.com/package/@gravity-ui/querieskit) [![CI](https://img.shields.io/github/actions/workflow/status/gravity-ui/querieskit/ci.yml?branch=main&label=CI&logo=github)](https://github.com/gravity-ui/querieskit/actions/workflows/ci.yml?query=branch:main) [![storybook](https://img.shields.io/badge/Storybook-deployed-ff4685?logo=storybook)](https://preview.gravity-ui.com/querieskit/)

React component library for displaying query data and building **query pages** — history, tutorials, editors, and related UI. Part of the [Gravity UI](https://gravity-ui.com) design system.

Applications supply data through props and handle callbacks. QueriesKit manages presentation and local UI interactions; it does not fetch data or execute queries. Data loading, query execution, persistence and routing belong to the application.

The library is under active development and its public API is not yet stable.
API changes may be released without a major version bump. Check the changelog
and migration notes before updating.

## Install

```shell
npm install @gravity-ui/querieskit
```

### Peer dependencies

Your project must also provide:

- `react` / `react-dom` (^18 or ^19)
- `@gravity-ui/uikit` (>=7.18.0)
- `@gravity-ui/icons` (>=2)

See `peerDependencies` in `package.json` for the exact ranges.

## Setup

QueriesKit builds on UIKit theming and styles. At the app entry point:

```js
import '@gravity-ui/uikit/styles/fonts.css';
import '@gravity-ui/uikit/styles/styles.css';
```

Wrap the app in `ThemeProvider`:

```jsx
import {ThemeProvider} from '@gravity-ui/uikit';

createRoot(document.getElementById('root')).render(
  <ThemeProvider theme="light">
    <App />
  </ThemeProvider>,
);
```

See [UIKit docs](https://github.com/gravity-ui/uikit#styles) for theming and i18n setup.

## Architecture

The public API has four levels:

| Level | Path | Role |
| --- | --- | --- |
| **Pages** | `src/pages` | Compositions of widgets with shared screen layout |
| **Widgets** | `src/widgets` | Ready-to-use feature blocks for a queries page |
| **Modules** | `src/modules` | Scenario blocks composed from components and other modules (lists, rows, headers) |
| **Components** | `src/components` | Small reusable UI pieces with a stable props contract |

Cross-level imports flow one way: `pages → widgets → modules → components`. Modules may compose other modules without dependency cycles.

Use pages for a complete screen layout, widgets for independent feature blocks, and modules or components for custom compositions.

## Usage

### Individual imports

All public components, modules, widgets, and pages support both root and individual imports.
Prefer individual imports to keep the dependency graph and extracted CSS focused on the units you use:

```tsx
import {QueryStatusIcon} from '@gravity-ui/querieskit/components/QueryStatusIcon';
import {QueriesHistory} from '@gravity-ui/querieskit/modules/QueriesHistory';
import {QueryEditor} from '@gravity-ui/querieskit/widgets/QueryEditor';
```

Root imports remain supported:

```tsx
import {SavedQueries} from '@gravity-ui/querieskit';
```

Alternatively, start directly from the module's entrypoint:

```tsx
import {SavedQueries} from '@gravity-ui/querieskit/modules/SavedQueries';
import type {SavedQueriesProps} from '@gravity-ui/querieskit/modules/SavedQueries';
```

Every public unit re-exported by the four level barrels has an individual entrypoint
under its corresponding level (`components/`, `modules/`, `widgets/`, or `pages/`).
They expose each unit's existing public exports, including its props and helpers.
Shared data types remain available from the package root.

Individual imports limit the dependency graph the bundler needs to traverse.
Both forms support tree-shaking with an ESM-aware bundler; individual imports do
not necessarily produce a smaller bundle. Existing root imports remain supported.
Keep CSS processing enabled so that the selected widget's styles are included.
Some bundlers, including esbuild, retain CSS from unused root re-exports even when
their JavaScript is removed. Individual unit imports avoid introducing those
unrelated styles.

For browser builds, preserve ESM imports through to the bundler. Requiring the
package root as CommonJS eagerly traverses its re-exports and can retain unrelated
widgets and dependencies. Individual CJS entrypoints reduce that scope, but the
published CJS build does not preserve the ESM code-splitting boundaries.

Search previews in `QueriesHistory`, `SavedQueries`, and `TutorialsHistory` load Monaco
on demand. While the editor chunk loads, the row displays the query as plain text
without changing its height or link. Configure production code splitting to retain
this loading boundary; a single-file bundle still contains the editor. Chunk-loading
errors propagate to the application's error boundary.

See [the next-major migration notes](docs/migrations/next-major.md) for the explicit
Monaco language registrations and how to connect additional languages.

### QueriesVcs

Controlled VCS browsing with provider, optional repository, and branch selection, available standalone or through a `vcs` tab in `QueriesSidebar` / `QueryPage`. Pass `repositories` to use the standard repository selector; it appears only for multiple repositories. Applications own loading, controlled selection (including choosing a sole repository), and stale-response protection. See the [QueriesVcs guide](src/modules/QueriesVcs/README.md) for navigation resets and asynchronous integration.

### QueryPage

Composes a shared `QueriesSidebar` with `QueryTabs`. Each query tab owns an independent
`QueryEditor` and `QueryExecutionPanel`, including its results layout. Visited workspaces
stay mounted when switching tabs; removing a tab releases its workspace. The query tab
strip stays visible when results expand. Your application owns the tab list, selection,
query data, actions, and navigation. See [the QueryPage guide](src/pages/QueryPage/README.md)
for the full API and migration from the previous single-workspace props.

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

### QueriesSidebar

Combines history, saved queries, navigation and tutorials in one panel. Supply
an ordered `tabs` array and an optional `header` for product selection or actions.
Use `hideTabs` with `activeTab` when navigation lives outside the sidebar.
See [the API and migration guide](src/widgets/QueriesSidebar/README.md).

### Query editors

`MonacoEditor` and `QueryEditor` support model-scoped language providers, custom
extensions, diagnostics, line navigation, and access to the editor instance.
Use `createQueryEditorPreset` for optional language completion with catalog and
schema adapters, or replace individual capabilities with your own Monaco providers.
See [the QueryEditor guide](src/widgets/QueryEditor/README.md),
[the editor integration guide](docs/editor-extensions.md), and the QueryEditor
Extensions stories. Individual imports are available from `components/MonacoEditor`,
`widgets/QueryEditor`, and `helpers/queryEditorPreset`.

```tsx
import {QueryEditor} from '@gravity-ui/querieskit/widgets/QueryEditor';
```

Optional engine UI configurations are available from `widgets/QueryEditor/presets/builtin`.
They define language selection, labels and settings controls using application-supplied data.
The previous package subpath `modules/QueryEditor` remains a compatibility alias for the widget.
The built-in preset is available only under the widget subpath.

### QueryExecutionPanel

A query execution panel with ordered, typed tabs, custom content, automatic tab
selection until manual navigation, message severity titles, and application-owned
expand/close actions. See [the API and integration guide](src/widgets/QueryExecutionPanel/README.md)
and the QueryExecutionPanel Storybook examples.

`QueryResults` is a module, available from the package root or through
`@gravity-ui/querieskit/modules/QueryResults`.

### QueriesHistory

Ready-made query history sidebar: search, filters, editable titles, row actions, and optional compare mode.

```tsx
import {useState} from 'react';
import {QueriesHistory} from '@gravity-ui/querieskit';
import type {QueryHistoryItem, QueryHistoryRow} from '@gravity-ui/querieskit';

const items: QueryHistoryItem<QueryHistoryRow>[] = [
  {header: 'Today', height: 28},
  {
    id: 1,
    title: 'My query',
    status: 'completed',
    engine: 'YQL',
    startTime: Date.now() - 60_000,
    endTime: Date.now(),
    query: 'SELECT 1',
    height: 52,
  },
];

function HistoryPanel() {
  const [search, setSearch] = useState({value: '', fullSearch: false});

  return (
    <QueriesHistory
      title="History"
      items={items}
      search={{
        value: search.value,
        fullSearch: search.fullSearch,
        hasClear: true,
        onUpdate: setSearch,
      }}
      onListItemClick={(item) => {
        if ('id' in item) {
          // open query by id
        }
      }}
    />
  );
}
```

### SavedQueries

Saved queries with search, filters, editable titles, comparison, configurable metadata,
custom author rendering, incremental loading, and custom links or rows.

```tsx
import {SavedQueries, type QueryListLinkRenderer} from '@gravity-ui/querieskit';

const renderLink: QueryListLinkRenderer = ({href = '', ...props}) => (
  <RouterLink {...props} to={href} />
);

<SavedQueries
  items={savedQueries}
  selectedRowId={selectedQueryId}
  hasMore={hasNextPage}
  loading={isLoading}
  onLoadMore={loadNextPage}
  renderLink={renderLink}
  search={{value: search, onUpdate: updateSearch}}
/>;
```

An empty list with `loading` shows the initial spinner; loading with existing items shows an
inline loader after them. Appending a page preserves the list instance and scroll position.
Keep `loading` controlled, including passing `false` between requests, to prevent repeated
load requests. The application owns the initial request, data, filtering, and routing.

`renderLink` applies to both regular and full-text search rows with an `href`. Without it,
rows use regular `<a>` elements. Rows without an `href`, or with editing or comparison enabled,
render without a link and do not call `renderLink`.

`renderRowItem` receives the original item (including group headers), index, variant, activity,
editing/comparison data, visible fields, actions, and `renderLink`. It replaces the standard row;
the consumer renders group headers and applies links as needed. Returning `null` hides the row
contents. `renderAuthor` customizes the author in standard rows and respects field visibility.
Set `search.fullSearchAvailable` to `false` to disable full-text search and hide its toggle.

### TutorialsHistory

Tutorial list with search, optional filters, selectable rows, incremental loading, and custom
link or row rendering.

```tsx
import {TutorialsHistory, type QueryListLinkRenderer} from '@gravity-ui/querieskit';

const renderLink: QueryListLinkRenderer = ({href = '', ...props}) => (
  <RouterLink {...props} to={href} />
);

<TutorialsHistory
  items={tutorials}
  selectedRowId={selectedTutorialId}
  hasMore={hasNextPage}
  loading={isLoading}
  onLoadMore={loadNextPage}
  renderLink={renderLink}
  search={{value: search, onUpdate: updateSearch}}
/>;
```

`renderLink` is used for tutorial rows with a non-empty `href`, including full-text search
results. Without it, those rows render as regular `<a>` elements; rows without an `href` render
as `<div>` elements.

Use `renderRowItem` to replace the row contents while retaining the list's navigation and
selection behavior. It receives the original item, its list index, the current row variant
(`default` or `search`), keyboard activity as `isActive`, and `renderLink`. Group headers are
passed to the renderer as items and must be rendered by the consumer. Default rows continue to
show the tutorial `id`. A custom renderer can omit a long string ID from the visible content
while keeping it on the item for `selectedRowId` and navigation.

An empty list with `loading` shows the initial spinner. When existing items are present, loading
the next page shows an inline loader after them. Keep `loading` controlled, including passing
`false` between requests; the consumer remains responsible for the initial request, filtering,
and routing.

Browse interactive examples in [Storybook](https://preview.gravity-ui.com/querieskit/).

### QueriesNavigation

`QueriesNavigation` renders cluster and path navigation, an optional detail panel, and
application-provided header actions. Applications remain responsible for loading data, routing,
favorites, and item-specific operations.

```tsx
import {Button, DropdownMenu, Flex} from '@gravity-ui/uikit';
import {QueriesNavigation} from '@gravity-ui/querieskit';

<QueriesNavigation
  location={location}
  onUpdate={setLocation}
  items={items}
  search={{value: search, onUpdate: setSearch}}
  parentRow={{showDuringSearch: true}}
  header={{
    actions,
    getBreadcrumbHref: ({cluster, path}) =>
      cluster ? `/navigation/${cluster}${path ?? ''}` : '/navigation',
    renderActions: ({location, actions: headerActions}) => (
      <Flex gap={1}>
        <DropdownMenu
          items={headerActions.map((action) => ({
            text: action.title,
            disabled: action.disabled,
            hidden: action.hidden,
            action: () => action.onClick(location),
          }))}
        />
        <Button href={`/navigation/${location.cluster}${location.path ?? ''}`} target="_blank">
          Open
        </Button>
      </Flex>
    ),
  }}
/>;
```

Without `renderActions`, actions keep the standard button rendering. A custom renderer receives
the unfiltered action array and owns handling of `hidden`, `disabled`, and clicks; returning
`null` intentionally leaves the action area empty. In a detail panel the array contains the
panel actions (or header actions when panel actions are absent), followed by actions supplied by
the resolved detail config.

`getBreadcrumbHref` turns every breadcrumb, including the cluster root and current item, into a
real link. Plain clicks continue through `onUpdate`, while modified and middle clicks keep native
browser behavior. URL construction and router integration belong to the application. Breadcrumb
segments are derived from normalized single-slash paths; the parser does not preserve a Cypress
`//` prefix.

`parentRow.showDuringSearch` defaults to `false`. Set it to `true` to keep the parent navigation
row available while search results are filtered, including when the result list is empty.

## Widgets

| Widget | Description |
| --- | --- |
| `QueriesHistory` | Query history with search, filters, visible fields, editing, and comparison |
| `TutorialsHistory` | Tutorials list with search, filters, pagination, and custom rendering |

## Development

```shell
git clone git@github.com:gravity-ui/querieskit.git
cd querieskit
npm ci
npm run storybook   # http://localhost:6006
```

Useful scripts:

```shell
npm run build            # library build
npm run lint:all         # ESLint
npm run build-storybook  # static Storybook
```

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request.

## License

MIT — see [LICENSE](LICENSE).

### Execution timeline

`QueryTimeline` provides a virtualized execution timeline with stages, filters and live
updates. It can also be passed to `QueryProgress` using `timelineProps`. See the
[QueryTimeline guide](src/modules/QueryTimeline/README.md) for the data contract and examples.
