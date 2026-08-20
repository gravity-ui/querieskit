import i18n from '../i18n';
import type {ChartEditorLabels} from '../types';

export const resolveLabels = (labels: ChartEditorLabels = {}) => {
    return {
        data: labels.data ?? i18n('field_data'),
        x: labels.x ?? i18n('field_x'),
        axisType: labels.axisType ?? i18n('field_axis-type'),
        chartTitle: labels.chartTitle ?? i18n('field_chart-title'),
        xTitle: labels.xTitle ?? i18n('field_x-title'),
        yTitle: labels.yTitle ?? i18n('field_y-title'),
        showLegend: labels.showLegend ?? i18n('field_show-legend'),
        formTitle: labels.formTitle ?? i18n('title_form'),
        cancel: labels.cancelLabel ?? i18n('button_cancel'),
        submit: labels.submitLabel ?? i18n('button_submit'),
    };
};
