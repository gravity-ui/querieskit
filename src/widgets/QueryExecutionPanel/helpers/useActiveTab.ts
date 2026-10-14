import {useEffect, useRef, useState} from 'react';
import type {QueryExecutionTabBase} from '../../../types/queryExecutionPanel';

export function useActiveTab({
    tabs,
    activeTab,
    defaultActiveTab,
    preferredActiveTab,
    onActiveTabChange,
}: {
    tabs: QueryExecutionTabBase[];
    activeTab?: string;
    defaultActiveTab?: string;
    preferredActiveTab?: string;
    onActiveTabChange?: (id: string) => void;
}) {
    const available = (id?: string) => tabs.some((tab) => tab.id === id && !tab.disabled);
    const first = tabs.find((tab) => !tab.disabled)?.id;
    const preferred = available(preferredActiveTab) ? preferredActiveTab : undefined;
    const controlled = activeTab !== undefined;
    const [selection, setSelection] = useState(() => ({
        id: available(defaultActiveTab) ? defaultActiveTab : (preferred ?? first),
        manual: false,
        preferred,
    }));

    // Reconcile during rendering so removed/disabled panels are never briefly active.
    let next = selection;
    if (!controlled) {
        let id = selection.id;
        if (!selection.manual && preferred !== selection.preferred && preferred !== undefined) {
            id = preferred;
        } else if (!available(id)) {
            id = preferred ?? first;
        }
        if (id !== selection.id || preferred !== selection.preferred) {
            next = {...selection, id, preferred};
            setSelection(next);
        }
    }

    let selected = next.id;
    if (controlled) selected = available(activeTab) ? activeTab : first;
    const notified = useRef(selected);
    useEffect(() => {
        if (notified.current === selected) return;
        notified.current = selected;
        if (!controlled && selected !== undefined) onActiveTabChange?.(selected);
    }, [controlled, selected, onActiveTabChange]);

    const select = (id: string) => {
        if (!available(id)) return;
        if (controlled) {
            if (id !== selected) onActiveTabChange?.(id);
        } else {
            // Selecting the already-active tab also locks out automatic navigation.
            setSelection((current) => ({...current, id, manual: true}));
        }
    };
    return {selected, select};
}
