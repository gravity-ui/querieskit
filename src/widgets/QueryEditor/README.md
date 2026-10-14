# QueryEditor

A product widget that combines a query toolbar, an editable Monaco editor, a footer and a resizable side panel for Settings, Parameters and Attachments. It does not execute, format, validate or save queries itself.

```tsx
import {QueryEditor} from '@gravity-ui/querieskit/widgets/QueryEditor';

<div style={{height: 480}}>
  <QueryEditor
    value={query}
    onChange={setQuery}
    clusters={clusters}
    clusterId={clusterId}
    onClusterChange={setClusterId}
    engines={engines}
    engineId={engineId}
    onEngineChange={setEngineId}
    onRun={runQuery}
    onFormat={formatQuery}
    onValidate={validateQuery}
  />
</div>;
```

The parent must supply a bounded height. `className` can apply parent layout constraints. Monaco follows the Gravity UI theme.

## Data and actions

- `value` / `onChange` control query text. Programmatic text updates do not emit `onChange`; they remain undoable in an editable editor.
- `clusters` contains `{id, title, disabled?}` items. `engines` uses the same shape with an additional Monaco `language` ID and optional `renderSettingsFields` callback. Selection is controlled by `clusterId` / `engineId` and their change callbacks. The application owns dependencies between these lists. Empty lists disable their selectors; a missing selected engine uses plain text.
- Run, Format and Validate are always visible. Their required callbacks receive no arguments; the application already owns the selected values and text. `actionStates` supplies `disabled` and `loading` independently for `run`, `format` and `validate`.
- `additionalActions` supplies `{id, title, onClick, disabled?}` menu items. The overflow button appears only for a nonempty list.
- `rightActions` supplies ordered buttons with the same fields plus a Gravity `Icon`-compatible `icon` and optional `loading`. Attachments and Settings are always available.
- `onCodeAssistantClick` adds a footer button. The footer remains present without it.
- `readOnly` controls text editing. `editorOptions` accepts Monaco configuration except for model, value, language, theme, readOnly and automaticLayout, which the widget owns.

Public types, including `QueryEditorProps`, `QueryEditorCluster`, `QueryEditorEngine` and action types, are exported from the package root and the widget entrypoint.

## Saving

Pass `saveProps` to enable the floppy-disk button after Share and before `rightActions`:

```tsx
<QueryEditor
  {...editorProps}
  saveProps={{onSave: saveQuery, onSaveAs: saveQueryAs, disabled, loading}}
/>
```

The button opens a menu with Save and Save as. Selecting an item closes the menu
and calls its callback without arguments. The application owns persistence and any
Save as dialog. `disabled` and `loading` prevent opening the menu. Omitting `saveProps`
hides the button. Saving is independent of `readOnly` and the active side panel.

## Sharing

Pass `shareProps` to enable the built-in Share button before `rightActions`:

```tsx
<QueryEditor
  {...editorProps}
  shareProps={{
    link, // undefined before generation; {url, expiresAt: number | null} afterwards
    onGenerate: generateLink,
    onRegenerate: regenerateLink,
    onMakePermanent: createPermanentLink,
    onExpirationChange: updateExpiration,
    pendingAction, // 'generate' | 'regenerate' | 'makePermanent' | 'updateExpiration' | undefined
    error,
  }}
/>
```

QueryEditor anchors the sharing popup below the Share button, aligned to its right edge.
Click Share again, click outside or press Escape to close it. Popup visibility is independent of the side panel. The application
owns link generation, expiration persistence, loading and errors, and supplies updated
props after each operation. Sharing remains available in read-only editors. Removing
`shareProps` closes the popup and hides the button; restoring it leaves the popup closed.
The expiration pencil opens an inline date/time picker; Save calls `onExpirationChange`
with a Unix timestamp in milliseconds, while Cancel discards the draft.
For standalone use and the full contract, see [QueryShare](../../modules/QueryShare/README.md).

## Settings

Pass `settingsProps` to use the built-in `QuerySettings` form. Its generic custom values are shared with the engine descriptions:

```tsx
import {useState} from 'react';
import {QueryEditor} from '@gravity-ui/querieskit/widgets/QueryEditor';
import {createBuiltinQueryEngines} from '@gravity-ui/querieskit/widgets/QueryEditor/presets/builtin';
import type {BuiltinEngineSettings, QuerySettingsValue} from '@gravity-ui/querieskit';

const [settings, setSettings] = useState<QuerySettingsValue<BuiltinEngineSettings>>({
  queryName: '',
  access: 'private',
  ytOperationTitle: '',
  tokenIds: [],
  attributes: [],
  custom: {yqlVersion: 'stable'}, // Application-supplied default.
});
const engines = createBuiltinQueryEngines({
  yql: {versions: ['stable', 'preview']},
  chyt: {cliques, loading: cliquesLoading},
  spyt: {discoveryGroups, loading: discoveryLoading, connectAvailable},
});

<QueryEditor
  {...editorProps}
  engines={engines}
  engineId={engineId}
  onEngineChange={setEngineId}
  settingsProps={{value: settings, onChange: setSettings, errors, onFieldBlur}}
/>;
```

