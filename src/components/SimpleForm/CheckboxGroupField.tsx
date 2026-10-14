import type {CheckboxGroupFieldProps} from '../../types/simpleFormProps';
import React, {FC} from 'react';
import {Checkbox, Flex, Text} from '@gravity-ui/uikit';

export const CheckboxGroupField: FC<CheckboxGroupFieldProps> = ({
    value = [],
    items,
    title,
    onChange,
}) => {
    const handleChange = (id: string, isChacked: boolean) => {
        const result = isChacked ? [...value, id] : value.filter((i) => i !== id);
        onChange(result);
    };

    return (
        <Flex direction="column" gap={4}>
            <Text variant="body-1">{title}</Text>
            <Flex gap={4}>
                {items.map((item) => {
                    const {id, title} = item;
                    const checked = value.includes(id);

                    return (
                        <Checkbox
                            key={id}
                            checked={checked}
                            onUpdate={(isChacked) => {
                                handleChange(id, isChacked);
                            }}
                        >
                            {title}
                        </Checkbox>
                    );
                })}
            </Flex>
        </Flex>
    );
};

declare module '../../types/forms' {
    interface FormFieldPropsRegistry {
        checkboxGroup: CheckboxGroupFieldProps;
    }
}
