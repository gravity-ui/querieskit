import type {ReactNode} from 'react';
import type {ChartAxisType} from '@gravity-ui/charts';

export type ChartEditorOption<TValue extends string = string> = {
    value: TValue;
    content: ReactNode;
    disabled?: boolean;
};

export type ChartEditorFormValues = {
    x: string;
    axisType: ChartAxisType;
    chartTitle: string;
    xTitle: string;
    yTitle: string;
    showLegend: boolean;
};

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

export type ChartEditorFormProps<TCategory extends string = string> = {
    category: TCategory;
    categoryOptions: ChartEditorOption<TCategory>[];
    onCategoryChange: (category: TCategory) => void;
    formValues: ChartEditorFormValues;
    onFormValuesChange: (values: ChartEditorFormValues) => void;
    xOptions?: ChartEditorOption[];
    axisTypeOptions?: ChartEditorOption[];
    labels?: ChartEditorLabels;
    disabled?: boolean;
    className?: string;
    onCancel?: () => void;
    onSubmit?: () => void;
};
