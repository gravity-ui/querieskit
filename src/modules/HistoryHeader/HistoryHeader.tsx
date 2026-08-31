import React, {FC, useEffect, useState} from 'react';
import {FullSearchToggleButton} from './internal/FullSearchToggleButton';
import {HistoryFilter, SearchWithButtons} from '../../components';
import {QueryListFilterConfig} from '../../types/queryList';

type Props = {
    search?: string;
    fullSearch?: boolean;
    hasClear?: boolean;
    filter?: QueryListFilterConfig;
    onUpdate: (data: {value: string; fullSearch: boolean}) => void;
    className?: string;
};

export const HistoryHeader: FC<Props> = ({
    search,
    fullSearch,
    hasClear,
    filter,
    onUpdate,
    className,
}) => {
    const [searchValue, setSearchValue] = useState(search || '');
    const [isFullSearch, setFullSearch] = useState(fullSearch || false);

    useEffect(() => {
        setSearchValue(search || '');
        setFullSearch(fullSearch || false);
    }, [search, fullSearch]);

    const handleOnUpdate = (newValue: string) => {
        setSearchValue(newValue);
        onUpdate({value: newValue, fullSearch: isFullSearch});
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
            innerButtons={[
                <FullSearchToggleButton
                    key="full-search"
                    active={isFullSearch}
                    onClick={handleModeChange}
                />,
            ]}
            endButtons={filter ? [<HistoryFilter key="filter" {...filter} />] : undefined}
        />
    );
};
