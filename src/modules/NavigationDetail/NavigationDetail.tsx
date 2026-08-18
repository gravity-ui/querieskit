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

const getInitialTab = (config: NavigationDetailConfig): string => {
    const visibleTabs = config.tabs.filter((tab) => !tab.hidden);
    const defaultTab = config.defaultTab
        ? visibleTabs.find((tab) => tab.id === config.defaultTab)
        : undefined;
    const firstEnabled = visibleTabs.find((tab) => !tab.disabled);
    return (defaultTab ?? firstEnabled ?? visibleTabs[0])?.id ?? '';
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
    const [activeTabState, setActiveTabState] = useState(() => getInitialTab(config));
    const [searchState, setSearchState] = useState('');

    const activeTab = activeTabProp ?? activeTabState;
    const search = searchProp ?? searchState;

    const handleTabUpdate = (tab: string) => {
        setActiveTabState(tab);
        onTabUpdate?.(tab);
    };

    const handleSearchUpdate = (value: string) => {
        setSearchState(value);
        onSearchUpdate?.(value);
    };

    const visibleTabs = useMemo(() => config.tabs.filter((tab) => !tab.hidden), [config.tabs]);

    const mergedActions = useMemo(() => {
        if (!actions && !config.actions) {
            return undefined;
        }
        return [...(actions ?? []), ...(config.actions ?? [])];
    }, [actions, config.actions]);

    const activeContent = visibleTabs.find((tab) => tab.id === activeTab)?.content ?? null;

    return (
        <Flex direction="column" gap={1} className={block(null, className)}>
            <NavigationHeader
                location={location}
                actions={mergedActions}
                onUpdate={onUpdate}
                onLoadSuggestions={onLoadSuggestions}
            />
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
        </Flex>
    );
};
