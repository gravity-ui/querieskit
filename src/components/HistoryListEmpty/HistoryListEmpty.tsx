import React, {FC} from 'react';
import {Flex, Text} from '@gravity-ui/uikit';
import {NoSearchResults} from '@gravity-ui/illustrations';
import cn from 'bem-cn-lite';
import i18n from './i18n';
import './HistoryListEmpty.scss';

const block = cn('qp-history-list-empty');

export type HistoryListEmptyProps = {
    showFiltersHint?: boolean;
    className?: string;
};

export const HistoryListEmpty: FC<HistoryListEmptyProps> = ({showFiltersHint, className}) => {
    return (
        <Flex alignItems="center" justifyContent="center" className={block(null, className)}>
            <Flex direction="column" gap={6}>
                <NoSearchResults height={100} />
                <Flex direction="column" alignItems="center" gap={1}>
                    <Text variant="subheader-1">{i18n('title_nothing-found')}</Text>
                    {showFiltersHint && <Text>{i18n('context_try-change-filters')}</Text>}
                </Flex>
            </Flex>
        </Flex>
    );
};
