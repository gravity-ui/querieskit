import React from 'react';
import {Flex, Text} from '@gravity-ui/uikit';

export const Field = ({label, children}: {label: React.ReactNode; children: React.ReactNode}) => (
    <Flex direction="column" gap={1}>
        <Text variant="body-1" color="secondary">
            {label}
        </Text>
        {children}
    </Flex>
);
