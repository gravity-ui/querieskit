// @vitest-environment jsdom
import React, {act} from 'react';
import {type Root, createRoot} from 'react-dom/client';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import meta from '../../src/pages/QueryPage/story/QueryPage.stories';
import {BASE_ITEMS} from '../../src/modules/QueriesHistory/QueriesHistory.stories.data';
import type {QueryHistoryRow} from '../../src/types/history';
import type {QueryPageProps} from '../../src/types/queryPage';

const pagePropsSeen = vi.hoisted(() => vi.fn());
vi.mock('../../src/pages/QueryPage', () => ({
    QueryPage: (props: QueryPageProps) => {
        pagePropsSeen(props);
        return null;
    },
}));
vi.mock('../../src/widgets/QueriesSidebar/QueriesSidebar.stories.data', () => ({
    useQueriesSidebarTabs: () => [
        {id: 'history', type: 'history', props: {items: [], search: {value: ''}}},
    ],
}));
vi.mock('../../src/widgets/QueryExecutionPanel/story/designReference', () => ({designTabs: []}));
vi.mock('storybook/actions', () => ({action: () => vi.fn()}));

const Example = meta.component;
const rows = BASE_ITEMS.filter((item): item is QueryHistoryRow => 'id' in item);
const versionId = (row: QueryHistoryRow) => `${typeof row.id}:${row.id}`;

function required<T>(value: T | undefined): T {
    if (value === undefined) throw new Error('Missing story callback or props');
    return value;
}

describe('QueryPage comparison story', () => {
    let container: HTMLDivElement;
    let root: Root;

    const props = () => required(pagePropsSeen.mock.lastCall)[0] as QueryPageProps;
    const comparison = () => {
        const tab = props().tabsProps.items.find((item) => item.type === 'comparison');
        if (tab?.type !== 'comparison') throw new Error('Missing comparison tab');
        return tab;
    };
    const openComparison = () => {
        act(() => required(props().historyActions?.onCompare)(rows[0], rows[1], 'history'));
    };
    const edit = (value: string) => {
        act(() => required(comparison().comparisonProps.onBlockChange)('query', value));
    };

    beforeEach(() => {
        globalThis.IS_REACT_ACT_ENVIRONMENT = true;
        pagePropsSeen.mockClear();
        container = document.createElement('div');
        document.body.append(container);
        root = createRoot(container);
        act(() => root.render(<Example />));
    });

    afterEach(() => {
        act(() => root.unmount());
        container.remove();
    });

    it('opens an editable comparison and preserves the draft when changing the baseline', () => {
        openComparison();
        expect(props().tabsProps.activeTab).toBe(comparison().id);
        expect(comparison().comparisonProps.readOnly).not.toBe(true);
        expect(comparison().comparisonProps.onBlockChange).toBeTypeOf('function');
        expect(comparison().comparisonProps.items[0]).toMatchObject({
            original: rows[0].query,
            modified: rows[1].query,
        });
        expect(comparison().comparisonProps.actions?.hasChanges).toBe(false);

        edit('SELECT 42 AS draft;');
        act(() =>
            required(comparison().comparisonProps.versionSelection).onChange({
                originalId: versionId(rows[2]),
                modifiedId: versionId(rows[1]),
            }),
        );
        expect(comparison().comparisonProps.items[0]).toMatchObject({
            original: rows[2].query,
            modified: 'SELECT 42 AS draft;',
        });
        expect(comparison().comparisonProps.actions?.hasChanges).toBe(true);
    });

    it('creates and activates a new query with the latest comparison draft', () => {
        openComparison();
        edit('SELECT 1;');
        edit('SELECT 2 AS latest;');
        const previousIds = props().tabsProps.items.map(({id}) => id);
        act(() => required(comparison().comparisonProps.actions?.onCreateQuery)());
        const created = props().tabsProps.items.find(({id}) => !previousIds.includes(id));
        if (created?.type !== 'query') throw new Error('Missing created query');
        expect(props().tabsProps.activeTab).toBe(created.id);
        expect(created.editorProps.value).toBe('SELECT 2 AS latest;');
        expect(created.isModified).toBe(true);
        expect(props().tabsProps.items).toHaveLength(previousIds.length + 1);
    });

    it('resets to the saved target and saves the draft into history', () => {
        openComparison();
        edit('SELECT 42;');
        act(() => required(comparison().comparisonProps.actions?.onReset)());
        expect(comparison().comparisonProps.items[0].modified).toBe(rows[1].query);
        expect(comparison().comparisonProps.actions?.hasChanges).toBe(false);

        edit('SELECT 43 AS saved;');
        act(() => required(comparison().comparisonProps.actions?.onSave)());
        expect(comparison().comparisonProps.actions?.hasChanges).toBe(false);
        const history = props().sidebarProps.tabs.find((tab) => tab.type === 'history');
        if (history?.type !== 'history') throw new Error('Missing history tab');
        expect(
            history.props.items.find((row) => 'id' in row && row.id === rows[1].id),
        ).toMatchObject({
            query: 'SELECT 43 AS saved;',
        });

        edit('SELECT 44 AS unsaved;');
        act(() => required(comparison().comparisonProps.actions?.onReset)());
        expect(comparison().comparisonProps.items[0].modified).toBe('SELECT 43 AS saved;');
        expect(comparison().comparisonProps.actions?.hasChanges).toBe(false);
    });
});
