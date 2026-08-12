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

Same layout pattern for tutorial lists — search, optional filters, and selectable rows.

```tsx
import {TutorialsHistory} from '@gravity-ui/querieskit';
```

Browse interactive examples in [Storybook](https://preview.gravity-ui.com/querieskit/).

## Widgets

| Widget | Description |
| --- | --- |
| `QueriesHistory` | Query history with search, filters, visible fields, editing, and comparison |
| `TutorialsHistory` | Tutorials list with search and filters |

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
