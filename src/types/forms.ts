import type {
    CheckboxGroupFieldProps,
    RangeDatePickerFieldProps,
    SelectFieldProps,
    SwitchFieldProps,
} from './simpleFormFields';

export type BaseFormField<T extends string = string, Value = any, Extra extends object = {}> = {
    id: string;
    type: T;
    title?: string;
    initialValue?: Value;
} & Extra;

/**
 * Props registry shared by built-in and application-defined SimpleForm fields.
 * Built-ins are declared here so type-only public imports do not depend on
 * loading component modules. Consumers can augment this interface through
 * `@gravity-ui/querieskit` or `@gravity-ui/querieskit/components/SimpleForm`.
 */
export interface FormFieldPropsRegistry {
    select: SelectFieldProps;
    switch: SwitchFieldProps;
    rangeDatePicker: RangeDatePickerFieldProps;
    checkboxGroup: CheckboxGroupFieldProps;
}

export type RegisteredFormFields = {
    [K in keyof FormFieldPropsRegistry]: BaseFormField<
        K & string,
        FormFieldPropsRegistry[K] extends {value?: infer V} ? V : any,
        Omit<FormFieldPropsRegistry[K], 'value' | 'onChange' | 'title'>
    >;
}[keyof FormFieldPropsRegistry];
