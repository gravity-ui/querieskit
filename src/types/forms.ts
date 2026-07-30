export type BaseFormField<T extends string = string, Value = any, Extra extends object = {}> = {
    id: string;
    type: T;
    title?: string;
    initialValue?: Value;
} & Extra;

/**
 * Реестр пропсов зарегистрированных типов полей формы.
 *
 * Каждый компонент поля должен дополнять этот интерфейс через
 * module augmentation в своём файле, например:
 *
 * ```ts
 * declare module '../../types/forms' {
 *     interface FormFieldPropsRegistry {
 *         switch: ComponentProps<typeof SwitchField>;
 *     }
 * }
 * ```
 *
 * Это позволяет автоматически расширять union `RegisteredFormFields`
 * без правки SimpleForm при добавлении новых типов полей.
 */
export interface FormFieldPropsRegistry {}

export type RegisteredFormFields = {
    [K in keyof FormFieldPropsRegistry]: BaseFormField<
        K & string,
        FormFieldPropsRegistry[K] extends {value?: infer V} ? V : any,
        Omit<FormFieldPropsRegistry[K], 'value' | 'onChange' | 'title'>
    >;
}[keyof FormFieldPropsRegistry];
