// @vitest-environment jsdom

import React, {act} from 'react';
import {ThemeProvider} from '@gravity-ui/uikit';
import {createRoot} from 'react-dom/client';
import type {Root} from 'react-dom/client';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {HistoryRow} from '../../src/modules/HistoryRow';
import {HistorySearchRow} from '../../src/modules/HistorySearchRow';
import {SavedQueryRow} from '../../src/modules/SavedQueryRow';
import {SavedQuerySearchRow} from '../../src/modules/SavedQuerySearchRow';
import {formatDateCanonical, formatTime, formatTimeCanonical} from '../../src/helpers/time';
import type {QueryHistoryRow} from '../../src/types/history';
import type {SavedQuery} from '../../src/types/savedQueries';
import type {QueryListFieldKey, QueryListRow} from '../../src/types/queryList';

vi.mock('../../src/components/MonacoEditor', () => ({
    MonacoEditor: ({value}: {value?: string}) => <pre>{value}</pre>,
    MonacoLanguage: {YQL: 'yql'},
}));

const selectedFields = <T extends QueryListRow>(value: QueryListFieldKey<T>[]) => ({
    value,
    fields: [],
    onChange: vi.fn(),
});

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    container = document.createElement('div');
    document.body.append(container);
    root = createRoot(container);
});

afterEach(() => {
    act(() => root.unmount());
    container.remove();
});

function render(node: React.ReactNode) {
    act(() => root.render(<ThemeProvider>{node}</ThemeProvider>));
}

describe.each([
    {name: 'normal history', Row: HistoryRow, format: formatTime},
    {name: 'search history', Row: HistorySearchRow, format: formatTimeCanonical},
])('$name', ({Row, format}) => {
    const item: QueryHistoryRow = {
        id: 'history',
        title: 'History query',
        height: 64,
        status: 'completed',
    };

    it.each([0, 1_700_000_000_000])('renders timestamp %s and its duration', (startTime) => {
        render(
            <Row
                item={{...item, startTime, endTime: startTime + 120_000}}
                index={0}
                isActive={false}
            />,
        );
        expect(container.textContent).toContain(format(startTime));
        expect(container.querySelector('.qp-query-duration')?.textContent).toBe('00:02');
    });

    it('omits missing date and duration', () => {
        render(
            <Row
                item={item}
                index={0}
                isActive={false}
                visibleFields={selectedFields<QueryHistoryRow>(['startTime', 'duration'])}
            />,
        );
        expect(container.querySelector('.qp-query-duration')).toBeNull();
        expect(container.querySelector('.g-text_color_complementary')).toBeNull();
    });

    it.each([[], ['startTime'], ['duration']] as QueryListFieldKey<QueryHistoryRow>[][])(
        'shows only selected timestamp fields %j',
        (...fields) => {
            const startTime = 0;
            render(
                <Row
                    item={{...item, startTime, endTime: 120_000}}
                    index={0}
                    isActive={false}
                    visibleFields={selectedFields<QueryHistoryRow>(fields)}
                />,
            );
            expect(Boolean(container.querySelector('.qp-query-duration'))).toBe(
                fields.includes('duration'),
            );
            const texts = Array.from(
                container.querySelectorAll('.g-text'),
                (element) => element.textContent,
            );
            expect(texts.includes(format(startTime) ?? '')).toBe(fields.includes('startTime'));
        },
    );
});

describe.each([
    {name: 'normal saved query', Row: SavedQueryRow},
    {name: 'search saved query', Row: SavedQuerySearchRow},
])('$name', ({Row}) => {
    const item: SavedQuery = {id: 'saved', title: 'Saved query', height: 64, engine: 'TestEngine'};

    it.each([0, 1_700_000_000_000])(
        'renders saved timestamp %s without field config',
        (savedAt) => {
            render(
                <Row
                    item={{...item, savedAt}}
                    index={0}
                    isActive={false}
                    renderAuthor={() => <span>TestAuthor</span>}
                />,
            );
            expect(container.textContent).toContain(formatDateCanonical(savedAt));
            expect(container.textContent).toContain('TestEngine');
            expect(container.textContent).toContain('TestAuthor');
        },
    );

    it('omits a missing saved date', () => {
        render(
            <Row
                item={item}
                index={0}
                isActive={false}
                visibleFields={selectedFields<SavedQuery>(['savedAt'])}
            />,
        );
        expect(container.textContent?.trim()).toBe(item.title);
    });

    it.each([[], ['savedAt'], ['engine'], ['author']] as QueryListFieldKey<SavedQuery>[][])(
        'shows only selected metadata %j',
        (...fields) => {
            render(
                <Row
                    item={{...item, savedAt: 0}}
                    index={0}
                    isActive={false}
                    visibleFields={selectedFields<SavedQuery>(fields)}
                    renderAuthor={() => <span>TestAuthor</span>}
                />,
            );
            expect(container.textContent?.includes(formatDateCanonical(0) ?? '')).toBe(
                fields.includes('savedAt'),
            );
            expect(container.textContent?.includes('TestEngine')).toBe(fields.includes('engine'));
            expect(container.textContent?.includes('TestAuthor')).toBe(fields.includes('author'));
        },
    );
});
