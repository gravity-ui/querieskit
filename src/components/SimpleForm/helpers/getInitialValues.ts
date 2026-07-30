import {FormField} from '../SimpleForm';

type FormValues = Record<string, any>;

export function getInitialValues(fields: FormField[], initialValues?: FormValues): FormValues {
    return {
        ...Object.fromEntries(fields.map((field) => [field.id, field.initialValue])),
        ...initialValues,
    };
}
