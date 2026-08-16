import type {ReactNode} from 'react';
import type {ChartAxisType} from '@gravity-ui/charts';

export type ChartEditorOption<TValue extends string = string> = {
    value: TValue;
    content: ReactNode;
    disabled?: boolean;
};

export type ChartEditorFormValues = Partial<{
    dataIds: string[];
    axisType: ChartAxisType;
    axisCategories: string[];
    chartTitle: string;
    xTitle: string;
    yTitle: string;
    showLegend: boolean;
}>;

export type ChartEditorLabels = Partial<{
    formTitle: string;
    data: string;
    x: string;
    axisType: string;
    chartTitle: string;
    xTitle: string;
    yTitle: string;
    showLegend: string;
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
