# QueryAttributesEditor

A standalone controlled attribute list with local Apply/Cancel drafts. It has no knowledge
of query settings, engines, stores, backend dictionaries or persistence.

```tsx
import {QueryAttributesEditor} from '@gravity-ui/querieskit/modules/QueryAttributesEditor';

<QueryAttributesEditor
  items={attributes}
  onChange={(nextItems, operations) => setAttributes(nextItems)}
  checkDuplicateAttributeKeys
/>
```

Rows are `{id, key, value}`. Keep `id` stable when renaming a key; use a component `key`
to reset unfinished drafts when changing the edited resource. New unfinished rows do not
emit changes. Apply emits the complete next list and one transaction of operations
(`add`, `remove`, `rename`, `update-value`), identified by row ID. A combined rename/value
edit emits one callback. External controlled updates never emit changes.

Non-string values require `attributeCodec: {format, parse}`. Invalid parsing keeps the
draft open. Unchanged text and key-only renames preserve the original value and reference.
`validateAttribute`, `getAttributePermissions`, duplicate-key validation, `errors` keyed
by row ID, and `onFieldBlur` work without a surrounding form. External changes to a row
replace its draft; unrelated updates preserve it. Errors from parsing and draft validation
prevent Apply; external errors are display-only. The application owns async persistence
and reports rejected saves through its controlled data/error props.

The list preserves input order and supports duplicate keys unless validation is enabled.
It intentionally accepts stable-ID rows rather than a dictionary, which cannot express
row identity, order and duplicate keys reliably.

The attribute, codec, permissions and error types live in `types/queryAttributesEditor`
and are exported by this module. The original `QuerySettingsAttribute*` names remain
available from QuerySettings as compatibility re-exports; this editor has no type
dependency on the aggregate settings form.
