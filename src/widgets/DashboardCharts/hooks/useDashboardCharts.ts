import {useState} from 'react';
import {DashboardItem} from '../../../components';

export const useDashboardCharts = () => {
    const [dashboardItems, setDashboardItems] = useState<DashboardItem[]>([]);

    const [draftItem, setDraftItem] = useState<DashboardItem | null>(null);

    return {dashboardItems, draftItem, setDashboardItems, setDraftItem};
};
