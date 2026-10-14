# Next major: explicit Monaco languages and isolated imports

This change is intended for the next major release. Component props, root exports,
and existing individual entrypoint aliases remain available. Automatic registration
of additional Monaco languages changes and may require application changes.

## Languages

QueriesKit registers its existing YQL (`yql`), YTQL (`yql_ansi`), CHYT (`clickhouse`),
SPYT (`s-expression`), and JSON (`json`) languages. It no longer imports Monaco's
root entrypoint, which implicitly registered unrelated languages and language services.
The editor's existing commands and contributions remain registered.

Applications using other languages must register them before rendering the editor.
For example, with Monaco 0.56:

```tsx
import 'monaco-editor/languages/definitions/python/register';
import {MonacoEditor} from '@gravity-ui/querieskit/components/MonacoEditor';

<MonacoEditor language="python" value="print('hello')" />;
```

Use the registration entrypoint for the desired language in your installed Monaco
version. Language services may also require their feature registrations and workers.
Keep the application and QueriesKit on the same resolved Monaco version so the
registrations reach the editor instance. Avoid importing Monaco's root merely to
access `editor` or `languages`; use `monaco-editor/editor/editor.api` at runtime.
Type-only imports from `monaco-editor` remain safe.

## Imports and loading

Every public component, module, widget, and page now has an explicit individual
entrypoint with ESM/CJS and TypeScript declarations. Prefer these entrypoints over
`build/...` paths or the root when bundle isolation matters:

```tsx
import {QueryStatusIcon} from '@gravity-ui/querieskit/components/QueryStatusIcon';
import {QueriesHistory} from '@gravity-ui/querieskit/modules/QueriesHistory';
import {QueryEditor} from '@gravity-ui/querieskit/widgets/QueryEditor';
```

Root imports still support JavaScript tree-shaking, but esbuild may extract CSS
from unused root re-exports. This release does not promise CSS isolation for root
imports. CSS remains side-effectful and must be processed by the application.

History search previews now load the editor asynchronously when rendered. They
show plain query text at the same height while loading. Production code splitting
must remain enabled to keep Monaco out of the initial history chunk. A rejected
chunk load reaches the application's error boundary.

## Runtime dependencies and browsers

The package explicitly declares the Babel runtime 7 and core-js versions needed
by its generated JavaScript. An application may use Babel runtime 8 independently;
it must not force QueriesKit's runtime dependency to version 8 through overrides.
Browser targets and automatic polyfills are unchanged. Reducing polyfills is deferred
until supported browsers are agreed with consuming applications.
