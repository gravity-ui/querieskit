# Migration notes for the library audit fixes

These changes include breaking changes to engine factory names, preset imports, engine language descriptors and internal type paths. Component callback signatures and unrelated package entrypoints remain available. No release has been published as part of this change.

## Query editor engines

Use `createBuiltinQueryEngines` and the `Builtin`-prefixed public types: `BuiltinQueryEngineId`, `BuiltinEngineSettings`, `BuiltinQueryClique`, `BuiltinDiscoveryGroup` and `BuiltinQueryEnginesOptions`. The former branded factory and types have been removed without aliases. Import the preset from `@gravity-ui/querieskit/widgets/QueryEditor/presets/builtin`; both former branded preset subpaths have been removed, and no `modules` preset alias is provided. Within the repository, public types now live in `src/types/builtinQueryEngines.ts`.

`createBuiltinQueryEngines()` now returns the same Monaco language IDs that `createQueryEditorPreset()` supports:

| Engine ID (unchanged) | Previous language | Current language |
| --------------------- | ----------------- | ---------------- |
| `yql`                 | `yql`             | `yql`            |
| `chyt`                | `clickhouse`      | `clickhouse`     |
| `spyt`                | `s-expression`    | `spyt`           |
| `ql`                  | `yql_ansi`        | `ytql`           |

Update application checks and custom providers that depended on the old SPYT/QL descriptors. The standalone `s-expression` and `yql_ansi` language registrations are retained for applications explicitly using them.

Pass both UI configurations to the editor to enable engine settings and language services:

```tsx
import {createQueryEditorPreset} from '@gravity-ui/querieskit/helpers/queryEditorPreset';
import {createBuiltinQueryEngines} from '@gravity-ui/querieskit/widgets/QueryEditor/presets/builtin';

const engines = createBuiltinQueryEngines({
  yql: {versions: ['stable']},
  chyt: {cliques: [{alias: 'analytics', state: 'active', health: 'good'}]},
  spyt: {discoveryGroups: [{path: '//sys/spark/clusters/demo'}]},
});
const preset = createQueryEditorPreset({listPathChildren, getTableSchema, onReferenceClick});
// Pass engines and preset in QueryEditor props or QueryPage tab.editorProps.
```

Keep these objects stable until their data changes. Applications still own requests, saved settings, query execution and navigation. QueryPage does not install engine or language presets automatically. The descriptors define UI controls; completion data and navigation are supplied through application callbacks. Its FourEngines story demonstrates all four engines with local adapters and independent tab drafts.

## Public types

Public props and consumer models now live in `src/types`. Import them from the package root or the corresponding unit entrypoint instead of implementation files and internal `types.ts` files:

```ts
import type {
  AddChartButtonOption,
  Attachment,
  AttachItem,
  DashboardProps,
  DashboardRenderItem,
  HistoryFilterProps,
  NavigationDetailProps,
  SimpleFormProps,
} from '@gravity-ui/querieskit';
```

In particular, replace deep imports of `components/Dashboard/types`, `modules/ChartEditor/types`, attachment editor internals and SimpleForm field implementation types. Old internal paths are not a compatibility contract. Unrelated package subpath aliases are retained.

Within this repository, import types directly from their files. Dashboard types are in `src/types/dashboard.ts`, chart editor types in `chartEditor.ts`, attachment data in `attachments.ts`, attachment editing contracts in `attachmentsEditor.ts`, and chart button types in `addChartButton.ts`. Other extracted unit contracts use the corresponding camel-case `*Props.ts` file. HistoryFilter and NavigationDetail use `historyFilter.ts` and `navigationDetail.ts`; navigation resolver contracts use `navigationDetailResolvers.ts`.

History row/search row, group/header and status/duration contracts now also have descriptive exported names such as `HistoryRowProps` and `QueryDurationProps` instead of a local generic `Props` name. Use `import type` for these dependencies.

## Corrected behavior

- HistoryFilter edits a local draft. Initial precedence is field defaults, then `initialValues`, then `values`. Apply sends the complete draft, including untouched fields. Reset restores field defaults plus `initialValues` and calls `onReset`. A substantive external `values` change replaces the draft; an equivalent object does not. Closing the popup keeps edits.
- Dashboard now calls the existing focus/blur callbacks with item content and its current index. Removed items do not emit callbacks.
- NavigationDetail restores a visible enabled tab after its uncontrolled selection disappears; automatic recovery does not emit a user selection callback. With no enabled tabs it renders empty content. Controlled selection remains application-owned.
- Default chart labels are localized. Custom text/options and technical chart IDs are unchanged. Count labels use “Fields: N” / “Elements: N” and their Russian equivalents.

## Storybook

Use the global Language and Theme controls to check EN/RU and light/dark. Switching language synchronizes querieskit, UIKit and date-utils and remounts the story, resetting demo state. Fixture data is no longer exported as stories. QueryShare controls and Actions now reflect the interactive example.
