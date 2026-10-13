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

The application owns parsing `DECLARE`, adapting engine-specific types and values, persisting changes, and updating the controlled `value`. This module neither reads nor rewrites the query text. It does not yet integrate with QueryEditor. Optional panel controls provide a title, expand/collapse button and close button; the application owns panel placement and sizing.

| Prop                             | Purpose                                                                   |
| -------------------------------- | ------------------------------------------------------------------------- |
| `value`                          | The controlled collection, including any deleted entries.                 |
| `onChange(nextValue)`            | Called on Save or Remove all; may return a promise.                       |
| `onUpdate()`                     | Optional refresh request; the application supplies the refreshed `value`. |
| `errors`                         | External field errors indexed by parameter ID.                            |
| `disabled`                       | Disables mutations.                                                       |
| `loading`                        | Indicates an external operation and blocks mutations.                     |
| `expanded`                       | Controlled expanded presentation; defaults to `false`.                    |
| `onExpandedChange(nextExpanded)` | Shows the expand/collapse button and requests a layout change.            |
| `onClose()`                      | Shows the close button and requests that the host hide the panel.         |
| `className`                      | Positions the module within the host layout.                              |

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

## Expanded panel

Pass `expanded` and `onExpandedChange` to show the expand/collapse control. The
header appears when `onExpandedChange` or `onClose` is provided. The module requests
a change; the host updates `expanded` and gives the panel the available workspace.
This does not use the browser Fullscreen API or create a modal: query tabs and
application navigation can remain visible.

Keep the same `QueryParameters` instance mounted in the same position in the React
tree while changing its container's width. Do not switch between separately rendered
sidebar and expanded instances or change its `key`: remounting loses local edits,
invalid RAW text and collection expansion state.

```tsx
const [expanded, setExpanded] = useState(false);
const [open, setOpen] = useState(true);

// Place this stable container inside the workspace beneath the query tabs.
<div hidden={!open} style={{width: expanded ? '100%' : 460, maxWidth: '100%', height: '100%'}}>
  <QueryParameters
    value={value}
    onChange={setValue}
    expanded={expanded}
    onExpandedChange={setExpanded}
    onClose={() => {
      setOpen(false);
      setExpanded(false);
    }}
  />
</div>;
```

The host supplies an accessible action to reopen the panel and should move focus
there when closing it. Hiding the stable container preserves its editing session;
unmounting it intentionally discards local state. Expansion itself does not save,
cancel or refresh parameters. In expanded mode, sufficiently wide containers show
parameter headings and values in two columns; narrow containers retain the stacked
layout. The ApplicationLayout story demonstrates a sidebar expanding across the
query workspace, closing and reopening without remounting.

## Types and values

The supported types are UI schemas rather than query-engine wire types:

| Type                                                                   | Schema                                           | Value                                            |
| ---------------------------------------------------------------------- | ------------------------------------------------ | ------------------------------------------------ |
| String, Utf8, Uuid                                                     | `{kind: 'String'}` (or the corresponding kind)   | String                                           |
| Number, Decimal, Double, DyNumber, Float                               | `{kind: 'Decimal'}` (or the corresponding kind)  | Numeric text, preserving precision               |
| Int8, Int16, Int32, Int64, Uint8, Uint16, Uint32, Uint64               | `{kind: 'Int64'}` (or the corresponding kind)    | Integer text, preserving precision               |
| Interval, Interval64                                                   | `{kind: 'Interval'}` (or `Interval64`)           | Integer text                                     |
| Date, Date32, Datetime, Datetime64, Timestamp, Timestamp64             | `{kind: 'Date'}` (or the corresponding kind)     | Date/time text                                   |
| TzDate, TzDate32, TzDatetime, TzDatetime64, TzTimestamp, TzTimestamp64 | `{kind: 'TzDate'}` (or the corresponding kind)   | Date/time text with a time zone                  |
| Bool                                                                   | `{kind: 'Bool'}`                                 | Boolean                                          |
| Json, JsonDocument, Yson                                               | `{kind: 'Json'}` (or the corresponding kind)     | Document text                                    |
| Enum                                                                   | `{kind: 'Enum', options: ['red', 'green']}`      | One of the option strings                        |
| Optional                                                               | `{kind: 'Optional', item: type}`                 | `null` or a value of the item type               |
| Pg                                                                     | `{kind: 'Pg', name: 'text'}`                     | String or `null`                                 |
| List                                                                   | `{kind: 'List', item: type}`                     | `[{id, value}]`                                  |
| Tuple                                                                  | `{kind: 'Tuple', items: [type, ...]}`            | `[{id, value}]`, in schema order                 |
| Struct                                                                 | `{kind: 'Struct', fields: [{id, name, type}]}`   | `[{id, value}]`, with IDs matching schema fields |
| Variant                                                                | `{kind: 'Variant', options: [{id, name, type}]}` | `{optionId, value}`                              |
| Dict                                                                   | `{kind: 'Dict', key: type, value: type}`         | `[{id, key, value}]`                             |

Collections, structs, optional values and variants can nest. Numbers remain strings,
including values outside JavaScript's safe integer range. JSON documents also remain
strings, rather than being converted to JavaScript objects. Decimal optionally accepts
`precision` and `scale`. The application decides which engine-specific numeric ranges,
date/time formats, PostgreSQL types, YSON documents and type combinations to accept.
Integer kinds require integer text, and unsigned kinds reject negative values.
Json and JsonDocument require valid JSON; Yson remains application-validated text. Calendar selection changes only the date portion; manual input, fractional seconds and timezone suffixes remain exact.

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

List values use compact nested rows. Tuple is unbordered in view mode. Tuple, Struct, Variant and Dict use bordered groups while editing. Variant displays all options with radio controls and disables the inactive editors. Inactive branch drafts are retained within the editing session so switching back restores the entered value; only the active branch is included in the exported parameter.

RAW edits a JSON representation adapted to the declared UI schema: List and Tuple use arrays of values, Struct uses an object keyed by field names, Dict uses arrays of `[key, value]` pairs, and Variant uses `{optionId, value}`. Optional uses `null` or its item representation, Bool uses a boolean, and Pg uses a string or `null`. Collection item IDs are managed internally and omitted from RAW. It is not an engine serialization format; numeric, date/time and document leaves still use string values. RAW and escaped-value editing happen inline, without separate Apply/Cancel actions. Valid text immediately updates the local form draft; invalid text stays visible and blocks Save until corrected or reset. RAW switches are available for String and structured collections; other scalar editors use their typed controls. The escaped string view is a reversible text representation, not a backend binary encoding or a bytes codec.

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

Value paths start at `$`. List and tuple children use `$/item-id`; struct fields use `$/field-id`; dictionary fields use `$/entry-id/key` and `$/entry-id/value`; variant contents use `$/option-id`. Append segments for nested values. Each parameter error can also contain `name` and `type` messages.

## Examples

Storybook includes AllTypes (the 42 Figma examples in three independent columns: view, full-width editing, and default-width editing), Default (basic schemas, nested values and a deleted parameter), Empty (creation from scratch), ExternalErrors (application validation messages), and ApplicationLayout (sidebar expansion within a query workspace). The basic examples also include an expand/collapse control. Use Edit in the form to explore editing. Story args configure width, disabled/loading states and rejected saves; the shared Storybook toolbar selects the theme. The application's library locale applies to the module.
