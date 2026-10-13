# QueryParameters

A controlled form for creating and editing query parameters. Pass an empty array to start a new parameter list, or structured parameters from an existing query. There is no `create`/`edit` data mode. The form has a separate view/edit interaction with a local draft and explicit Save. Cancel editing is available in the Editing actions overflow menu.

```tsx
import React, {useState} from 'react';
import {QueryParameters, type QueryParameter} from '@gravity-ui/querieskit';

export function ParametersForm() {
  const [value, setValue] = useState<QueryParameter[]>([]);

  return <QueryParameters value={value} onChange={setValue} />;
}
```

## Data and persistence

Every parameter has a stable `id`, a `name` without the leading `$`, a `type`, and a `value`. Keep IDs stable when updating external data. Collection items, dictionary entries and variant options also have stable IDs.

The application owns parsing `DECLARE`, adapting engine-specific types and values, persisting changes, and updating the controlled `value`. This module neither reads nor rewrites the query text. It does not yet integrate with QueryEditor and has no host-panel title, close button or resize behavior.

| Prop                  | Purpose                                                                   |
| --------------------- | ------------------------------------------------------------------------- |
| `value`               | The controlled collection, including any deleted entries.                 |
| `onChange(nextValue)` | Called on Save or Remove all; may return a promise.                       |
| `onUpdate()`          | Optional refresh request; the application supplies the refreshed `value`. |
| `errors`              | External field errors indexed by parameter ID.                            |
| `disabled`            | Disables mutations.                                                       |
| `loading`             | Indicates an external operation and blocks mutations.                     |
| `className`           | Positions the module within the host layout.                              |

On Edit, the form takes a snapshot and creates a local draft. Save validates that draft and awaits `onChange`. The parent must update `value` when accepting a change. A rejected promise preserves the draft and displays a generic error; Cancel discards the draft. Do not persist on every field keystroke through `onChange`—it represents application of the whole collection.

For asynchronous persistence, update state after the operation succeeds:

```tsx
<QueryParameters
  value={value}
  onChange={async (nextValue) => {
    await saveParameters(nextValue);
    setValue(nextValue);
  }}
  onUpdate={async () => {
    setValue(await loadParameters());
  }}
/>
```

External changes during editing create a conflict. Save is blocked until the user explicitly reloads the external version, discarding the draft, or cancels editing. The editing footer provides Save and Update. Update asks for confirmation during editing and discards the draft only after `onUpdate` succeeds; a rejected refresh preserves the draft and shows an error. Reset actions restore only the corresponding value or nested group from the snapshot taken on entry to editing; they do not change the parameter name or type.

## Types and values

The supported types are UI schemas rather than query-engine wire types:

| Type    | Schema                                           | Value                              |
| ------- | ------------------------------------------------ | ---------------------------------- |
| String  | `{kind: 'String'}`                               | String                             |
| Number  | `{kind: 'Number'}`                               | Numeric text, preserving precision |
| Json    | `{kind: 'Json'}`                                 | JSON document text                 |
| List    | `{kind: 'List', item: type}`                     | `[{id, value}]`                    |
| Tuple   | `{kind: 'Tuple', items: [type, ...]}`            | `[{id, value}]`, in schema order   |
| Variant | `{kind: 'Variant', options: [{id, name, type}]}` | `{optionId, value}`                |
| Dict    | `{kind: 'Dict', key: type, value: type}`         | `[{id, key, value}]`               |

Collections and variants can nest. Numbers remain strings, including values outside JavaScript's safe integer range. JSON documents also remain strings, rather than being converted to JavaScript objects. The application decides which engine-specific numeric ranges and type combinations to accept.

For `List<List<String>>`, use `{kind: 'List', item: {kind: 'List', item: {kind: 'String'}}}`.
In the name/type dialog, select List for Parameter type and Item type, then String
for the nested Item type. Each Add button appends an item to its own list: the
outer button creates an empty list, and the inner button creates a string.
The Default story demonstrates this with `$groups` alongside the simple `$tags` list.

```tsx
const initialParameters: QueryParameter[] = [
  {id: 'limit', name: 'limit', type: {kind: 'Number'}, value: '9007199254740993'},
  {
    id: 'regions',
    name: 'regions',
    type: {kind: 'List', item: {kind: 'String'}},
    value: [{id: 'region-1', value: 'Europe'}],
  },
];
```

Rows keep compact name/type headings while values are edited. Use the row overflow menu to edit the name and type in a separate dialog. Add parameter opens the same dialog; cancelling creation discards the new parameter. Explicitly applying a changed schema resets the value to a default for the new schema. Closing the dialog without applying leaves the existing draft unchanged.

List values use compact nested rows. Tuple, Variant and Dict use bordered groups. Variant displays all options with radio controls and disables the inactive editors. Inactive branch drafts are retained within the editing session so switching back restores the entered value; only the active branch is included in the exported parameter.

RAW edits a JSON representation adapted to the declared UI schema: List and Tuple use arrays of values, Dict uses arrays of `[key, value]` pairs, and Variant uses `{optionId, value}`. Collection item IDs are managed internally and omitted from RAW. It is not an engine serialization format; Number and Json leaves still use string values. RAW and escaped-value editing happen inline, without separate Apply/Cancel actions. Valid text immediately updates the local form draft; invalid text stays visible and blocks Save until corrected or reset. Number and Json editors do not have a RAW switch. The escaped string view is a reversible text representation, not a backend binary encoding or a bytes codec.

## Deletion

Deleting a previously saved parameter marks it `deleted: true` in the draft. Save commits that change through `onChange`. Deleting a parameter created in the same editing session removes it from the draft entirely.

The Deleted tab displays entries marked `deleted`. Its Remove all action immediately calls `onChange` with those entries removed; it does not require a subsequent Save. The application determines what that removal means for persisted query data. Deleted parameters are excluded from active-name uniqueness validation.

## Validation

The form validates required, unique active names and the shape of values against their schemas. Names must contain at least one non-whitespace character. The form imposes no character or first-character restrictions; engine-specific naming rules belong to the application. External errors display application-specific validation messages; they do not independently block Save. The application must reject `onChange` when its own validation fails. Use parameter IDs and stable value paths rather than row positions:

```tsx
<QueryParameters
  value={value}
  onChange={setValue}
  errors={{
    limit: {value: {$: 'The server limit is 1000000.'}},
    regions: {
      name: 'This name is reserved.',
      value: {'$/region-1': 'This region is unavailable.'},
    },
  }}
/>
```

Value paths start at `$`. List and tuple children use `$/item-id`; dictionary fields use `$/entry-id/key` and `$/entry-id/value`; variant contents use `$/option-id`. Append segments for nested values. Each parameter error can also contain `name` and `type` messages.

## Examples

Storybook has three examples: Default (all seven types, nested values and a deleted parameter), Empty (creation from scratch), and ExternalErrors (application validation messages). Use Edit in the form to explore editing. Story args configure width, disabled/loading states and rejected saves; the shared Storybook toolbar selects the theme. The application's library locale applies to the module.
