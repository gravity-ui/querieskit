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

The application owns parsing `DECLARE`, adapting engine-specific types and values, persisting changes, and updating the controlled `value`. This module neither reads nor rewrites the query text. Optional panel controls provide a title, expand/collapse button and close button; the application owns panel placement and sizing.

| Prop                             | Purpose                                                                   |
| -------------------------------- | ------------------------------------------------------------------------- |
| `value`                          | The controlled collection, including any deleted entries.                 |
| `onChange(nextValue)`            | Called on Save or Remove all; may return a promise.                       |
| `onUpdate()`                     | Optional refresh request; the application supplies the refreshed `value`. |
| `errors`                         | External field errors indexed by parameter ID.                            |
| `disabled`                       | Disables mutations.                                                       |
| `loading`                        | Indicates an external operation and blocks mutations.                     |
| `expanded`                       | Host panel expansion state; defaults to `false`.                          |
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

## QueryEditor integration

Pass `parametersProps={{value, onChange: setValue}}` to the
[QueryEditor widget](../../widgets/QueryEditor/README.md#parameters) to use this form
in its resizable side panel. The editor owns the panel heading and close action
and keeps the form mounted when panels are switched or closed. Parsing query text
and persisting parameters remain the application's responsibility. Use
`parameters={<CustomParameters />}` for custom content instead; `parameters` and
`parametersProps` are mutually exclusive.

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
cancel or refresh parameters. Editing uses two columns when the available panel
width is at least 720 px, independently of `expanded`; narrower containers retain
the stacked layout. View mode always keeps headings above values. Parameter spacing
is 20 px in both modes, so expanding a panel does not change view-mode spacing. The ApplicationLayout story demonstrates a sidebar expanding across the
query workspace, closing and reopening without remounting.

## Types and values

The supported types are UI schemas rather than query-engine wire types:

| Type                                                                   | Schema                                           | Value                                            |
| ---------------------------------------------------------------------- | ------------------------------------------------ | ------------------------------------------------ |
| String, Utf8, Uuid                                                     | `{kind: 'String'}` (or the corresponding kind)   | String                                           |
| Number, Decimal, Double, DyNumber, Float                               | `{kind: 'Decimal'}` (or the corresponding kind)  | Numeric text, preserving precision               |
| Int8, Int16, Int32, Int64, Uint8, Uint16, Uint32, Uint64               | `{kind: 'Int64'}` (or the corresponding kind)    | Integer text, preserving precision               |
| Interval, Interval64                                                   | `{kind: 'Interval'}` (or `Interval64`)           | Duration text, e.g. `PT1M30S`                    |
| Date, Date32, Datetime, Datetime64, Timestamp, Timestamp64             | `{kind: 'Date'}` (or the corresponding kind)     | Date/time text                                   |
| TzDate, TzDate32, TzDatetime, TzDatetime64, TzTimestamp, TzTimestamp64 | `{kind: 'TzDate'}` (or the corresponding kind)   | Date/time text with a time zone                  |
| Bool                                                                   | `{kind: 'Bool'}`                                 | Boolean                                          |
| Json, JsonDocument, Yson                                               | `{kind: 'Json'}` (or the corresponding kind)     | JSON document text                               |
| Enum                                                                   | `{kind: 'Enum', options: ['red', 'green']}`      | One of the option strings                        |
| Optional                                                               | `{kind: 'Optional', item: type}`                 | `null`, internal NULL marker, or item value      |
| Pg                                                                     | `{kind: 'Pg', name: 'text'}`                     | String or `null`                                 |
| List                                                                   | `{kind: 'List', item: type}`                     | `[{id, value}]`                                  |
| Tuple                                                                  | `{kind: 'Tuple', items: [type, ...]}`            | `[{id, value}]`, in schema order                 |
| Struct                                                                 | `{kind: 'Struct', fields: [{id, name, type}]}`   | `[{id, value}]`, with IDs matching schema fields |
| Variant                                                                | `{kind: 'Variant', options: [{id, name, type}]}` | `{optionId, value}`                              |
| Dict                                                                   | `{kind: 'Dict', key: type, value: type}`         | `[{id, key, value}]`                             |
| Unknown                                                                | `{kind: 'Unknown', name: 'CustomType'}`          | Raw JSON text                                    |

Collections, structs, optional values and variants can nest. Numbers remain strings,
including values outside JavaScript's safe integer range. JSON documents also remain
strings, rather than being converted to JavaScript objects. Decimal optionally accepts
`precision` and `scale`. Integer kinds require integer text, and unsigned kinds
reject negative values. Engine-specific numeric ranges and type combinations remain
the application's responsibility.

Date values use `YYYY-MM-DD`; Datetime adds `THH:mm:ssZ`, and Timestamp additionally
accepts fractional seconds up to 6 digits. The `Z` suffix is mandatory for Datetime
and Timestamp. Extended types support negative and longer years. The form checks
format and calendar validity; engine-specific date ranges remain the application's responsibility.
Date and Datetime use a UTC date picker (Datetime includes time to seconds).
Incoming values that the picker cannot represent remain editable as text.
Extended date types and Timestamp retain text input with a calendar; calendar
selection changes only the date portion and preserves the time suffix and microseconds.
Interval values use duration text such as `PT1M30S`, `-P1D` or `PT0.123456S`:
weeks, days, hours, minutes and seconds are accepted; calendar years/months and empty
durations are not. New intervals default to `PT0S`. Tz types and Utf8 are unchecked
text fields without a calendar. Uuid requires hexadecimal groups of `8-4-4-4-12`
characters without a UUID version restriction.

Json, JsonDocument and Yson all require JSON input, preserving the original text
and large numeric literals. Editing uses an inline Monaco editor loaded on demand,
with no plain textarea or separate document dialog. Changes update the form draft;
invalid JSON stays visible and blocks Save until corrected. Read mode syntax
highlights the original document, with plain text as the loading/error fallback.
Bool uses True/False segments; Enum uses the schema's option list.

**Compatibility:** adapters supplying integer microseconds for Interval/Interval64
must convert them to duration text before passing values to the form. Adapters
supplying YSON syntax must supply JSON text for Yson. These UI representations do
not define an engine wire format.

### Nullable values

Only Optional and Pg are nullable. A contiguous chain of Optional wrappers plus a
terminal Pg defines its nullable levels. `null` means the outermost NULL; the public
`QueryParameterNullLevel` marker `{kind: 'optional-null', depth: number}` identifies
an inner NULL. Depth is an integer starting at 1 and must fit the schema.

For `Optional<Optional<Int32>>`, values include:

```ts
null                                  // outer Optional is absent
{kind: 'optional-null', depth: 1}       // outer present, inner Optional absent
'42'                                  // both present
```

For `Optional<Pg>`, depth 1 means the outer Optional is present and Pg is NULL.
The UI has one NULL switch and a level selector when several levels exist; selector
labels are 1-based, so level 1 corresponds to `null`. Scalar NULL shows an empty,
disabled control; container NULL hides its body. The switch restores the previous
value and any unfinished RAW/escaped input. Inactive draft errors do not block
saving NULL, but become active again when that draft is restored. Reset restores
the snapshot value and NULL level; Cancel, schema changes and successful saving
clear corresponding editor drafts.

### Unknown types

An adapter must explicitly represent unsupported engine types as
`{kind: 'Unknown', name: 'CustomType'}`. This keeps the original type name without
accepting arbitrary `kind` strings or hiding malformed known schemas. Unknown is
not offered in the new-type picker. Its value is raw JSON text: whitespace and
large numeric literals remain intact, but invalid JSON blocks Save. When embedded
in a container's RAW representation, that text is a JSON string, just like a document
leaf.

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

RAW edits a JSON representation adapted to the declared UI schema: List and Tuple use arrays of values, Struct uses an object keyed by field names, Dict uses arrays of `[key, value]` pairs, and Variant uses `{optionId, value}`. Optional uses `null`, the internal NULL marker, or its item representation; Bool uses a boolean, and Pg uses a string or `null`. Collection item IDs are managed internally and omitted from RAW. It is not an engine serialization format; numeric, date/time, document and Unknown leaves still use string values. For example, `List<Int64>` uses `["9007199254740993"]`. Internal NULL markers round-trip through RAW; the application must translate them to its engine representation. RAW and escaped-value editing happen inline, without separate Apply/Cancel actions. Valid text immediately updates the local form draft; invalid text stays visible and blocks Save until corrected or reset. RAW switches are available for String and structured collections; other scalar editors use their typed controls. String and Pg share the escaped-text toggle. It is a reversible text representation using escapes such as `\xNN` and `\uNNNN`, not byte-oriented hex or a backend binary encoding. This is the agreed exception to the design's text/hex wording.

## Deletion

Deleting a previously saved parameter marks it `deleted: true` in the draft. Save commits that change through `onChange`. Deleting a parameter created in the same editing session removes it from the draft entirely.

The Deleted tab displays entries marked `deleted`. Its Remove all action immediately calls `onChange` with those entries removed; it does not require a subsequent Save. The application determines what that removal means for persisted query data. Deleted parameters are excluded from active-name uniqueness validation.

## Validation

The form validates required, unique active names and the shape of values against their schemas. Names must contain at least one non-whitespace character. The form imposes no character or first-character restrictions; engine-specific naming rules belong to the application. The application translates server errors into readable messages and handles server-side type restrictions, including DyNumber support. External errors display application-specific validation messages; they do not independently block Save. The application must reject `onChange` when its own validation fails. Use parameter IDs and stable value paths rather than row positions:

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

Storybook includes AllTypes (the 42 Figma examples plus nested Optional, Optional<Pg> and Unknown, in three independent columns: view, full-width editing, and default-width editing), WidthBoundaries (editing at 719/720/721 px with `expanded=false`), Default (basic schemas, nested values and a deleted parameter), Empty (creation from scratch), ExternalErrors (application validation messages), and ApplicationLayout (sidebar expansion within a query workspace). The basic examples also include an expand/collapse control. Use Edit in the form to explore editing. Story args configure width, disabled/loading states and rejected saves; the shared Storybook toolbar selects the theme. The application's library locale applies to the module.
