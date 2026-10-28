# Integration simplification: migration guide

## Release boundary

The layout changes below require a **major release**. Do not publish this change
as a compatible patch/minor. Other APIs are opt-in and preserve existing custom
renderers, callbacks and string settings.

## Dashboard layout

`Dashboard` and `DashboardCharts` now match `layout.i` to `item.id`, never array
position. Fix saved IDs before migrating. `defaultLayout` initializes uncontrolled
state only; later prop changes do not replace the user's layout. Applications
restoring or persisting layout must use controlled `layout` and apply changes in
`onLayoutChange`. External layout changes and item reconciliation do not emit
callbacks; user drag/resize does. New items are appended below occupied positions;
removed IDs are discarded from active layout.

```tsx
<DashboardCharts
  {...chartProps}
  layout={configuration.layout}
  onLayoutChange={(layout) => updateConfiguration({...configuration, layout})}
/>
```

Persist chart definitions rather than generated series. Use the definition-based
DashboardCharts mode to retain unavailable charts and their positions. Storage,
authorization, retries, cross-result merging and annotation envelopes remain in
the application. Convert an existing application's saved format explicitly into
the library definition format; do not reinterpret its envelope version.

## Results and editor

Move result column filtering and standard FieldsSelector/Load more UI into
`columnVisibility` and `pagination`. Supply the full schema; `undefined` selection
means all current columns and `[]` means no columns. Keep downloading and backend
links in `actions`. Pagination loading is independent of initial loading.

Use `getCellType` for heterogeneous values instead of replacing the standard cell.
Keep raw backend decoding and special renderers in the adapter. Resolve types from
the row, not from its display index, because filtering changes row positions.

Replace document keyboard handlers with opt-in QueryEditor `shortcuts` and
`commands`. Retain application global scopes, execution and submit guards.

## History and Tutorials filters

Both history and tutorial filters already support controlled `filter.values`.
Replace `initialValues` plus a remounting `key={formKey}` with `values` derived from
external state. Reset that state in `onReset`; no widget remount is necessary.
`initialValues` initializes an uncontrolled form, whereas `values` synchronizes
external changes. Backend filter mapping remains with the application.

```tsx
const filter = {
  fields,
  values: currentFilterValues,
  onApply: applyFilter,
  onReset: resetFilter,
};
<QueriesHistory {...historyProps} filter={filter} />;
<TutorialsHistory {...tutorialProps} filter={filter} />;
```

## Pilot acceptance

Compare the YTsaurus integration before/after migrating: remove generic series,
axes and category building, form-shape validation, positional layout reconciliation,
unavailable-definition merging, standard results controls and document Run listener.
The library does not replace Redux, routing, YQL/YSON decoding, annotations writes,
permissions, async save queues or truncation policy. This repository supplies the
APIs and examples; a downstream migration is required to measure actual code removal.
