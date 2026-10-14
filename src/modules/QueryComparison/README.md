# QueryComparison

A module for comparing a list of text blocks, such as query code and serialized
configuration. It can be placed inside a tab panel; it does not own tabs, version
loading, saving, or query creation.

```tsx
import {QueryComparison} from '@gravity-ui/querieskit/modules/QueryComparison';
import type {QueryComparisonItem} from '@gravity-ui/querieskit';

const [items, setItems] = useState<QueryComparisonItem[]>([
  {id: 'query', title: 'query.sql', language: 'yql', original: 'SELECT 1;', modified: 'SELECT 2;'},
]);

<div style={{height: 800}}>
  <QueryComparison
    items={items}
    onBlockChange={(id, modified) =>
      setItems((current) => current.map((item) => (item.id === id ? {...item, modified} : item)))
    }
  />
</div>;
```

Supply stable, unique IDs. `original` is immutable; `modified` is the controlled
working copy. The callback reports typing, undo/redo and Monaco's transfer of
changes from left to right. External value updates do not emit change callbacks.
Omit `onBlockChange` or set `readOnly` for a viewer.

`null` means an absent file, while `''` is an existing empty file. Added files offer
Remove file; deleted files offer Restore file. These actions emit `null` or the
original text respectively. Clearing an existing file by typing keeps it present.
Restore a deleted file before editing it. The application serializes configuration
and decides how files in different versions correspond to each other.

The module provides Split/Unified switching (`mode`, `defaultMode`,
`onModeChange`) and per-block collapse. Split is the default; all blocks initially
expand. Collapse retains the editor and undo history. Removing a block disposes
its editor and models. A changed ID starts a new editor session; retain IDs for
ordinary edits and use new IDs when a version switch should reset session state.

Line counters show additions on the right and removals on the left. Replacements
count in both. Whitespace is significant. An ellipsis means comparison is pending
or unavailable, rather than zero changes.

Give the parent a bounded height. The list scrolls; individual editors grow with
their content up to `maxBlockHeight` (600 pixels by default), then scroll internally.

## Version selection and actions

The built-in toolbar follows the design: Baseline, swap, Competitor on the left;
Split/Unified, reset, save and Create Query on the right.

```tsx
<QueryComparison
  items={items}
  onBlockChange={updateDraft}
  versionSelection={{
    options: versions.map((version) => ({id: version.id, title: version.title})),
    originalId,
    modifiedId,
    onChange: ({originalId, modifiedId}) => selectVersions(originalId, modifiedId),
  }}
  actions={{
    hasChanges,
    onReset: resetDraft,
    onSave: saveDraft,
    onCreateQuery: createQueryFromDraft,
    pendingAction, // 'save' | 'create' | undefined
  }}
/>
```

Version IDs and options are controlled. Include all selectable query versions in
`options`, using titles that distinguish both the query and its version. Choosing
one side preserves the other ID. Swap sends one callback with the two IDs exchanged;
swapping identical IDs is disabled. The application loads the requested pair and
supplies updated `items`; the module does not change drafts before the application
accepts the request. Confirmation of unsaved-change loss also belongs to the application.

Reset restores the selected **modified** version, not the original side. Reset and
save require `hasChanges: true` and their callbacks. Create Query requires its
callback and can also create a copy of an unchanged version. Buttons without
callbacks remain visible but disabled. During `pendingAction`, the corresponding
button shows a loader and actions plus version selection are disabled. Explicit
`actions.disabled` and `versionSelection.disabled` can disable these groups
independently. Callbacks perform no built-in persistence and receive no redundant
copy of the controlled data.

The legacy `header` slot replaces the left-hand version controls when supplied;
it does not replace the right-hand mode switch and actions. Omit `versionSelection`
for a standalone text comparison without selectors. The toolbar wraps on narrow
containers. See the interactive Storybook example for in-memory switching, swapping,
resetting, saving, and creating a query.

`MonacoDiffEditor` is also exported independently from
`@gravity-ui/querieskit/components/MonacoDiffEditor`. Configure Monaco workers as
for the existing `MonacoEditor` (see the Storybook preview). Language highlighting
depends on registered Monaco languages. Theme selection is global to Monaco;
use the same theme for editors sharing a page. Diff colors use Gravity UI tokens.