`QueryEditorEngine<TCustom>.renderSettingsFields` receives the `QuerySettings` context (`value`, `onChange`, `errors`, `onFieldBlur`, `disabled`) plus `engineId` and `clusterId`. The selected engine's fields appear after Query name, followed by `settingsProps.renderCustomFields` for application-wide fields. Missing or unknown engines add no fields. Render callbacks own accessibility, localization and error presentation for their controls.

Use `renderSettingsSections` on an engine for separate sections after Attributes, followed by the application's `settingsProps.renderCustomSections`. Both callbacks receive the same context as their field counterparts. The built-in preset uses this slot for the SPYT JSON configuration with Save and Cancel actions.

The editor never resets settings when engine or cluster changes. The application owns loading, defaults, validation, and any reset/migration in `onEngineChange` or `onClusterChange`. Settings changes use `settingsProps.onChange`; the editor's `onChange` remains text-only. Closing the panel keeps its content mounted.

For a completely custom panel, use `settings={<YourSettings />}` instead. `settings` and `settingsProps` are mutually exclusive; the raw slot does not automatically render engine fields. Without either prop, the panel contains its heading and close action. The panel owns heading, closing and resizing in both modes.

See [QuerySettings validation examples](../../modules/QuerySettings/README.md). The editor's Run button invokes the application's `onRun` callback; the editor itself does not execute queries.

### Built-in engine preset

`createBuiltinQueryEngines<TCustom extends BuiltinEngineSettings>()` returns ordinary engine descriptions, which can be filtered, extended or combined with application engines. The `engines` option selects their order; the default order is YQL, CHYT, SPYT, YT QL.

| Engine | Field                                                 | Custom value     |
| ------ | ----------------------------------------------------- | ---------------- |
| YQL    | Version, only when `yql.versions` is nonempty         | `yqlVersion`     |
| CHYT   | Clique, with operation state/health                   | `clique` (alias) |
| SPYT   | Discovery path unless `spyt.connectAvailable` is true | `discoveryGroup` |
| YT QL  | No additional field                                   | —                |

Supply already-loaded options for the selected cluster. CHYT cliques use `{alias, operationId?, state?, health?, disabled?}`; discovery groups use `{path, title?, disabled?}`. Loading and empty states are explicit. The preset makes no requests and selects no defaults. SPYT Connect replaces the discovery selector with a JSON configuration editor.

These are UI form values. The application decides how to store or use them, including any conversion required for query execution. QueriesKit does not construct or send execution requests. The built-in descriptions are optional; applications can supply their own engines or combine them with this set.

This factory is separate from `createQueryEditorPreset`: that helper configures Monaco language services, completion and navigation; this factory configures the engine list and settings controls. The library calls application-supplied completion and reference callbacks; the application supplies catalog data and handles navigation.

For example, combine an application engine with selected built-in descriptions:

```tsx
import {createBuiltinQueryEngines} from '@gravity-ui/querieskit/widgets/QueryEditor/presets/builtin';
import type {BuiltinEngineSettings, QueryEditorEngine} from '@gravity-ui/querieskit';

type AppEngineSettings = BuiltinEngineSettings & {workspace?: string};

const applicationEngine: QueryEditorEngine<AppEngineSettings> = {
  id: 'application-sql',
  title: 'Application SQL',
  language: 'sql', // A Monaco language registered by the application.
};
const engines: QueryEditorEngine<AppEngineSettings>[] = [
  applicationEngine,
  ...createBuiltinQueryEngines<AppEngineSettings>({engines: ['yql', 'chyt']}),
];
```

Pass this array through `QueryEditor.engines` and keep the selected ID in application state. The ID is a UI selection key; `onRun` remains an application callback. Custom engines can provide `renderSettingsFields` and `renderSettingsSections` for their own controls. Use your own Monaco providers for languages outside the optional language preset.

## Attachments

Pass `attachmentsProps` to forward the existing `Attachments` contract:

```tsx
<QueryEditor
  {...editorProps}
  attachmentsProps={{
    attachments,
    deletedAttachments,
    tokens,
    onChange: ({attachments, deletedAttachments}) => {
      setAttachments(attachments);
      setDeletedAttachments(deletedAttachments);
    },
    onItemClick,
  }}
/>
```

