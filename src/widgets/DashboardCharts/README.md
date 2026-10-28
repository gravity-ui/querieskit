# DashboardCharts

`DashboardCharts` supports the existing series editor and fields editor. For tabular results,
`createTabularChartSource` supplies field options, initial values, chart data and diagnostics.
It supports line, area, scatter, bar-x, bar-y and pie; custom callbacks can still implement
treemap, sankey and other existing workflows.

```tsx
import {useMemo} from 'react';
import {DashboardCharts} from '@gravity-ui/querieskit/widgets/DashboardCharts';
import {createTabularChartSource} from '@gravity-ui/querieskit/helpers/createTabularChartSource';

type Row = {time: number; count: number};

function ResultsCharts({rows}: {rows: Row[]}) {
    const source = useMemo(() => createTabularChartSource({
        fields: [
            {id: 'time', name: 'Time', type: 'datetime'},
            {id: 'count', name: 'Count', type: 'number'},
        ],
        rows,
        getValue: (row, field) => row[field as keyof Row],
    }), [rows]);
    return <DashboardCharts editorMode="fields" chartFieldsEditorProps={source} />;
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
the form's appearance settings. The editor applies titles,
legend visibility and the selected dimension scale once, through the same preparation step.
Direct `source.getChartData` and `source.resolveChartData` calls return the data before that step.

