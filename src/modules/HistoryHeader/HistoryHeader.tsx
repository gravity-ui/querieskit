import React, {FC, useEffect, useState} from 'react';
import {FullSearchToggleButton} from './internal/FullSearchToggleButton';
import {HistoryFilter} from '../../components/HistoryFilter';
import {SearchWithButtons} from '../../components/SearchWithButtons';
import {QueryListFilterConfig} from '../../types/queryList';

type Props = {
    search?: string;
    fullSearch?: boolean;
    fullSearchAvailable?: boolean;
    hasClear?: boolean;
    filter?: QueryListFilterConfig;
    onUpdate: (data: {value: string; fullSearch: boolean}) => void;
    className?: string;
};

export const HistoryHeader: FC<Props> = ({
    search,
    fullSearch,
    fullSearchAvailable = true,
    hasClear,
    filter,
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
            endButtons={filter ? [<HistoryFilter key="filter" {...filter} />] : undefined}
        />
    );
};
