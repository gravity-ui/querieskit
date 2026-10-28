# DashboardCharts

`DashboardCharts` supports the existing series editor and fields editor. For tabular results,
`createTabularChartSource` supplies field options, initial values, chart data and diagnostics.
It supports line, area, scatter, bar-x, bar-y and pie; custom callbacks can still implement
treemap, sankey and other existing workflows.

```tsx
import {useMemo, useState} from 'react';
import {DashboardCharts} from '@gravity-ui/querieskit/widgets/DashboardCharts';
import {createTabularChartSource} from '@gravity-ui/querieskit/helpers/createTabularChartSource';
import type {ChartDefinition} from '@gravity-ui/querieskit';

type Row = {time: number; count: number};

function ResultsCharts({rows}: {rows: Row[]}) {
    const [definitions, setDefinitions] = useState<ChartDefinition[]>([]);
    const source = useMemo(() => createTabularChartSource({
        fields: [
            {id: 'time', name: 'Time', type: 'datetime'},
            {id: 'count', name: 'Count', type: 'number'},
        ],
        rows,
        getValue: (row, field) => row[field as keyof Row],
    }), [rows]);
    return <DashboardCharts editorMode="fields" chartFieldsEditorProps={source}
        chartDefinitions={definitions} onDefinitionsChange={setDefinitions} />;
}
```

## Values and diagnostics

The tabular source requires nonempty, unique field IDs. Custom adapters may use an empty-string
field ID. Field availability comes from schema, including when rows
are empty. Values are normalized by the application: numeric fields require finite numbers;
datetime fields require Unix milliseconds. Null, undefined, wrong-type and infinite values are
skipped, never converted to zero. String fields require strings. Only selected fields are read.
Categories follow row order, series follow measure order, and rows are never aggregated.
For pie, each valid row becomes a slice even when category names repeat.

`resolveChartData(configuration)` accepts a completed `ChartConfiguration` and returns `ready`
with data, or `empty-data`, `missing-fields`, `invalid-selection`, `unsupported-type`.
The fields editor accepts either this resolver or the existing `getChartData` callback; the
resolver takes precedence when both are provided. A resolver-only adapter does not need a
dummy `getChartData`. The tabular source provides both callbacks through the same data builder.
`getChartData` retains the data-or-undefined contract; `undefined` becomes `empty-data`.
The editor displays localized messages; `getUnavailableLabel` can customize them.
`emptyDataLabel` remains supported.

Resolvers produce series and the axes/categories required by their data. They do not apply
the form's appearance settings. The editor and saved-definition restoration each apply titles,
legend visibility and the selected dimension scale once, through the same preparation step.
Direct `source.getChartData` and `source.resolveChartData` calls return the data before that step.

## Saving and restoring

Use `validateChartDefinition(unknown)` before accepting persisted values. It returns either a
normalized version-1 definition or structured issues with code and path. Validation checks the
saved structure without consulting current schema; missing fields are a restoration state.

`ChartFieldsFormValues` describes an editable draft, including incomplete bindings.
`ChartConfiguration` describes completed bindings with optional appearance settings;
`ChartDefinition.fieldsFormValues`, resolver inputs and successful Submit callbacks use this
strict type. The JSON envelope remains `{version: 1, id, fieldsFormValues}`. Creating initial
values or switching chart type still produces a draft. Use the shared
`validateChartConfiguration(unknown)` helper to normalize it before passing it to a resolver:

```tsx
import {validateChartConfiguration} from '@gravity-ui/querieskit';

const checked = validateChartConfiguration(source.getInitialFormValues('line'));
if (checked.valid) {
    const result = source.resolveChartData(checked.configuration);
    // The result can still report fields or data unavailable in the current source.
}
```

The shared structural validator checks required bindings, row identities, duplicates and axes;
availability in the current source is checked separately. Empty-string field IDs are valid for
custom adapters, but chart and configuration-row IDs must be nonempty. An incomplete measure
row can stay in the draft while completed measures produce a preview; Submit requires the
whole draft to be complete.

`extractChartDefinition(item)` extracts bindings/appearance without series.
`restoreChartDefinition(definition, source.resolveChartData)` always retains the definition,
including when it cannot currently produce data. These helpers are exported from
`@gravity-ui/querieskit/helpers/chartDefinitions`.

In definition mode, `chartDefinitions` and `onDefinitionsChange` are controlled and mutually
exclusive with `chartItems` / `onItemsChange`. Unavailable definitions appear as placeholders
with the same ID and layout. Editing available charts keeps all unavailable definitions;
deleting a placeholder explicitly removes it. Restoring its fields replaces it with the chart.
If definition extraction fails during Save, the editor keeps the draft open, shows an error,
and does not emit `onDefinitionsChange`. Editing or canceling clears that error.
The application owns persistence, load/save errors, permissions and concurrent updates.

`layout` / `onLayoutChange` control coordinates independently of definitions. `defaultLayout`
initializes uncontrolled coordinates. Layout entries match charts by `i === id`, regardless of
array order. Include all definitions in persisted state, including unavailable ones. For migration
from reactive `defaultLayout`, pass that value as `layout` instead.

Backend decoding, timestamp unit conversion, data fetching, aggregation and truncated-result
policy remain application responsibilities. Definitions contain a library version, independent
of any application storage envelope version.
