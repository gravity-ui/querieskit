import React, {FC, useEffect, useState} from 'react';
import {FullSearchToggleButton} from './internal/FullSearchToggleButton';
import {HistoryFilter} from '../../components/HistoryFilter';
import {SearchWithButtons} from '../../components/SearchWithButtons';
import type {QueryListFilterConfig} from '../../types/queryList';
import i18n from './i18n';

type Props = {
    search?: string;
    fullSearch?: boolean;
    fullSearchAvailable?: boolean;
    hasClear?: boolean;
    filter?: QueryListFilterConfig;
    actions?: React.ReactNode;
    onUpdate: (data: {value: string; fullSearch: boolean}) => void;
    className?: string;
};

export const HistoryHeader: FC<Props> = ({
    search,
    fullSearch,
    fullSearchAvailable = true,
    hasClear,
    filter,
    actions,
    onUpdate,
    className,
}) => {
    const [searchValue, setSearchValue] = useState(search || '');
    const [isFullSearch, setFullSearch] = useState(fullSearchAvailable && Boolean(fullSearch));

    useEffect(() => {
        setSearchValue(search || '');
        setFullSearch(fullSearchAvailable && Boolean(fullSearch));
    }, [search, fullSearch, fullSearchAvailable]);

    const handleOnUpdate = (newValue: string) => {
        setSearchValue(newValue);
        onUpdate({value: newValue, fullSearch: fullSearchAvailable && isFullSearch});
    };

    const handleModeChange = () => {
        const newValue = !isFullSearch;
        setFullSearch(newValue);
        onUpdate({value: searchValue, fullSearch: newValue});
    };

    return (
        <SearchWithButtons
            placeholder={i18n('field_search')}
            gap={2}
            className={className}
            value={searchValue}
            hasClear={hasClear}
            onUpdate={handleOnUpdate}
            innerButtons={
                fullSearchAvailable
                    ? [
                          <FullSearchToggleButton
                              key="full-search"
                              active={isFullSearch}
                              onClick={handleModeChange}
                          />,
                      ]
                    : undefined
            }
            endButtons={[
                ...(filter ? [<HistoryFilter key="filter" {...filter} />] : []),
                ...(actions ? [<React.Fragment key="actions">{actions}</React.Fragment>] : []),
            ]}
        />
    );
};
