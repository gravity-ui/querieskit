import React, {ReactNode} from 'react';
import {Flex, Text} from '@gravity-ui/uikit';
import i18n from '../i18n';
import cn from 'bem-cn-lite';

type EmptyDashboardPlaceholderProps = {
    emptyTitle?: ReactNode;
    emptyDescription?: ReactNode;
};

const block = cn('qp-empty-dashboard-placeholder');

export const EmptyDashboardPlaceholder = ({
    emptyTitle,
    emptyDescription,
}: EmptyDashboardPlaceholderProps) => {
    const resolvedEmptyTitle = emptyTitle ?? i18n('context_no-charts');
    const resolvedEmptyDescription = emptyDescription ?? i18n('context_add-first-chart');

    return (
        <Flex direction="column" centerContent gap={1} className={block('empty')}>
            <Text variant="subheader-2">{resolvedEmptyTitle}</Text>
            <Text color="secondary">{resolvedEmptyDescription}</Text>
        </Flex>
    );
};
