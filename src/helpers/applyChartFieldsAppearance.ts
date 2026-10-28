import type {ChartData} from '../types/chartEditor';
import type {ChartConfiguration} from '../types/chartConfiguration';
import {isXYFormValues} from './chartFieldsForm';

/** Shared by the editor preview and saved-definition restoration. */
export function applyChartFieldsAppearance(data: ChartData, values: ChartConfiguration): ChartData {
    const configured: ChartData = {
        ...data,
        title: {...data.title, text: values.chartTitle ?? ''},
        legend: {...data.legend, enabled: Boolean(values.showLegend)},
    };
    if (isXYFormValues(values)) {
        const horizontal = values.chartType === 'bar-y';
        configured.xAxis = {
            ...data.xAxis,
            ...(!horizontal && {type: values.dimensionAxisType}),
            title: {...data.xAxis?.title, text: values.xTitle ?? ''},
        };
        configured.yAxis = (data.yAxis?.length ? data.yAxis : [{}]).map((axis) => ({
            ...axis,
            ...(horizontal && {type: values.dimensionAxisType}),
            title: {...axis.title, text: values.yTitle ?? ''},
        }));
    }
    return configured;
}
