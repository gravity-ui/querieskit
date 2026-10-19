import type {VcsItem} from '../../../types/queriesVcs';
import {useEffect, useState} from 'react';
import type {QueryHistoryRow} from '../../../types/history';
import type {NavigationCluster, NavigationItem} from '../../../types/navigation';
import type {QueriesSidebarProps} from '../../../types/queriesSidebar';
import type {QueryPageHistoryActions} from '../../../types/queryPage';
import type {SavedQuery} from '../../../types/savedQueries';
import type {TutorialHistoryRow} from '../../../types/tutorial';
import i18n from '../i18n';

type HistoryState<T extends QueryHistoryRow> = {
    editingId?: T['id'];
    selected: T[];
};

export function useHistoryActions<
    THistory extends QueryHistoryRow,
    TSaved extends SavedQuery,
    TNavigation extends NavigationItem,
    TCluster extends NavigationCluster,
    TTutorial extends TutorialHistoryRow,
    TVcs extends VcsItem,
>(
    tabs: QueriesSidebarProps<THistory, TSaved, TNavigation, TCluster, TTutorial, TVcs>['tabs'],
    actions?: QueryPageHistoryActions<THistory>,
) {
    const [states, setStates] = useState<Record<string, HistoryState<THistory>>>({});

    const [pendingDelete, setPendingDelete] = useState<{item: THistory; tabId: string}>();
    const canDelete = Boolean(
        pendingDelete &&
        actions?.onDelete &&
        tabs.some((tab) => tab.type === 'history' && tab.id === pendingDelete.tabId),
    );
    useEffect(() => {
        if (!canDelete) setPendingDelete(undefined);
    }, [canDelete]);

    useEffect(() => {
        const historyIds = new Set(
            tabs.filter((tab) => tab.type === 'history').map((tab) => tab.id),
        );
        setStates((current) => {
            const removed = Object.keys(current).filter((id) => !historyIds.has(id));
            if (!removed.length) return current;
            const next = {...current};
            removed.forEach((id) => delete next[id]);
            return next;
        });
    }, [tabs]);

    const updateState = (
        id: string,
        update: (state: HistoryState<THistory>) => HistoryState<THistory>,
    ) => {
        setStates((current) => ({
            ...current,
            [id]: update(current[id] ?? {selected: []}),
        }));
    };

    const historyTabs: typeof tabs = tabs.map((tab) => {
        if (tab.type !== 'history') return tab;
        const {props} = tab;
        const state = states[tab.id];
        // Prefer refreshed rows, but retain snapshots when search or pagination hides them.
        const selected = (state?.selected ?? []).map(
            (row) =>
                props.items.find(
                    (item): item is THistory => !('header' in item) && item.id === row.id,
                ) ?? row,
        );
        const resetComparison = () => updateState(tab.id, (value) => ({...value, selected: []}));
        const resetEditing = () =>
            updateState(tab.id, (value) => ({...value, editingId: undefined}));
        const externalEditing = props.editing?.rowId !== undefined;
        const canRename = !externalEditing && Boolean(actions?.onRename || props.editing?.onSubmit);
        const editingId = state?.editingId;
        const editingRowExists = props.items.some(
            (item) => !('header' in item) && item.id === editingId,
        );

        return {
            ...tab,
            props: {
                ...props,
                getRowActions:
                    props.getRowActions ??
                    (() => [
                        {
                            text: i18n('action_rename'),
                            disabled: !canRename,
                            onClick: (item: THistory) => {
                                if (canRename) {
                                    updateState(tab.id, (value) => ({
                                        ...value,
                                        editingId: item.id,
                                    }));
                                }
                            },
                        },
                        {
                            text: i18n('action_select-for-compare'),
                            disabled: Boolean(props.comparison) || !actions?.onCompare,
                            onClick: (item: THistory) => {
                                if (!props.comparison && actions?.onCompare) {
                                    updateState(tab.id, (value) => ({...value, selected: [item]}));
                                }
                            },
                        },
                        {
                            text: i18n('action_delete'),
                            theme: 'danger' as const,
                            disabled: !actions?.onDelete,
                            onClick: (item: THistory) => {
                                if (actions?.onDelete) setPendingDelete({item, tabId: tab.id});
                            },
                        },
                    ]),
                editing: externalEditing
                    ? props.editing
                    : {
                          ...props.editing,
                          rowId: editingRowExists ? editingId : undefined,
                          onSubmit: (item: THistory, title: string) => {
                              if (actions?.onRename) actions.onRename(item, title, tab.id);
                              else props.editing?.onSubmit?.(item, title);
                              resetEditing();
                          },
                          onCancel: (item: THistory) => {
                              props.editing?.onCancel?.(item);
                              resetEditing();
                          },
                      },
                comparison: props.comparison ?? {
                    enabled: selected.length > 0,
                    comparedRowIds: selected.map((row) => row.id),
                    onChange: (item: THistory, checked: boolean) => {
                        updateState(tab.id, (value) => {
                            if (!checked) {
                                return {
                                    ...value,
                                    selected: value.selected.filter((row) => row.id !== item.id),
                                };
                            }
                            if (value.selected.some((row) => row.id === item.id)) return value;
                            return {...value, selected: [...value.selected.slice(0, 1), item]};
                        });
                    },
                    onCancel: resetComparison,
                    onCompare: () => {
                        if (selected.length !== 2 || !actions?.onCompare) return;
                        actions.onCompare(selected[0], selected[1], tab.id);
                        resetComparison();
                    },
                },
            },
        };
    });

    return {
        tabs: historyTabs,
        deleteConfirmation: {
            item: canDelete ? pendingDelete?.item : undefined,
            onCancel: () => setPendingDelete(undefined),
            onConfirm: () => {
                if (!canDelete || !pendingDelete) return;
                setPendingDelete(undefined);
                actions?.onDelete?.(pendingDelete.item, pendingDelete.tabId);
            },
        },
    };
}
