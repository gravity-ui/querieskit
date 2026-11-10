# HistoryFilter

The standard history filter provides the toggle button, popup, active indication, draft,
and Apply/Reset actions. Application code owns applied values and data loading.

## SimpleForm fields

Existing configurations and `QueryListFilterConfig`/`HistoryFilterProps` types remain supported:

```tsx
<HistoryFilter
  fields={[{id: 'onlyMine', type: 'switch', initialValue: false}]}
  values={appliedValues}
  onApply={setAppliedValues}
  onReset={() => setAppliedValues({onlyMine: false})}
/>
```

## Application fields without SimpleForm

Use `createHistoryFilter` from the package root or the `components/HistoryFilter` entrypoint.
It preserves the form's data type while producing a configuration accepted by the history,
saved queries, tutorials, and sidebar compositions. No registration of fields is needed.

```tsx
import React from 'react';
import {createHistoryFilter, HistoryFilter} from '@gravity-ui/querieskit';
import {TextInput} from '@gravity-ui/uikit';

type Filters = {owner: string; statuses: string[]};
const defaults: Filters = {owner: '', statuses: []};

function FiltersExample() {
  const [applied, setApplied] = React.useState(defaults);
  const filter = createHistoryFilter({
    initialValues: defaults,
    values: applied,
    isChanged: Boolean(applied.owner || applied.statuses.length),
    onApply: setApplied,
    onReset: () => setApplied(defaults),
    renderFields: ({value, onChange}) => (
      <TextInput
        label="User"
        value={value.owner}
        onUpdate={(owner) => onChange({...value, owner})}
      />
    ),
  });
  return <HistoryFilter {...filter} />;
  // The same value works as <QueriesHistory filter={filter} ... />.
}
```

`initialValues` is a complete value of the form type. `renderFields` receives the current
draft and `onChange(nextValue)`; fields must update it immutably. Render fields only, with
no additional Apply/Reset buttons or independently managed draft. The custom fields story
demonstrates a period, user, statuses, and engines owned by the application.

The helper can be called during every render. Recreating its configuration does not
remount the filter or discard the draft. `HistoryFilterConfig` covers both the old
`QueryListFilterConfig` and the helper's `CustomHistoryFilterConfig`. The old aliases
remain object types, so existing interfaces extending them continue to compile.
The adapter's `customFilter` property is internal; use the helper rather than constructing
it manually. Do not combine an adapter with legacy `fields`, `values`, `initialValues`,
`onApply`, or `onReset` props. Pass those values and handlers to the helper instead.

## State and actions

Both modes use the same lifecycle:

- Initial draft merges the defaults with `values`; SimpleForm additionally derives defaults
  from field descriptors.
- Apply calls `onApply(draft)` once and leaves the popup open. The application decides
  whether to save the values or reload data.
- Reset restores the current defaults and calls `onReset`, without implicitly calling
  `onApply`. The application decides whether reset also changes the applied filter.
- Closing the popup preserves unsubmitted changes. Reopening shows that draft.
- Meaningfully changed external `values` replace the draft, even while closed; equivalent
  objects preserve edits. Changes to defaults alone take effect on the next Reset or
  external value update.
- `isChanged` controls the button indication; it is not inferred from the draft.

Use immutable, acyclic plain form objects and arrays (date values are supported).
The structural equality used for external updates is not a general comparator for Maps,
Sets, or arbitrary class instances. Supply application fields and application-owned data;
the library does not load users, engines, or filter options.
