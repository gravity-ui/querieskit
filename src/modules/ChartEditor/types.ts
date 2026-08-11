import type {ChartData} from '@gravity-ui/charts';

import type {ChartEditorFormProps} from '../../components/ChartEditorForm';

export type {
    ChartEditorFormProps,
    ChartEditorFormValues,
    ChartEditorLabels,
    ChartEditorOption,
} from '../../components/ChartEditorForm';

export type ChartEditorProps<TCategory extends string = string> = {
    chartFormProps: ChartEditorFormProps<TCategory>;
    data?: ChartData;
    emptyDataLabel?: string;
    className?: string;
};
