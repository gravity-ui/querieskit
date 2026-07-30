import React, {FC} from 'react';
import {Flex, Switch, Text} from '@gravity-ui/uikit';

export type SwitchFieldProps = {
    value: boolean;
    title?: string;
    onChange: (value: boolean) => void;
};

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
