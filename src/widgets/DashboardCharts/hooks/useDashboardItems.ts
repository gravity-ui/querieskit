import {useState} from 'react';
import {DashboardItem, DashboardProps} from '../../../components';

export const useDashboardItems = (dashboardProps: DashboardProps) => {
    const [dashboardItems, setDashboardItems] = useState<DashboardItem[]>([]);

    const isComponentContolled = Boolean(dashboardProps);
};
