import React, {useMemo, useState} from 'react';
import cn from 'bem-cn-lite';
import {Flex} from '@gravity-ui/uikit';
import {NavigationHeader} from '../NavigationHeader';
import {SearchWithButtons} from '../../components';
import {
    NavigationDetailConfig,
    NavigationHeaderAction,
    NavigationLocation,
} from '../../types/navigation';
import type {LoadPathSuggestions} from '../../types/pathEditor';
import {NavigationDetailTabs} from './internal/NavigationDetailTabs';
import {getInitialTab} from './helpers/getInitialTab';
import {getVisibleTabs} from './helpers/getVisibleTabs';
import './NavigationDetail.scss';

const block = cn('qp-navigation-detail');

export type NavigationDetailProps = {
    config: NavigationDetailConfig;
    location: NavigationLocation;
    onUpdate: (location: NavigationLocation) => void;
    onLoadSuggestions?: LoadPathSuggestions;
    actions?: NavigationHeaderAction[];
    activeTab?: string;
    onTabUpdate?: (tab: string) => void;
    search?: string;
    onSearchUpdate?: (value: string) => void;
    className?: string;
};

export const NavigationDetail: React.FC<NavigationDetailProps> = ({
    config,
    location,
    onUpdate,
    onLoadSuggestions,
    actions,
    activeTab: activeTabProp,
    onTabUpdate,
    search: searchProp,
    onSearchUpdate,
    className,
}) => {
    const isTabControlled = activeTabProp !== undefined;
    const isSearchControlled = searchProp !== undefined;

    const visibleTabs = useMemo(() => getVisibleTabs(config.tabs), [config.tabs]);

    const [activeTabState, setActiveTabState] = useState(() =>
        getInitialTab(visibleTabs, config.defaultTab),
    );
    const [searchState, setSearchState] = useState('');

    const activeTab = isTabControlled ? activeTabProp : activeTabState;
    const search = isSearchControlled ? searchProp : searchState;

    const handleTabUpdate = (tab: string) => {
        if (!isTabControlled) {
            setActiveTabState(tab);
        }
        onTabUpdate?.(tab);
    };

    const handleSearchUpdate = (value: string) => {
        if (!isSearchControlled) {
            setSearchState(value);
        }
        onSearchUpdate?.(value);
    };

    const mergedActions = useMemo(() => {
        if (!actions && !config.actions) {
            return undefined;
        }
        return [...(actions ?? []), ...(config.actions ?? [])];
    }, [actions, config.actions]);

    const activeTabConfig = visibleTabs.find((tab) => tab.id === activeTab);
    const activeContent = activeTabConfig
        ? (activeTabConfig.renderContent?.({
              search,
              onSearchUpdate: handleSearchUpdate,
              searchPlaceholder: config.searchPlaceholder,
          }) ??
          activeTabConfig.content ??
          null)
        : null;

    const hasTabs = visibleTabs.length > 0;

    return (
        <Flex direction="column" gap={2} className={block(null, className)}>
            <NavigationHeader
                location={location}
                actions={mergedActions}
                onUpdate={onUpdate}
                onLoadSuggestions={onLoadSuggestions}
            />
            {hasTabs ? (
                <>
                    <NavigationDetailTabs
                        tabs={visibleTabs}
                        activeTab={activeTab}
                        onUpdate={handleTabUpdate}
                        className={block('tabs')}
                    />
                    {config.hasSearch && (
                        <SearchWithButtons
                            placeholder={config.searchPlaceholder}
                            value={search}
                            onUpdate={handleSearchUpdate}
                        />
                    )}
                    <div className={block('content')}>{activeContent}</div>
                </>
            ) : (
                config.emptyContent
            )}
        </Flex>
    );
};
