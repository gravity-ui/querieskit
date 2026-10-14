import type {SwitchFieldProps} from '../../types/simpleFormProps';
import React, {FC} from 'react';
import {Flex, Switch, Text} from '@gravity-ui/uikit';

export const SwitchField: FC<SwitchFieldProps> = ({title, value, onChange}) => {
    return (
        <Flex gap={2}>
            <Switch checked={value} onUpdate={onChange} />
            {title && <Text variant="body-1">{title}</Text>}
        </Flex>
    );
};

declare module '../../types/forms' {
    interface FormFieldPropsRegistry {
        switch: SwitchFieldProps;
    }
}
