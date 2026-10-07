# QueryEditor

A reusable module that combines a query toolbar, an editable Monaco editor, a footer and a resizable Settings placeholder. It does not execute, format, validate or save queries itself.

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
- `clusters` contains `{id, title, disabled?}` items. `engines` uses the same shape with an additional Monaco `language` ID. Selection is controlled by `clusterId` / `engineId` and their change callbacks. The application owns dependencies between these lists. Empty lists disable their selectors; a missing selected engine uses plain text.
- Run, Format and Validate are always visible. Their required callbacks receive no arguments; the application already owns the selected values and text. `actionStates` supplies `disabled` and `loading` independently for `run`, `format` and `validate`.
- `additionalActions` supplies `{id, title, onClick, disabled?}` menu items. The overflow button appears only for a nonempty list.
- `rightActions` supplies ordered buttons with the same fields plus a Gravity `Icon`-compatible `icon` and optional `loading`. Settings is always available.
- `onCodeAssistantClick` adds a footer button. The footer remains present without it.
- `readOnly` controls text editing. `editorOptions` accepts Monaco configuration except for model, value, language, theme, readOnly and automaticLayout, which the module owns.

Public types, including `QueryEditorProps`, `QueryEditorCluster`, `QueryEditorEngine` and action types, are exported from the package root and the module entrypoint.

## Settings

Settings is a placeholder with a heading and close button. It contains no settings form or persistence layer.

Visibility and width each support independent controlled or uncontrolled usage:

| State           | Controlled prop | Initial uncontrolled prop       | Change callback         |
| --------------- | --------------- | ------------------------------- | ----------------------- |
| Visibility      | `settingsOpen`  | `defaultSettingsOpen` (false)   | `onSettingsOpenChange`  |
| Preferred width | `settingsWidth` | `defaultSettingsWidth` (320 px) | `onSettingsWidthChange` |

A controlled parent must update the corresponding prop in response to its callback. The preferred width is retained across closing and reopening; the displayed width is constrained to available space. Settings has a minimum width of 240 px and the editor 320 px. A narrower container scrolls horizontally. Drag the separator or focus it and press the arrow keys to resize in 16 px steps.

## Composition with QueryTabs

The `WithQueryTabs` story demonstrates application-owned tabs, text and selection state. Each editor stays mounted under a stable tab ID while inactive wrappers are hidden, preserving its cursor and Undo history. Removing the tab unmounts its editor and releases its Monaco resources. Keeping many tabs mounted has a memory cost; this module provides no model registry or eviction policy.

The application computes `isModified` by comparing the current text with the saved baseline. `QueryTabs.onCloseTab` requests closure: the application may show a confirmation modal before removing the tab. Cancelling leaves the editor mounted and its state intact. Saving updates the baseline. If cluster or engine changes also count as unsaved work in your product, include them in that comparison.

Query results, assistant content, actual settings, tab persistence and navigation-away protection belong to the consuming application or a future widget.
