# Standard result cells

`QueryResults`, `QueryResultsTable`, `NavigationPreview.view`, and the `result`
tab of `QueryExecutionPanel` accept the same cell options. Values remain in YQL wire format; QueriesKit handles
Unipika conversion, HTML, copying, local expansion, and preview actions.
`column.render` replaces this entire pipeline, including `getCellOptions`.

`QueryResultsTableSettings<Row>` also shares `rowKey`, `displayIndices`,
`stripedRows`, and `stickyHead` between results and navigation. Navigation keeps
row indices off by default; results keep them on. See the
[NavigationPreview migration guide](../NavigationPreview/README.md) for typed
columns and settings passed directly or through `createTableDetailConfig`.

## YTsaurus integration

Keep legacy metadata separately from the wire values. Map `$incomplete` to
`isIncomplete`, `$tagValue` to `tag`, and `$rawValue` to `copyText`; do not pass the
previously generated HTML as a value. The application decides whether URL copying
uses the label or the href by passing the desired literal `copyText`.

```tsx
import {QueryResults} from '@gravity-ui/querieskit/modules/QueryResults';
import type {QueryResultCellOptions, QueryResultCellPreviewContext} from '@gravity-ui/querieskit';

type Row = {id: string; value: unknown};
type LegacyCellMetadata = {
  $incomplete?: boolean;
  $tagValue?: string;
  $rawValue?: string;
  loaded?: boolean;
};

function cellOptions(metadata: LegacyCellMetadata): QueryResultCellOptions {
  return {
    isIncomplete: metadata.$incomplete,
    tag: metadata.$tagValue,
    copyText: metadata.$rawValue,
    ...(metadata.loaded
      ? {formatterSettings: {maxListSize: undefined, maxStringSize: undefined}}
      : {}),
  };
}

// rows, columns, metadataByCell, and handlePreview belong to the application.
<QueryResults<Row>
  columns={columns}
  rows={rows}
  rowKey={(row) => row.id}
  maxVisibleLines={5}
  collapseAfterLines={8}
  maxInlineTextLength={10000}
  formatterSettings={{maxListSize: 50, treatValAsData: true}}
  getCellOptions={({row, column}) => cellOptions(metadataByCell[row.id]?.[column.name] ?? {})}
  onCellPreview={handlePreview}
/>;
```

Enable `treatValAsData` for web-json wrappers such as
`{val: 'partial text', inc: true}` or `{val: 'AP8=', b64: true}`. Plain YQL
wire values remain supported. Supply the original YQL type in each column.

## Preview ownership and lifecycle

The callback has the signature
`(context: QueryResultCellPreviewContext<Row>) => void | Promise<void>`.
Its context contains `row`, `value`, `index`, `column`, `isIncomplete`, and `tag`.
The application owns requests, cancellation, metadata, and modal windows:

- For inline loading (for example, audio or images), fetch the remaining value,
  replace the corresponding row immutably, set `isIncomplete: false`, and remove
  formatter limits for that cell using explicit `undefined` as above.
- For modal preview, open an application-owned dialog. A complete large value
  produces `isIncomplete: false`; no fetch is required unless the application
  needs other data.
- Returning successfully without updating props leaves the original value in
  place. QueriesKit does not cache a second copy of the data.
- While a returned Promise is pending, the cell prevents duplicate preview
  calls. A thrown error or rejected Promise displays a local error and permits
  retry. Resolve normally if the application already handled an error itself.
- Completion of an outdated request cannot update a replaced or unmounted
  cell's UI. The application must still cancel requests or guard its own state
  updates when switching datasets.

Keep row keys stable. Use immutable row/value updates so the cell can reset
expansion and preview errors when its data changes. The `result` panel tab passes
these options through its existing `props` object.

## Formatting and action rules

Settings merge in this order: library defaults, table settings, cell settings.
An explicit `undefined` for `maxListSize` or `maxStringSize` removes that limit.
Omitted metadata preserves Unipika's automatic detection, including nested
incompleteness. Explicit `isIncomplete: false` overrides that detection, and
`copyText: ''` intentionally copies an empty string.

Copying uses the complete available text, regardless of line collapsing or the
HTML length limit. Incomplete values cannot be copied. If explicitly overriding
converter-induced incompleteness, the copy text is reconstructed without list
and string limits; server-truncated data cannot be recovered locally.

`maxVisibleLines` defaults to **5**. `collapseAfterLines` defaults to
`maxVisibleLines`; with **5/8**, up to eight lines remain visible and nine or more
collapse to five. Expanding a value is local and never calls preview.

