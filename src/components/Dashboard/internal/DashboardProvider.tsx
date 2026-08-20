import React, {createContext, useContext, useMemo} from 'react';
import type {DashboardRenderItem} from '../types';

type DashboardContextValue = {
    items: DashboardRenderItem[];
    getItem: (id: string) => DashboardRenderItem | undefined;
};

const DashboardContext = createContext<DashboardContextValue | null>(null);

type DashboardProviderProps = {
    items: DashboardRenderItem[];
    children: React.ReactNode;
};

export const DashboardProvider = ({items, children}: DashboardProviderProps) => {
    const contextValue = useMemo<DashboardContextValue>(() => {
        const itemsById = new Map(items.map((item) => [item.id, item]));

        return {
            items,
            getItem: (id: string) => itemsById.get(id),
        };
    }, [items]);

    return <DashboardContext.Provider value={contextValue}>{children}</DashboardContext.Provider>;
};

export const useDashboardContext = () => {
    const context = useContext(DashboardContext);

    if (!context) {
        throw new Error('useDashboardContext must be used within a DashboardProvider');
    }

    return context;
};
