import type {ChartData as BaseChartData, ChartSeries as BaseChartSeries} from '@gravity-ui/charts';
import type {ChartEditorFormProps} from '../../components/ChartEditorForm';

export type ChartSeries = BaseChartSeries & {seriesId: string};
export type ChartData = Omit<BaseChartData, 'series'> & {series: {data: ChartSeries[]}};

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
