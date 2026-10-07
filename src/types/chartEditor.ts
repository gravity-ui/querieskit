import type {ReactNode} from 'react';
import type {
    ChartData as BaseChartData,
    ChartSeries as BaseChartSeries,
    ChartAxisType,
} from '@gravity-ui/charts';

export type ChartSeries = BaseChartSeries & {seriesId: string};
export type ChartData = Omit<BaseChartData, 'series'> & {series: {data: ChartSeries[]}};

export type ChartEditorOption<TValue extends string = string> = {
    value: TValue;
    content: ReactNode;
    disabled?: boolean;
};

export type ChartConfigValues = Partial<{
    chartTitle: string;
    xTitle: string;
    yTitle: string;
    showLegend: boolean;
}>;

export type ChartConfigLabels = Partial<{
    chartTitle: string;
    xTitle: string;
    yTitle: string;
    showLegend: string;
}>;

export type ChartConfigFieldsProps = {
    formValues: ChartConfigValues;
    onFormValuesChange?: (values: ChartConfigValues) => void;
    labels?: ChartConfigLabels;
    disabled?: boolean;
    className?: string;
    /** Show axis titles; defaults to true for the legacy form. */
    showAxes?: boolean;
};

export type ChartEditorFormValues = ChartConfigValues &
    Partial<{
        dataIds: string[];
        axisType: ChartAxisType;
        axisCategories: string[];
    }>;

export type ChartEditorLabels = ChartConfigLabels &
    Partial<{
        formTitle: string;
        data: string;
        x: string;
        axisType: string;
        empty: string;
        cancelLabel: string;
        submitLabel: string;
    }>;

export type ChartEditorFormProps = {
    dataIds?: string[];
    axisVariants?: ChartAxisType[];
    formValues: ChartEditorFormValues;
    labels?: ChartEditorLabels;
    disabled?: boolean;
    className?: string;
    onFormValuesChange?: (values: ChartEditorFormValues) => void;
    onCancel?: () => void;
    onSubmit?: () => void;
};

export type ChartFieldsChartType =
    'line' | 'area' | 'scatter' | 'bar-x' | 'bar-y' | 'pie' | 'treemap' | 'sankey';

export type ChartXYType = Extract<
    ChartFieldsChartType,
    'line' | 'area' | 'scatter' | 'bar-x' | 'bar-y'
>;

export type ChartFieldItem = {
    /** Stable row identity, independent of the selected column. */
    id: string;
    fieldId?: string;
};

export type ChartAppearanceValues = Pick<ChartConfigValues, 'chartTitle' | 'showLegend'>;

export type ChartXYFormValues = ChartAppearanceValues & {
    chartType: ChartXYType;
    dimensionFieldId?: string;
    /** Scale of the dimension axis: Y for bar-y, X for other XY charts. */
    dimensionAxisType?: ChartAxisType;
    measureItems: ChartFieldItem[];
    xTitle?: string;
    yTitle?: string;
};

export type ChartPieFormValues = ChartAppearanceValues & {
    chartType: 'pie';
    categoryFieldId?: string;
    valueFieldId?: string;
};

export type ChartTreemapFormValues = ChartAppearanceValues & {
    chartType: 'treemap';
    /** Ordered grouping levels, from outermost to innermost. */
    levels: ChartFieldItem[];
    valueFieldId?: string;
};

export type ChartSankeyFormValues = ChartAppearanceValues & {
    chartType: 'sankey';
    sourceFieldId?: string;
    targetFieldId?: string;
    valueFieldId?: string;
};

export type ChartSelectedFormValues =
    ChartXYFormValues | ChartPieFormValues | ChartTreemapFormValues | ChartSankeyFormValues;

export type ChartFieldsFormValues =
    ChartSelectedFormValues | (ChartAppearanceValues & {chartType?: undefined});

export type ChartFieldRole =
    'dimension' | 'measure' | 'category' | 'value' | 'level' | 'source' | 'target';

export type ChartFieldOptionsContext = {
    chartType: ChartFieldsChartType;
    role: ChartFieldRole;
};

export type ChartFieldsFormLabels = ChartConfigLabels &
    Partial<{
        formTitle: string;
        chartType: string;
        x: string;
        y: string;
        axisType: string;
        category: string;
        value: string;
        levels: string;
        source: string;
        target: string;
        flowValue: string;
        moveUp: string;
        moveDown: string;
        chartConfig: string;
        selectItem: string;
        addItem: string;
        removeItem: string;
        closeLabel: string;
        cancelLabel: string;
        submitLabel: string;
    }>;

export type ChartFieldsFormProps = {
    chartTypeOptions: readonly ChartEditorOption<ChartFieldsChartType>[];
    /** Return the allowed columns for each role in the selected chart type. */
    getFieldOptions: (context: ChartFieldOptionsContext) => readonly ChartEditorOption[];
    /** Available scales for the dimension axis in XY charts. */
    axisVariants?: readonly ChartAxisType[];
    formValues: ChartFieldsFormValues;
    onFormValuesChange?: (values: ChartFieldsFormValues) => void;
    labels?: ChartFieldsFormLabels;
    disabled?: boolean;
    submitDisabled?: boolean;
    className?: string;
    onCancel?: () => void;
    onSubmit?: () => void;
};
