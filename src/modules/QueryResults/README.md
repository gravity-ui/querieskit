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
