import type {RegisteredFormFields} from './forms';

export type {
    SwitchFieldProps,
    RangeDatePickerFieldProps,
    SelectFieldProps,
    CheckboxGroupFieldProps,
    DateValue,
    CheckboxGroupItem,
} from './simpleFormFields';

export type FormField = RegisteredFormFields;

export type FormValues = Record<string, unknown>;
export type SimpleFormProps = {
    fields: FormField[];
    values?: FormValues;
    initialValues?: FormValues;
    onValuesChange?: (values: FormValues) => void;
};
