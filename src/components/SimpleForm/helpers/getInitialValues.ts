import type {FormField, FormValues} from '../../../types/simpleFormProps';

export function getInitialValues(fields: FormField[], initialValues?: FormValues): FormValues {
    return {
        ...Object.fromEntries(fields.map((field) => [field.id, field.initialValue])),
        ...initialValues,
    };
}
