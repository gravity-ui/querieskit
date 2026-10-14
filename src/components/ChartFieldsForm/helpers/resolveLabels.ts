import type {ChartFieldsFormLabels} from '../../../types/chartEditor';
import i18n from '../i18n';

export function resolveLabels(labels: ChartFieldsFormLabels = {}) {
    return {
        formTitle: labels.formTitle ?? i18n('title_form'),
        chartType: labels.chartType ?? i18n('field_chart-type'),
        x: labels.x ?? i18n('field_x'),
        y: labels.y ?? i18n('field_y'),
        axisType: labels.axisType ?? i18n('field_axis-type'),
        ...resolveBindingLabels(labels),
        chartConfig: labels.chartConfig ?? i18n('title_chart-config'),
        selectItem: labels.selectItem ?? i18n('context_select-item'),
        addItem: labels.addItem ?? i18n('action_add-item'),
        removeItem: labels.removeItem ?? i18n('action_remove-item'),
        close: labels.closeLabel ?? i18n('action_close'),
        cancel: labels.cancelLabel ?? i18n('action_cancel'),
        submit: labels.submitLabel ?? i18n('action_submit'),
        chartTitle: labels.chartTitle ?? i18n('field_chart-title'),
        xTitle: labels.xTitle,
        yTitle: labels.yTitle,
        showLegend: labels.showLegend,
    };
}

function resolveBindingLabels(labels: ChartFieldsFormLabels) {
    return {
        category: labels.category ?? i18n('field_category'),
        value: labels.value ?? i18n('field_value'),
        levels: labels.levels ?? i18n('field_levels'),
        source: labels.source ?? i18n('field_source'),
        target: labels.target ?? i18n('field_target'),
        flowValue: labels.flowValue ?? i18n('field_flow-value'),
        moveUp: labels.moveUp ?? i18n('action_move-up'),
        moveDown: labels.moveDown ?? i18n('action_move-down'),
    };
}
