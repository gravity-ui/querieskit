import type {ChartFieldsFormProps} from '../../../types/chartEditor';
import type {resolveLabels} from '../helpers/resolveLabels';

export type BindingFieldsProps<T> = {
    values: T;
    onChange: (values: T) => void;
    getFieldOptions: ChartFieldsFormProps['getFieldOptions'];
    labels: ReturnType<typeof resolveLabels>;
    disabled?: boolean;
    axisVariants?: ChartFieldsFormProps['axisVariants'];
};
