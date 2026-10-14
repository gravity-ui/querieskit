import type {SelectFieldProps} from '../../types/simpleFormProps';
import React, {FC} from 'react';
import {Flex, Select, Text} from '@gravity-ui/uikit';

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
