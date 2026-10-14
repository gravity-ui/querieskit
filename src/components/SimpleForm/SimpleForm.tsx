import {Flex} from '@gravity-ui/uikit';
import React, {useMemo, useState} from 'react';
import type {FormValues, SimpleFormProps} from '../../types/simpleFormProps';
import {CheckboxGroupField} from './CheckboxGroupField';
import {getControl, getInitialValues, registerFormControl} from './helpers';
import {RangeDatePickerField} from './RangeDatePickerField';
import {SelectField} from './SelectField';
import {SwitchField} from './SwitchField';
export type {FormField} from '../../types/simpleFormProps';

export const SimpleForm: React.FC<SimpleFormProps> = ({
    fields,
    values,
    initialValues,
    onValuesChange,
}) => {
    const isControlled = values !== undefined;

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const initial = useMemo(() => getInitialValues(fields, initialValues), []);
    const [internalValues, setInternalValues] = useState<FormValues>(initial);

    const currentValues = isControlled ? values : internalValues;

    const handleFieldChange = (name: string, value: unknown) => {
        const nextValues = {...currentValues, [name]: value};

        if (!isControlled) {
            setInternalValues(nextValues);
        }

        onValuesChange?.(nextValues);
    };

    return (
        <Flex direction="column" gap={4}>
            {fields.map((field) => {
                const FieldComponent = getControl(field.type);

                const {id, type: _type, title, initialValue: _initialValue, ...extraProps} = field;

                return (
                    <FieldComponent
                        key={id}
                        title={title}
                        value={currentValues[id]}
                        onChange={(value: unknown) => handleFieldChange(id, value)}
                        {...extraProps}
                    />
                );
            })}
        </Flex>
    );
};

// base fields
registerFormControl('switch', SwitchField);
registerFormControl('rangeDatePicker', RangeDatePickerField);
registerFormControl('checkboxGroup', CheckboxGroupField);
registerFormControl('select', SelectField);
