import type {ChartEditorFormProps} from '../../components/ChartEditorForm';
import type {ChartData, ChartSeries} from '../../types/chartEditor';
export type {ChartData, ChartSeries} from '../../types/chartEditor';

export type ChartEditorProps = Pick<ChartEditorFormProps, 'axisVariants'> & {
    className?: string;
    emptyDataLabel?: string;
    chartSeriesMap?: {
        [chartId in string]: ChartSeries;
    };
    formProps?: Pick<ChartEditorFormProps, 'disabled' | 'className' | 'labels'>;
    formValues?: ChartEditorFormProps['formValues'];
    onChange?: (formValues: ChartEditorFormProps['formValues']) => void;
    onSubmit?: (chartData: ChartData) => void;
    onCancel?: () => void;
};
