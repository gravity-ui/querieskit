# Extensible query editors

`MonacoEditor` provides editor lifecycle and model-scoped language providers.
`QueryEditor` adds engine and cluster selection and application toolbar actions.
Both accept the same extension props. Give either component a bounded-height
container. Existing use without these props keeps its existing behavior.

## Language preset and application data

```tsx
import {QueryEditor} from '@gravity-ui/querieskit';
import {createQueryEditorPreset} from '@gravity-ui/querieskit/helpers/queryEditorPreset';

// Keep the preset stable: create it outside a component or use useMemo.
const preset = createQueryEditorPreset({
  languages: ['yql', 'clickhouse', 'ytql', 'spyt'],
  listPathChildren: async ({path, clusterId, data, token}) => {
    // The application owns transport, authentication and cancellation wiring.
    const items = await catalog.list({path, clusterId, data, token});
    return items.map((item) => ({
      name: item.name,
      path: item.path,
      kind: item.isDirectory ? 'directory' : 'table',
    }));
  },
  getTableSchema: async ({path, clusterId, token}) => {
    const columns = await catalog.columns({path, clusterId, token});
    return columns.map((column) => ({name: column.name, type: column.type}));
  },
  onReferenceClick: ({identifier, clusterId}) => {
    // Resolve an application route here; no routing is built into the editor.
    openTable(identifier, clusterId);
  },
});

// Spread your existing required QueryEditor props (value, onChange, engines,
// clusters and toolbar callbacks) alongside these new optional props.
<QueryEditor {...queryEditorProps} preset={preset} />;
```

YQL and ClickHouse use lazy SQL parsers for contextual completion. YTQL and SPYT
provide language definitions and local vocabulary. The preset is optional;
using the editor without it does not load the SQL parsers. The factory is also
exported from the root entrypoint.

Adapter requests contain `language`, optional `engineId`, `clusterId`, `data`,
`path`, and a Monaco `CancellationToken`. Catalog items contain `name`, optional
`path` and `detail`, and `kind: 'directory' | 'table'`. Columns contain `name`,
optional `type` and `detail`. Sync and async responses are supported. Without
adapters, local completion remains available; adapter failures do not discard
local suggestions. Data is not cached globally across editors.

For languages with cluster qualification, an explicit table qualifier wins over
an active `USE`, which wins over the selected cluster. Parsing and quoting rules
belong to each language implementation, not the editor core. Reference callbacks
receive `{kind: 'table', identifier, range, clusterId?}`.

In ClickHouse and SPYT, database qualifiers and `USE` select a database, not a
connection cluster. For example, `analytics.events` is passed as the table
identifier while `clusterId` remains the selected connection. Catalog requests
use `analytics.` as the database prefix. In YQL, the qualifier selects a cluster.

`QueryEditor` supplies the selected engine, language and cluster to the preset.
Use `providerContext.data` for additional application data. Standalone
`MonacoEditor` accepts `providerContext` directly. Context scalar fields and the identity of `data` determine changes; keep `data`
stable until its contents change. Changing the context invalidates outstanding requests.

## Replace or extend individual capabilities

```tsx
import type {EditorProviders} from '@gravity-ui/querieskit';
import type {languages} from 'monaco-editor';

const completion: languages.CompletionItemProvider = {
  provideCompletionItems(model, position, context, token) {
    return appCompletion(model, position, context, token);
  },
};
const providers: EditorProviders = {
  completion: {mode: 'replace', provider: completion},
  hover: false,
};

<QueryEditor {...queryEditorProps} preset={preset} providers={providers} />;
```

| Entry                         | Meaning                                          |
| ----------------------------- | ------------------------------------------------ |
| Omitted                       | Use the preset provider, if present              |
| `false`                       | Disable that querieskit capability               |
| `{mode: 'replace', provider}` | Replace its preset implementation                |
| `{mode: 'append', provider}`  | Keep both preset and application implementations |

Available keys are `completion`, `inlineCompletion`, `hover`, `definition`, and
`documentFormatting`. Formatting supports `replace` only. Provider objects use
Monaco's public interfaces; a custom provider may capture application context in
its closure. Keep providers and the overrides object stable with `useMemo` when
creating them inside a component.

