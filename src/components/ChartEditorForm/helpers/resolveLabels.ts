import i18n from '../i18n';
import type {ChartEditorLabels} from '../../../types/chartEditor';

export const resolveLabels = (labels: ChartEditorLabels = {}) => {
    return {
        data: labels.data ?? i18n('field_data'),
        x: labels.x ?? i18n('field_x'),
        axisType: labels.axisType ?? i18n('field_axis-type'),
        formTitle: labels.formTitle ?? i18n('title_form'),
        cancel: labels.cancelLabel ?? i18n('button_cancel'),
        submit: labels.submitLabel ?? i18n('button_submit'),
    };
};
