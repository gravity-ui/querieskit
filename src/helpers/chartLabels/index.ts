import type {ChartSeries} from '@gravity-ui/charts';
import i18n from './i18n';

export function getChartTypeLabel(type: ChartSeries['type']): string {
    return i18n(`value_${type}`);
}
