# YTsaurus query engines

`createYtsaurusQueryEngines` builds `QueryEditor` engine descriptors with settings
fields and a separate SPYT configuration section. It is independent of Monaco provider configuration from
`createQueryEditorPreset`.

```tsx
import {createYtsaurusQueryEngines} from '@gravity-ui/querieskit/modules/QueryEditor/presets/ytsaurus';

const engines = createYtsaurusQueryEngines({
  engines: ['yql', 'chyt', 'spyt', 'ql'],
  yql: {versions: ['2025.01', '2025.02']},
  chyt: {
    cliques: [{alias: 'analytics', state: 'active', health: 'good'}],
    loading: false,
  },
  spyt: {
    connectAvailable: false,
    discoveryGroups: [{path: '//sys/spark/clusters/production'}],
  },
});
```

Pass `engines` and controlled `settingsProps` to `QueryEditor`. Store values in
`settingsProps.value.custom` using `YtsaurusEngineSettings`: `yqlVersion`, `clique`,
`discoveryGroup`, and `spytConfig`. Extend this type and pass the extension as the factory's
generic parameter when adding application fields.

The default engine order is YQL, CHYT, SPYT, YT QL. An explicit `engines` list
controls inclusion and order. YQL's field requires nonempty `versions`; SPYT
Connect shows the JSON configuration section instead of the discovery selector.
Without Connect, only the discovery selector is shown. CHYT and legacy SPYT allow clearing selection.

The application loads options for the current cluster, rebuilds the descriptors
when those options change, supplies initial values (including a default YQL
version), validates settings, and handles engine changes. This factory neither
fetches data nor changes values on render. Backend key conversion also belongs
to the application.

CHYT options show status and an optional operation ID, with active, healthy
cliques first. `cliques: undefined` means not loaded; `cliques: []` means a loaded
empty list. A selection absent from a loaded list is hidden without changing
the stored value. During loading the existing selection remains visible.

The SPYT section edits `custom.spytConfig` as JSON object text. An omitted value
is displayed as `{}` without emitting a change. Edits stay local until Save;
invalid JSON and non-object values cannot be saved. Cancel restores the latest
controlled value. External updates and cluster changes reset the draft.
`errors.custom.spytConfig`, disabled state, and the `custom.spytConfig` blur
notification follow the regular settings contract. Applications convert the JSON
text to their backend format when submitting the query.

For JSON language services, route the `json` label in your Monaco environment
worker configuration to `monaco-editor/languages/features/json/json.worker`.
Use the worker setup appropriate for your bundler, alongside the editor worker.
