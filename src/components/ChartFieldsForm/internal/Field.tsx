import React from 'react';
import {Flex, Text} from '@gravity-ui/uikit';

export function Field({label, children}: {label: string; children: React.ReactNode}) {
    return (
        <Flex direction="column" gap={1}>
            <Text variant="body-1" color="secondary">
                {label}
            </Text>
            {children}
        </Flex>
    );
}
