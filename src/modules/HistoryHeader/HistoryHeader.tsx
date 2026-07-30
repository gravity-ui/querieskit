import React, {FC} from 'react';
import {Flex} from '@gravity-ui/uikit';
import {HistorySearch} from './internal/HistorySearch';
import {HistoryFilter} from './internal/HistoryFilter';

type Props = {
    search?: string;
    fullSearch?: boolean;
    hasClear?: boolean;
    onUpdate: (data: {value: string; fullSearch: boolean}) => void;
};

export const HistoryHeader: FC<Props> = ({search, fullSearch, hasClear, onUpdate}) => {
    return (
        <Flex gap={1}>
            <HistorySearch
                value={search}
                fullSearch={fullSearch}
                hasClear={hasClear}
                onUpdate={onUpdate}
            />
            <HistoryFilter />
        </Flex>
    );
};
