// @vitest-environment jsdom
import React, {act} from 'react';
import {type Root, createRoot} from 'react-dom/client';
import {configure} from '@gravity-ui/uikit';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {useHistoryActions} from '../../src/pages/QueryPage/internal/useHistoryActions';
import type {QueryHistoryRow} from '../../src/types/history';
import type {QueriesSidebarTab} from '../../src/types/queriesSidebar';
import type {QueryPageHistoryActions} from '../../src/types/queryPage';

type HistoryTab = Extract<QueriesSidebarTab, {type: 'history'}>;
const rows: QueryHistoryRow[] = [0, '0', 'third'].map((id) => ({
    id,
    title: `Query ${id}`,
    query: `select '${id}'`,
    status: 'completed',
    height: 64,
}));

function history(id = 'history'): HistoryTab {
    return {id, type: 'history', props: {items: rows, search: {onUpdate: vi.fn()}}};
}

describe('QueryPage history actions', () => {
    let container: HTMLDivElement;
    let root: Root;
    let result: QueriesSidebarTab[];

    function Harness({
        tabs,
        actions,
    }: {
        tabs: QueriesSidebarTab[];
        actions?: QueryPageHistoryActions;
    }) {
        result = useHistoryActions(tabs, actions);
        return null;
    }

    function render(tabs: QueriesSidebarTab[], actions?: QueryPageHistoryActions) {
        act(() => root.render(<Harness tabs={tabs} actions={actions} />));
    }

    function props(id = 'history') {
        const tab = result.find((item) => item.id === id);
        if (tab?.type !== 'history') throw new Error(`Missing history tab ${id}`);
        return tab.props;
    }

    function action(index: number, row = rows[0], id = 'history') {
        act(() => props(id).getRowActions!(row)[index].onClick(row));
    }

    beforeEach(() => {
        globalThis.IS_REACT_ACT_ENVIRONMENT = true;
        configure({lang: 'en'});
        container = document.createElement('div');
        document.body.append(container);
        root = createRoot(container);
    });

    afterEach(() => {
        act(() => root.unmount());
        container.remove();
    });

    it('provides the design menu in order and disables unavailable operations', () => {
        render([history()]);
        const menu = props().getRowActions!(rows[0]);
        expect(menu.map((item) => item.text)).toEqual(['Rename', 'Select for Compare', 'Delete']);
        expect(menu.every((item) => item.disabled)).toBe(true);
        expect(menu[2].theme).toBe('danger');
        action(0);
        action(1);
        expect(props().editing?.rowId).toBeUndefined();
        expect(props().comparison?.enabled).toBe(false);
    });

    it('renames ID zero, forwards the history context and clears editing after submit or cancel', () => {
        const onRename = vi.fn();
        const onDelete = vi.fn();
        const onCancel = vi.fn();
        const tab = history();
        tab.props.editing = {onCancel};
        render([tab], {onRename, onDelete});
        action(0);
        expect(props().editing?.rowId).toBe(0);
        act(() => props().editing?.onSubmit?.(rows[0], 'New title'));
        expect(onRename).toHaveBeenCalledExactlyOnceWith(rows[0], 'New title', 'history');
        expect(props().editing?.rowId).toBeUndefined();
        action(0, rows[1]);
        act(() => props().editing?.onCancel?.(rows[1]));
        expect(onCancel).toHaveBeenCalledExactlyOnceWith(rows[1]);
        expect(props().editing?.rowId).toBeUndefined();
        action(2, rows[1]);
        expect(onDelete).toHaveBeenCalledExactlyOnceWith(rows[1], 'history');
    });

    it('uses existing editing persistence when no page rename callback is supplied', () => {
        const tab = history();
        const onSubmit = vi.fn();
        tab.props.editing = {onSubmit};
        render([tab]);
        expect(props().getRowActions!(rows[0])[0].disabled).toBe(false);
        action(0);
        act(() => props().editing?.onSubmit?.(rows[0], 'Saved title'));
        expect(onSubmit).toHaveBeenCalledExactlyOnceWith(rows[0], 'Saved title');
        expect(props().editing?.rowId).toBeUndefined();
    });

    it('keeps the first and latest selections and distinguishes numeric and string IDs', () => {
        const onCompare = vi.fn();
        render([history()], {onCompare});
        action(1);
        expect(props().comparison?.comparedRowIds).toEqual([0]);
        act(() => props().comparison?.onCompare());
        expect(onCompare).not.toHaveBeenCalled();
        act(() => props().comparison?.onChange(rows[1], true));
        expect(props().comparison?.comparedRowIds).toEqual([0, '0']);
        act(() => props().comparison?.onChange(rows[1], true));
        expect(props().comparison?.comparedRowIds).toEqual([0, '0']);
        act(() => props().comparison?.onChange(rows[2], true));
        expect(props().comparison?.comparedRowIds).toEqual([0, 'third']);
        act(() => props().comparison?.onCompare());
        expect(onCompare).toHaveBeenCalledExactlyOnceWith(rows[0], rows[2], 'history');
        expect(props().comparison?.enabled).toBe(false);
        expect(props().comparison?.comparedRowIds).toEqual([]);
    });

    it('supports deselection and cancellation without opening a comparison', () => {
        const onCompare = vi.fn();
        render([history()], {onCompare});
        action(1);
        act(() => props().comparison?.onChange(rows[1], true));
        act(() => props().comparison?.onChange(rows[0], false));
        expect(props().comparison?.comparedRowIds).toEqual(['0']);
        act(() => props().comparison?.onCancel());
        expect(props().comparison?.enabled).toBe(false);
        expect(props().comparison?.comparedRowIds).toEqual([]);
        expect(onCompare).not.toHaveBeenCalled();
    });

    it('retains filtered selection snapshots while using refreshed visible rows', () => {
        const onCompare = vi.fn();
        const tab = history();
        render([tab], {onCompare});
        action(1);
        act(() => props().comparison?.onChange(rows[1], true));
        const refreshed = {...rows[1], title: 'Updated query'};
        render(
            [{...tab, props: {...tab.props, items: [{header: 'Today', height: 32}, refreshed]}}],
            {onCompare},
        );
        expect(props().comparison?.comparedRowIds).toEqual([0, '0']);
        act(() => props().comparison?.onCompare());
        expect(onCompare).toHaveBeenCalledExactlyOnceWith(rows[0], refreshed, 'history');
    });

    it('preserves consumer menus and controlled editing and comparison objects', () => {
        const tab = history();
        const getRowActions = vi.fn(() => [{text: 'Custom', onClick: vi.fn()}]);
        const editing = {rowId: 0, onSubmit: vi.fn(), onCancel: vi.fn()};
        const comparison = {
            enabled: true,
            comparedRowIds: [0, '0'],
            onChange: vi.fn(),
            onCompare: vi.fn(),
            onCancel: vi.fn(),
        };
        tab.props = {...tab.props, getRowActions, editing, comparison};
        render([tab], {onRename: vi.fn(), onCompare: vi.fn(), onDelete: vi.fn()});
        expect(props().getRowActions).toBe(getRowActions);
        expect(props().editing).toBe(editing);
        expect(props().comparison).toBe(comparison);
        expect(props().search).toBe(tab.props.search);
    });

    it('isolates history tab state and clears removed tabs while retaining other tab objects', () => {
        const first = history();
        const second = history('other');
        const custom: QueriesSidebarTab = {
            id: 'custom',
            type: 'custom',
            title: 'Custom',
            icon: null,
            renderContent: () => null,
        };
        const callbacks = {onCompare: vi.fn(), onRename: vi.fn()};
        render([first, second, custom], callbacks);
        expect(result[2]).toBe(custom);
        action(1);
        action(0, rows[1], 'other');
        expect(props('other').comparison?.enabled).toBe(false);
        expect(props().editing?.rowId).toBeUndefined();
        expect(props('other').editing?.rowId).toBe('0');
        render([second, custom], callbacks);
        render([first, second, custom], callbacks);
        expect(props().comparison?.enabled).toBe(false);
        expect(props('other').editing?.rowId).toBe('0');
    });
});
