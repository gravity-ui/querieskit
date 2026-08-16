import type {ChartData, ChartSeries} from '@gravity-ui/charts';
import type {ChartEditorFormProps} from '../../components/ChartEditorForm';

export type ChartEditorProps = Pick<ChartEditorFormProps, 'axisVariants'> & {
    className?: string;
    emptyDataLabel?: string;
    chartSeriesMap?: {[chartId in string]: ChartSeries<{dataId: string}>};
    formProps?: Pick<ChartEditorFormProps, 'disabled' | 'className' | 'labels'>;
    formValues?: ChartEditorFormProps['formValues'];
    onChange?: (formValues: ChartEditorFormProps['formValues']) => void;
    onSubmit?: (chartData: ChartData) => void;
    onCancel?: () => void;
};
