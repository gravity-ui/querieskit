export type BaseFormField<T extends string = string, Value = any, Extra extends object = {}> = {
    id: string;
    type: T;
    title?: string;
    initialValue?: Value;
} & Extra;

/**
 * Registry of props for registered form field types.
 *
 * Each field component should augment this interface via
 * module augmentation in its own file, for example:
 *
 * ```ts
 * declare module '../../types/forms' {
 *     interface FormFieldPropsRegistry {
 *         switch: ComponentProps<typeof SwitchField>;
 *     }
 * }
 * ```
 *
 * This allows the `RegisteredFormFields` union to be extended
 * automatically without modifying SimpleForm when new field types are added.
 */
export interface FormFieldPropsRegistry {}

export type RegisteredFormFields = {
    [K in keyof FormFieldPropsRegistry]: BaseFormField<
        K & string,
        FormFieldPropsRegistry[K] extends {value?: infer V} ? V : any,
        Omit<FormFieldPropsRegistry[K], 'value' | 'onChange' | 'title'>
    >;
}[keyof FormFieldPropsRegistry];
