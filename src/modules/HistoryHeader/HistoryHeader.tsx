import cn from 'bem-cn-lite';
import React, {FC, useEffect, useState} from 'react';
import {HistoryFilter} from '../../components/HistoryFilter';
import {SearchWithButtons} from '../../components/SearchWithButtons';
import type {HistoryHeaderProps as Props} from '../../types/historyHeaderProps';
import './HistoryHeader.scss';
import i18n from './i18n';
import {FullSearchToggleButton} from './internal/FullSearchToggleButton';
export type {HistoryHeaderProps as Props} from '../../types/historyHeaderProps';

const block = cn('qp-history-header');

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
