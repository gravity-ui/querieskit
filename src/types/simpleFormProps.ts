import type {RangeValue} from '@gravity-ui/date-components';
import type {DateTime} from '@gravity-ui/date-utils';
import type {SelectProps} from '@gravity-ui/uikit';
import type {RegisteredFormFields} from './forms';

export type FormField = RegisteredFormFields;

export type FormValues = Record<string, unknown>;
export type SimpleFormProps = {
    fields: FormField[];
    values?: FormValues;
    initialValues?: FormValues;
    onValuesChange?: (values: FormValues) => void;
};

export type SwitchFieldProps = {
    value: boolean;
    title?: string;
    onChange: (value: boolean) => void;
};

export type RangeDatePickerFieldProps = {
    value: RangeValue<DateValue>;
    title?: string;
    onChange: (value: RangeValue<DateValue>) => void;
};

export type SelectFieldProps = {
    value: SelectProps['value'];
    options: SelectProps['options'];
    title?: string;
    onChange: (value: string[]) => void;
};

export type CheckboxGroupFieldProps = {
    value: string[];
    items: CheckboxGroupItem[];
    title?: string;
    onChange: (value: string[]) => void;
};

export type DateValue = DateTime | null;
export type CheckboxGroupItem = {id: string; title?: string};