`maxInlineTextLength` has **no default limit**. At or above the configured text
length, a placeholder replaces HTML; complete values still support copying and
preview. URL and `audio/`, `video/`, `image/` tags bypass this limit. Explicit
`copyText` does not affect the length decision.

Incomplete tagged values display a localized placeholder. Without
`onCellPreview`, the warning remains but no preview button appears. Actions are
available on hover and keyboard focus; placeholders and errors keep actions
visible. Conversion errors affect only their own cell.

## Storybook verification

`Modules/QueryResults` provides these examples, all without `column.render`:

- **Standard Cell Types**: optional/null, binary, collections, URL, incomplete
  strings and tagged images, plus a malformed collection isolated to one cell.
- **Collapse Boundaries**: five, eight, and nine formatted lines with 5/8 settings.
- **Inline Preview And Retry**: asynchronous row replacement, removal of the
  50-item formatter limit, a rejected request, and successful retry.
- **Inline Media Preview**: asynchronous image/audio replacement using local PNG
  and WAV fixtures; no external network or modal window is needed.
- **External Modal Preview**: large complete text and incomplete tagged values,
  with an application-owned dialog and unchanged table props after preview.

In a browser, use Tab to reach actions and Enter/Space to activate them. Check
that expansion and row replacement update row height and keep the sticky header
aligned while scrolling. Check light and dark themes. DOM-only tests do not
verify this geometry.

## Standard Schema view

Use `defaultView="schema"` (or controlled `view="schema"`) to inspect columns
without result rows. The standard view displays one-based indices, column names,
and expandable types. `displayIndices` and `stripedRows` default to `true`;
`stickyHead` defaults to `MOVING`. These settings apply to both Result and Schema;
`stickyHead={false}` disables the sticky header. Schema preserves column order
and does not sort. Names use `column.header ?? column.name`; long text names have
a tooltip via `title`, while React headers remain React content.

Existing YQL `column.type` values work automatically: optional depth and tags are
shown next to their type, parameters use parentheses, and nested containers have
independent expand controls. Dict with Void values is shown as Set, all-Void
variants as Enum, and PostgreSQL types use `pg`/`_pg` names. Optional and Tagged
wrappers do not add indentation levels. Tags retain inner-to-outer order.

For a schema from another source, pass the optional, public
`QueryResultSchemaType` description through `column.schemaType`:

```tsx
import type {QueryResultColumn, QueryResultSchemaType} from '@gravity-ui/querieskit';

const vector: QueryResultSchemaType = {
  name: 'Vector',
  parameters: [3],
  tags: ['spatial'],
  children: [{label: 'coordinates', type: {name: 'Real', optionalDepth: 1}}],
};
const columns: QueryResultColumn<{position: string}>[] = [
  {name: 'position', type: ['DataType', 'String'], schemaType: vector},
];
```

`name` is unrestricted. `parameters` accepts strings, numbers, booleans and null;
`optionalDepth` is the number of optional wrappers. `tags` and `children` preserve
input order; each child has a `type` and an optional `label`. `schemaType` takes
priority over the YQL adapter only in Schema. The required `column.type` still
controls Result value formatting, which is unchanged.

Complex nodes at depths 0 and 1 start expanded; deeper nodes start collapsed.
Expand controls support Tab, Enter and Space and expose `aria-expanded`.
Expansion survives ordinary rerenders, including equivalent new type objects,
and collapsing a parent. Replacing a row's schema resets that row's expansion;
neighbouring rows retain their state. Persistence after unmount is not guaranteed.
Unknown tuple kinds display safe text. Damaged nodes display `Unknown` with a
focusable information control: hover or focus it to see the source value in a
tooltip. Healthy siblings continue rendering.

`renderSchema` still replaces the standard renderer; returning `null` or
`undefined` uses the standard view. Loading, empty and error states are unchanged.
Schema completeness depends on the supplied `columns`: excluded columns cannot
be reconstructed by the library.

Storybook examples **Schema Acceptance**, **Schema Type Families**, **Schema Resize
And Scroll**, **Schema Updates**, and **Schema Without Table Decorations** cover
optional primitives, modifiers, all container families, neutral types, malformed
children, depth-four nesting, long names, scroll/resize, state preservation and
settings. Use Storybook's theme control to check light and dark themes. Expand
types before and after resizing and verify sticky header alignment. The real panel
integration is **Widgets/QueryExecutionPanel/Schema / Default Schema**.
