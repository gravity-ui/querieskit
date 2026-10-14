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
`header` accepts application-owned version selectors and actions. The application
owns drafts, save/reset/create callbacks, loading states and unsaved-change prompts.

`MonacoDiffEditor` is also exported independently from
`@gravity-ui/querieskit/components/MonacoDiffEditor`. Configure Monaco workers as
for the existing `MonacoEditor` (see the Storybook preview). Language highlighting
depends on registered Monaco languages. Theme selection is global to Monaco;
use the same theme for editors sharing a page. Diff colors use Gravity UI tokens.
