import React, {FC} from 'react';
import {Flex} from '@gravity-ui/uikit';
import {HistorySearch} from './HistorySearch';
import {HistoryFilter} from '../../components/HistoryFilter';
import {QueryHistoryFilterConfig} from '../../types/history';

type Props = {
    search?: string;
    fullSearch?: boolean;
    hasClear?: boolean;
    filter?: QueryHistoryFilterConfig;
    onUpdate: (data: {value: string; fullSearch: boolean}) => void;
};

export const HistoryHeader: FC<Props> = ({search, fullSearch, hasClear, filter, onUpdate}) => {
    return (
        <Flex gap={1}>
            <HistorySearch
                value={search}
                fullSearch={fullSearch}
                hasClear={hasClear}
                onUpdate={onUpdate}
            />
            {filter && <HistoryFilter {...filter} />}
        </Flex>
    );
};
