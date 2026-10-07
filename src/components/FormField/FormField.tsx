import React from 'react';
import {Flex, Text} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';
import type {FormFieldProps} from '../../types/formField';

const block = cn('qp-form-field');

export function FormField({label, children, className}: FormFieldProps) {
    return (
        <Flex direction="column" gap={1} className={block(null, className)}>
            <Text variant="body-1" color="secondary">
                {label}
            </Text>
            {children}
        </Flex>
    );
}
