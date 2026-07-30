import React, {useMemo, useState} from 'react';
import {RegisteredFormFields} from '../../types/forms';
import {getControl, getInitialValues, registerFormControl} from './helpers';
import {SwitchField} from './SwitchField';
import {RangeDatePickerField} from './RangeDatePickerField';
import {Flex} from '@gravity-ui/uikit';
import {CheckboxGroupField} from './CheckboxGroupField';
import {SelectField} from './SelectField';

export type FormField = RegisteredFormFields;

type FormValues = Record<string, any>;

type Props = {
    fields: FormField[];
    values?: FormValues;
    initialValues?: FormValues;
    onValuesChange?: (values: FormValues) => void;
};

export const SimpleForm: React.FC<Props> = ({fields, values, initialValues, onValuesChange}) => {
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