`onChange` receives both current and deleted lists, including draft rows (`isNew`). The editor forwards events without copying state or uploading files. Tokens retain the Attachments format `{value, title}`. The application owns persistence and loading.

Alternatively, pass `attachments={<YourAttachments />}` for custom content. The slot and `attachmentsProps` are mutually exclusive. Without either, an empty Attachments component manages its lists internally. Both contents stay mounted when closed or switched, preserving drafts and the selected tab.

## Side panel

The paperclip opens Attachments; the gear opens Settings. Only one panel is visible. Clicking its button again or its close button closes it. Headings and resizing belong to the editor.

| State           | Controlled prop | Initial uncontrolled prop     | Change callback       |
| --------------- | --------------- | ----------------------------- | --------------------- |
| Active panel    | `activePanel`   | `defaultActivePanel` (`null`) | `onActivePanelChange` |
| Preferred width | `panelWidth`    | `defaultPanelWidth` (320 px)  | `onPanelWidthChange`  |

`QueryEditorPanel` is `'settings' | 'attachments' | 'parameters' | null`. A controlled parent must update the corresponding prop in response to its callback; prop updates do not emit events. Panel and width control are independent.

The shared preferred width is retained across closing and switching panels; the displayed width is constrained to available space. Panels have a minimum width of 240 px and the editor 320 px. A narrower container scrolls horizontally. Drag the separator or focus it and press the arrow keys to resize in 16 px steps (64 px with Shift); Home and End select the minimum and maximum width.

This API replaces the previous settings-specific visibility and width props without compatibility aliases.

## Composition with QueryTabs

The `WithQueryTabs` story demonstrates application-owned tabs, text and selection state. Each editor stays mounted under a stable tab ID while inactive wrappers are hidden, preserving its cursor and Undo history. Removing the tab unmounts its editor and releases its Monaco resources. Keeping many tabs mounted has a memory cost; this widget provides no model registry or eviction policy.

The application computes `isModified` by comparing the current text with the saved baseline. `QueryTabs.onCloseTab` requests closure: the application may show a confirmation modal before removing the tab. Cancelling leaves the editor mounted and its state intact. Saving updates the baseline. If cluster or engine changes also count as unsaved work in your product, include them in that comparison.

Query results, assistant content, settings state and validation, tab persistence and navigation-away protection belong to the consuming application or a future widget.

## Parameters

The sliders button opens the Parameters side panel. It shares the active panel and
resizable width with Settings and Attachments (`activePanel="parameters"` or
`defaultActivePanel="parameters"`). Switching or closing panels keeps the form mounted
and preserves unsaved edits.

Pass `parametersProps={{value: parameters, onChange: setParameters}}` to use the
controlled `QueryParameters` form, including its optional refresh, validation, disabled,
and loading props. The editor supplies the heading and close button. With no parameters
props, the empty form manages its saved values locally. Query execution and persistence
remain the application's responsibility; use controlled values to include parameters
in a request.

For custom content, use `parameters={<CustomParameters />}` instead;
`parameters` and `parametersProps` are mutually exclusive, just like settings.

## Storybook examples

`Default` combines editable settings, parameters, attachments, and sharing using local
state. Save and Save as update a local snapshot; Run sends the complete request to
Actions. Format trims surrounding whitespace, and Validate highlights the word
`unknown` to demonstrate application-supplied diagnostics. These actions do not call a backend.

Use `EngineSettings` Controls to explore engine-specific loading, empty, disabled,
and error states. `ControlledSplitView`, `CustomPanels`, and `WithQueryTabs` demonstrate
integration contracts. `NarrowWithLongTitles`, `EmptyOptions`, and `ActionStates` keep
layout and unavailable-control cases directly reproducible. Theme is selected in the
Storybook toolbar. The `Extensions` group contains the specialized Monaco examples.

## Import compatibility

Use `@gravity-ui/querieskit/widgets/QueryEditor` and its `presets/builtin` subpath.
The previous `modules/QueryEditor` package subpath remains an alias of the widget.
There is no `modules` alias for the built-in preset. The former branded factory,
types and preset paths have been removed; use the `Builtin` names and widget preset path.

### Monaco language services

The engine factory maps YQL to `yql`, CHYT to `clickhouse`, SPYT to `spyt`, and YT QL to `ytql`. Pass `preset={createQueryEditorPreset(...)}` alongside `engines` to enable completion and reference navigation for all four. The factory alone configures the engine selector and settings, not language providers. Older SPYT/QL descriptors used `s-expression`/`yql_ansi`; update custom provider language checks when migrating.
