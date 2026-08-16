import React from 'react';
import {Modal} from '@gravity-ui/uikit';
import {ChartEditor} from '../../../modules';
import type {ChartData} from '@gravity-ui/charts';
import type {ChartEditorFormProps} from '../../../modules';

type ModalChartEditorProps = {
    fetchData: () => ChartData;
    open: boolean;
    onOpenChange: (openState: boolean) => void;
};

export const ModalChartEditor = ({fetchData}: ModalChartEditorProps) => {
    return (
        <Modal
            open={Boolean(draft)}
            onOpenChange={(open) => {
                if (!open) {
                    setDraft(null);
                }
            }}
            contentOverflow="auto"
            contentClassName={block('modal')}
            aria-label={editorLabels?.formTitle ?? i18n('action_add-chart')}
        >
            {draft && (
                <ChartEditor<TCategory>
                    data={previewData}
                    emptyDataLabel={editorEmptyDataLabel}
                    className={block('editor')}
                    chartFormProps={{
                        category: draft.category,
                        categoryOptions,
                        onCategoryChange: (category) =>
                            setDraft((current) =>
                                current
                                    ? {
                                          category,
                                          values: resolveEditorValues(category, current.values),
                                      }
                                    : current,
                            ),
                        formValues: draft.values,
                        onFormValuesChange: (values) =>
                            setDraft((current) => (current ? {...current, values} : current)),
                        xOptions,
                        axisTypeOptions,
                        labels: editorLabels,
                        disabled,
                        onCancel: () => setDraft(null),
                        onSubmit: handleSubmit,
                    }}
                />
            )}
        </Modal>
    );
};
