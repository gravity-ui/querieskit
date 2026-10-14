import {useEffect, useRef, useState} from 'react';
import type {QueriesSidebarTabBase} from '../../../types/queriesSidebar';

export function useActiveTab({
    tabs,
    activeTab,
    defaultActiveTab,
    onActiveTabChange,
}: {
    tabs: QueriesSidebarTabBase[];
    activeTab?: string;
    defaultActiveTab?: string;
    onActiveTabChange?: (id: string) => void;
}) {
    const available = (id?: string) => tabs.some((tab) => tab.id === id && !tab.disabled);
    const first = tabs.find((tab) => !tab.disabled)?.id;
    const controlled = activeTab !== undefined;
    const [selection, setSelection] = useState(defaultActiveTab);
    const requested = controlled ? activeTab : selection;
    const selected = available(requested) ? requested : first;
    if (!controlled && selection !== selected) setSelection(selected);

    const notified = useRef(selected);
    useEffect(() => {
        if (notified.current === selected) return;
        notified.current = selected;
        if (!controlled && selected !== undefined) onActiveTabChange?.(selected);
    }, [controlled, selected, onActiveTabChange]);

    const select = (id: string) => {
        if (!available(id) || id === selected) return;
        if (controlled) onActiveTabChange?.(id);
        else setSelection(id);
    };
    return {selected, select};
}
