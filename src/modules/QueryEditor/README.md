# QueryEditor

A reusable module that combines a query toolbar, an editable Monaco editor, a footer and a resizable side panel for Settings and Attachments. It does not execute, format, validate or save queries itself.

```tsx
import {QueryEditor} from '@gravity-ui/querieskit/modules/QueryEditor';

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
- `readOnly` controls text editing. `editorOptions` accepts Monaco configuration except for model, value, language, theme, readOnly and automaticLayout, which the module owns.

Public types, including `QueryEditorProps`, `QueryEditorCluster`, `QueryEditorEngine` and action types, are exported from the package root and the module entrypoint.

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
For standalone use and the full contract, see [QueryShare](../QueryShare/README.md).

## Settings

Pass `settingsProps` to use the built-in `QuerySettings` form. Its generic custom values are shared with the engine descriptions:

```tsx
import {useState} from 'react';
import {QueryEditor} from '@gravity-ui/querieskit/modules/QueryEditor';
import {createYtsaurusQueryEngines} from '@gravity-ui/querieskit/modules/QueryEditor/presets/ytsaurus';
import type {YtsaurusEngineSettings, QuerySettingsValue} from '@gravity-ui/querieskit';

const [settings, setSettings] = useState<QuerySettingsValue<YtsaurusEngineSettings>>({
  queryName: '',
  access: 'private',
  ytOperationTitle: '',
  tokenIds: [],
  attributes: [],
  custom: {yqlVersion: 'stable'}, // Application-supplied default.
});
const engines = createYtsaurusQueryEngines({
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

Use `renderSettingsSections` on an engine for separate sections after Attributes, followed by the application's `settingsProps.renderCustomSections`. Both callbacks receive the same context as their field counterparts. The YTsaurus preset uses this slot for the SPYT JSON configuration with Save and Cancel actions.

The editor never resets settings when engine or cluster changes. The application owns loading, defaults, validation, and any reset/migration in `onEngineChange` or `onClusterChange`. Settings changes use `settingsProps.onChange`; the editor's `onChange` remains text-only. Closing the panel keeps its content mounted.

For a completely custom panel, use `settings={<YourSettings />}` instead. `settings` and `settingsProps` are mutually exclusive; the raw slot does not automatically render engine fields. Without either prop, the panel contains its heading and close action. The panel owns heading, closing and resizing in both modes.

See [QuerySettings validation examples](../QuerySettings/README.md). The editor's existing Run button remains the only built-in execution action.

### YTsaurus engine preset

`createYtsaurusQueryEngines<TCustom extends YtsaurusEngineSettings>()` returns ordinary engine descriptions, which can be filtered, extended or combined with application engines. Options `engines` selects their order; the default order is YQL, CHYT, SPYT, YT QL.

| Engine | Field                                                 | Custom value     |
| ------ | ----------------------------------------------------- | ---------------- |
| YQL    | Version, only when `yql.versions` is nonempty         | `yqlVersion`     |
| CHYT   | Clique, with operation state/health                   | `clique` (alias) |
| SPYT   | Discovery path unless `spyt.connectAvailable` is true | `discoveryGroup` |
| YT QL  | No additional field                                   | —                |

Supply already-loaded options for the selected cluster. CHYT cliques use `{alias, operationId?, state?, health?, disabled?}`; discovery groups use `{path, title?, disabled?}`. Loading and empty states are explicit. The preset makes no requests, selects no defaults and includes no SPYT Connect JSON editor.

These are form values, not a backend request schema. At submission, the application maps `yqlVersion` to `yql_version`, `discoveryGroup` to `discovery_group` and `clique` to the backend clique setting, including only fields appropriate for the selected engine. General settings, tokens and attributes also need the application's API adapter.

This factory is separate from `createQueryEditorPreset`: that helper configures Monaco language services, completion and navigation; this factory configures the engine list and settings controls.

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

`QueryEditorPanel` is `'settings' | 'attachments' | null`. A controlled parent must update the corresponding prop in response to its callback; prop updates do not emit events. Panel and width control are independent.

The shared preferred width is retained across closing and switching panels; the displayed width is constrained to available space. Panels have a minimum width of 240 px and the editor 320 px. A narrower container scrolls horizontally. Drag the separator or focus it and press the arrow keys to resize in 16 px steps (64 px with Shift); Home and End select the minimum and maximum width.

This API replaces the previous settings-specific visibility and width props without compatibility aliases.

## Composition with QueryTabs

The `WithQueryTabs` story demonstrates application-owned tabs, text and selection state. Each editor stays mounted under a stable tab ID while inactive wrappers are hidden, preserving its cursor and Undo history. Removing the tab unmounts its editor and releases its Monaco resources. Keeping many tabs mounted has a memory cost; this module provides no model registry or eviction policy.

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
