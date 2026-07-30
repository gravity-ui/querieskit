import React, {FC} from 'react';
import {Flex, Select, SelectProps, Text} from '@gravity-ui/uikit';

export type SelectFieldProps = {
    value: SelectProps['value'];
    options: SelectProps['options'];
    title?: string;
    onChange: (value: string[]) => void;
};

export const SelectField: FC<SelectFieldProps> = ({value, options, title, onChange}) => {
    return (
        <Flex direction="column" gap={2}>
            <Text>{title}</Text>
            <Select value={value} options={options} onUpdate={onChange} />
        </Flex>
    );
};

declare module '../../types/forms' {
    interface FormFieldPropsRegistry {
        select: SelectFieldProps;
    }
}
