# FieldsSelector

The controlled `value` is the applied selection. By default, each toggle immediately calls
`onChange`, preserving the order of existing IDs and appending newly selected IDs.
The default button remains a gear icon.

```tsx
const [columns, setColumns] = useState(['name']);

<FieldsSelector
  fields={[
    {id: 'name', title: 'Name'},
    {id: 'status', title: <StatusHeading />, searchText: 'Status'},
  ]}
  value={columns}
  onChange={setColumns}
  applyMode="explicit"
  searchable
  showSelectedCount
  buttonContent="Columns"
  buttonLabel="Configure columns"
/>;
```

`explicit` starts a draft when the popup opens. Apply emits one change and closes it.
Cancel, Escape, outside dismissal and closing the trigger discard the draft. A change to
the content or order of the external `value` replaces the draft; an equivalent new array
does not. Reopening always starts from the current props.

Search is case-insensitive and uses `searchText`, string `title`, or the ID, in that order.
Filtering never clears selection. Fields removed from `fields` are omitted on explicit
Apply without an automatic change event. Empty selection is supported.
The popup displays a scrollable list; the count includes only available selected fields.

`searchable` and `showSelectedCount` default to false. `buttonLabel` remains the accessible
name even with custom `buttonContent`. For non-string titles, `searchText` also supplies
the accessible option name.

Pass selector options through `FieldsSearchToolbar`, `NavigationSchema` and
`NavigationPreview` using `fieldsSelectorProps`. Query list/history `visibleFields`
accepts the same selector options directly.