The preset is recreated only when its identity or provider context changes.
Updating overrides reconciles providers by capability and provider identity: replacing
hover leaves unchanged completion and inline providers, including pending requests,
attached. Changing a provider cancels only that provider's pending requests; changing
context cancels all of them before the previous preset is disposed.

Append does not deduplicate similar suggestions. Use Monaco's `sortText`, ranges,
and snippet fields to control completion behavior. `false` does not unregister
providers that the application registered globally outside querieskit.

Provider dispatch is model-scoped. Text, language, context and provider changes
invalidate pending requests. Providers should honor their cancellation token;
late responses are ignored. Result resolution and disposal are forwarded to the
provider that created the result, even if props have subsequently changed.

Inline completion is independent of the code-assistant button. Monaco lifecycle
callbacks report display, partial acceptance and end-of-lifetime reasons. Use
`handleEndOfLifetime` to distinguish accepted, rejected and ignored suggestions.
`disposeInlineCompletions` and token cancellation are cleanup events, not user
rejection. The Storybook Inline Lifecycle example logs these separately.

`onFormat` and `onValidate` remain application toolbar callbacks. A
`documentFormatting` provider serves Monaco's format command; it does not
implicitly invoke `onFormat`. An application can explicitly call
`editorRef.current?.getAction('editor.action.formatDocument')?.run()` from its
format callback when that is the desired behavior. Validation results can be
passed back through `diagnostics`.

## Extensions and editor access

```tsx
import type {EditorExtension} from '@gravity-ui/querieskit';

const extension: EditorExtension = {
  setup({editor, model, monaco, statusBarElement}) {
    const subscription = editor.onDidChangeCursorPosition(({position}) => {
      // Publish cursor state or update extension-owned UI.
    });
    return () => subscription.dispose();
  },
};
```

Extensions receive the actual Monaco instance, editor and model. Setup returns a
cleanup function. Stable extensions are not reinstalled for text edits; replacing
an extension or changing the status-bar container triggers cleanup and setup.
Cleanup runs before editor/model disposal, including React Strict Mode remounts.
Clean up all listeners, commands and DOM elements created by the extension.

`showStatusBar` defaults to `false`; `statusBarElement` is then `null`. When enabled,
the container is available for extension-owned content. Preserve extension
identities to avoid unnecessary setup; a new array containing the same extension
objects does not reinstall them.

`editorRef` receives the live `IStandaloneCodeEditor` and is cleared on unmount.
Use `executeEdits` with undo stops to insert text while preserving undo history.
`onFocus`, `onBlur` and `onClick` are forwarded from editor events.

The new facilities require a component-owned model. `monacoConfig.model` is
legacy and cannot be combined with these facilities. Extensions must not replace
or dispose the editor's model.

## Diagnostics and line navigation

`diagnostics` accepts Monaco `IMarkerData[]`. Querieskit uses its own marker owner,
so application extensions retain ownership of their markers. An empty array or
removing the prop clears querieskit markers and error decorations.

`highlightErrorLines` defaults to `false`; when enabled, error lines get one
whole-line decoration per line. `highlightedLine` uses one-based line numbers,
highlights and reveals a valid line when changed, and clears when removed.
Invalid line numbers are ignored. `onLineNumberClick` receives clicks on Monaco's
line-number gutter; URL synchronization belongs to the application.

The Extensions stories cover all four dialects, a mock catalog, completion
replacement and addition, independent models, inline lifecycle, diagnostics,
ref-based insertion and a status-bar extension. They use public library exports.

## Internal dialect boundary

Each built-in dialect has an internal module under `helpers/queryEditorPreset/dialects`
that selects its parser, vocabulary, language registration, identifier quoting and
cluster/database namespace policy. The shared completion pipeline consumes normalized
analysis rather than parser-specific fields. These modules are not a public plugin API;
applications can supply their own `EditorPreset` as before.

Parsers determine completion context. The shared lexical scanner supplies source
ranges and physical table references for schema lookup and navigation, including for
dialects without a parser. It is a best-effort scanner, not a full SQL AST; it does not
infer CTE outputs or model arbitrary dialect grammar and table functions.

## Browser integration tests

Run `npx playwright install chromium` once, then `npm run test:editors:browser`.
The tests start and stop an isolated Vite fixture with real Monaco editors; no
Storybook server is required. They exercise completion, inline suggestions and
formatting isolation, provider replacement, context/language changes, cancellation
and unmount cleanup under React Strict Mode.
