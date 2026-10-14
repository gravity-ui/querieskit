import React from 'react';
import {QueriesHistory} from '../../../modules/QueriesHistory';
import {QueriesNavigation} from '../../../modules/QueriesNavigation';
import {SavedQueries} from '../../../modules/SavedQueries';
import {TutorialsHistory} from '../../../modules/TutorialsHistory';
import type {QueryHistoryRow} from '../../../types/history';
import type {NavigationCluster, NavigationItem} from '../../../types/navigation';
import type {QueriesSidebarTab} from '../../../types/queriesSidebar';
import type {SavedQuery} from '../../../types/savedQueries';
import type {TutorialHistoryRow} from '../../../types/tutorial';
import i18n from '../i18n';

export function SidebarTabContent<
    THistory extends QueryHistoryRow,
    TSaved extends SavedQuery,
    TNavigation extends NavigationItem,
    TCluster extends NavigationCluster,
    TTutorial extends TutorialHistoryRow,
>({
    tab,
    active,
}: {
    tab: QueriesSidebarTab<THistory, TSaved, TNavigation, TCluster, TTutorial>;
    active: boolean;
}) {
    switch (tab.type) {
        case 'history':
            return <QueriesHistory title={i18n('title_history')} {...tab.props} />;
        case 'saved':
            return <SavedQueries {...tab.props} />;
        case 'navigation':
            return <QueriesNavigation {...tab.props} />;
        case 'tutorials':
            return <TutorialsHistory {...tab.props} />;
        case 'custom':
            return tab.renderContent({active});
    }
}
