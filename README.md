# QueriesKit · [![npm package](https://img.shields.io/npm/v/@gravity-ui/querieskit?logo=npm)](https://www.npmjs.com/package/@gravity-ui/querieskit) [![CI](https://img.shields.io/github/actions/workflow/status/gravity-ui/querieskit/ci.yml?branch=main&label=CI&logo=github)](https://github.com/gravity-ui/querieskit/actions/workflows/ci.yml?query=branch:main) [![storybook](https://img.shields.io/badge/Storybook-deployed-ff4685?logo=storybook)](https://preview.gravity-ui.com/querieskit/)

React component library for building **query pages** — history, tutorials, editors, and related UI. Part of the [Gravity UI](https://gravity-ui.com) design system.

## Install

```shell
npm install @gravity-ui/querieskit
```

### Peer dependencies

Your project must also provide:

- `react` / `react-dom` (^18 or ^19)
- `@gravity-ui/uikit` (>=7)
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

The public API has three levels:

| Level | Path | Role |
| --- | --- | --- |
| **Widgets** | `src/widgets` | Ready-to-use feature blocks for a queries page |
| **Modules** | `src/modules` | Scenario blocks composed from components (lists, rows, headers) |
| **Components** | `src/components` | Small reusable UI pieces with a stable props contract |

Import direction is one-way: `widgets → modules → components`.

Prefer widgets for product screens. Use modules and components when you need a custom layout or only a part of a scenario.

## Usage

### Widget imports

All six widgets support both root and individual imports:

```tsx
import {SavedQueries} from '@gravity-ui/querieskit';
```

Alternatively, start directly from the widget's entrypoint:

```tsx
import {SavedQueries} from '@gravity-ui/querieskit/widgets/SavedQueries';
import type {SavedQueriesProps} from '@gravity-ui/querieskit/widgets/SavedQueries';
```

Individual entrypoints are available for `QueriesHistory`, `SavedQueries`,
`TutorialsHistory`, `QueriesNavigation`, `QueryResults`, and `DashboardCharts`.
They expose each widget's existing public exports, including its props and helpers.
Shared data types remain available from the package root.

Individual imports limit the dependency graph the bundler needs to traverse.
Both forms support tree-shaking with an ESM-aware bundler; individual imports do
not necessarily produce a smaller bundle. Existing root imports remain supported.
Keep CSS processing enabled so that the selected widget's styles are included.
Some bundlers, including esbuild, retain CSS from unused root re-exports even when
their JavaScript is removed. Individual widget imports avoid introducing those
unrelated styles.

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
