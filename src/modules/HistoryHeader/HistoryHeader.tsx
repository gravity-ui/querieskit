import React, {FC, useEffect, useState} from 'react';
import {FullSearchToggleButton} from './internal/FullSearchToggleButton';
import {HistoryFilter} from '../../components/HistoryFilter';
import {SearchWithButtons} from '../../components/SearchWithButtons';
import type {QueryListFilterConfig} from '../../types/queryList';
import i18n from './i18n';
import cn from 'bem-cn-lite';
import type {HistoryPanelVariant} from '../../types/listPanel';
import './HistoryHeader.scss';

const block = cn('qp-history-header');

type Props = {
    search?: string;
    fullSearch?: boolean;
    fullSearchAvailable?: boolean;
    hasClear?: boolean;
    filter?: QueryListFilterConfig;
    actions?: React.ReactNode;
    onUpdate: (data: {value: string; fullSearch: boolean}) => void;
    className?: string;
    variant?: HistoryPanelVariant;
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
    variant = 'default',
}) => {
    const isPanel = variant !== 'default';
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
            placeholder={isPanel ? i18n('field_search') : undefined}
            gap={isPanel ? 2 : 1}
            className={block({variant}, className)}
            value={searchValue}
            hasClear={hasClear}
            onUpdate={handleOnUpdate}
            innerButtons={
                fullSearchAvailable
                    ? [
                          <FullSearchToggleButton
                              key="full-search"
                              appearance={variant === 'default' ? 'default' : 'flat'}
                              active={isFullSearch}
                              onClick={handleModeChange}
                          />,
                      ]
                    : undefined
            }
            endButtons={[
                ...(filter
                    ? [
                          <HistoryFilter
                              key="filter"
                              {...filter}
                              buttonView={isPanel ? 'flat' : 'normal'}
                          />,
                      ]
                    : []),
                ...(actions ? [<React.Fragment key="actions">{actions}</React.Fragment>] : []),
            ]}
        />
    );
};
