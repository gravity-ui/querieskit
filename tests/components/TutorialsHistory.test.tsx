// @vitest-environment jsdom

import React, {act} from 'react';
import type {Root} from 'react-dom/client';
import {createRoot} from 'react-dom/client';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import type {RowsListProps} from '../../src/modules/RowsList';
import type {QueryListLinkRenderer, QueryListRowRenderData} from '../../src/types/queryList';
import type {TutorialHistoryRow} from '../../src/types/tutorial';
import {TutorialsHistory} from '../../src/widgets/TutorialsHistory/TutorialsHistory';

const rowsListState = vi.hoisted(() => ({
    mountCount: 0,
    props: undefined as RowsListProps<TutorialHistoryRow> | undefined,
}));

vi.mock('../../src/modules/HistoryHeader', () => ({HistoryHeader: () => null}));
vi.mock('../../src/modules/HistoryLayout', async () => {
    const ReactModule = await import('react');

    return {
        HistoryLayout: ({children}: {children: React.ReactNode}) =>
            ReactModule.createElement(ReactModule.Fragment, null, children),
    };
});
vi.mock('../../src/modules/RowsList', async () => {
    const ReactModule = await import('react');

    return {
        RowsList: (props: RowsListProps<TutorialHistoryRow>) => {
            const mountId = ReactModule.useState(() => ++rowsListState.mountCount)[0];
            rowsListState.props = props;

            return ReactModule.createElement('div', {
                'data-testid': 'rows-list',
                'data-mount-id': mountId,
            });
        },
    };
});
vi.mock('../../src/widgets/TutorialsHistory/i18n', () => ({
    default: () => 'Tutorials',
}));
vi.mock('../../src/widgets/TutorialsHistory/TutorialRowContent', () => ({
    TutorialRowContent: () => null,
}));

type ExtendedTutorial = TutorialHistoryRow & {source: string};

const HEADER = {header: 'Basics', height: 28};
const FIRST_ITEM: ExtendedTutorial = {
    id: 'lesson-one',
    title: 'First lesson',
    href: '/tutorials/lesson-one',
    height: 28,
    source: 'catalog',
};
const SECOND_ITEM: ExtendedTutorial = {
    id: 'lesson-two',
    title: 'Second lesson',
    href: '/tutorials/lesson-two',
    height: 28,
    source: 'catalog',
};

describe('TutorialsHistory integration API', () => {
    let container: HTMLDivElement;
    let root: Root;

    const renderHistory = (
        props: Partial<React.ComponentProps<typeof TutorialsHistory<ExtendedTutorial>>> = {},
    ) => {
        act(() => {
            root.render(
                <TutorialsHistory<ExtendedTutorial>
                    items={[HEADER, FIRST_ITEM]}
                    search={{onUpdate: vi.fn()}}
                    {...props}
                />,
            );
        });
    };

    beforeEach(() => {
        globalThis.IS_REACT_ACT_ENVIRONMENT = true;
        rowsListState.mountCount = 0;
        rowsListState.props = undefined;
        container = document.createElement('div');
        document.body.append(container);
        root = createRoot(container);
    });

    afterEach(() => {
        act(() => root.unmount());
        container.remove();
    });

    it('passes pagination, selection, and link rendering to RowsList', () => {
        const onLoadMore = vi.fn();
        const renderLink: QueryListLinkRenderer = (props) => <a {...props} />;

        renderHistory({
            selectedRowId: 'lesson-one',
            hasMore: true,
            loading: false,
            onLoadMore,
            renderLink,
        });

        expect(rowsListState.props).toMatchObject({
            selectedRowId: 'lesson-one',
            hasMore: true,
            loading: false,
            onLoadMore,
            renderLink,
            rowVariant: 'default',
        });
    });

    it('keeps the RowsList instance when a pagination page is appended', () => {
        const onLoadMore = vi.fn();
        renderHistory({onLoadMore});
        const initialMountId = container
            .querySelector('[data-testid="rows-list"]')
            ?.getAttribute('data-mount-id');

        renderHistory({items: [HEADER, FIRST_ITEM, SECOND_ITEM], onLoadMore, hasMore: false});

        expect(
            container.querySelector('[data-testid="rows-list"]')?.getAttribute('data-mount-id'),
        ).toBe(initialMountId);

        renderHistory({items: [HEADER, SECOND_ITEM], onLoadMore, hasMore: false});

        expect(
            container.querySelector('[data-testid="rows-list"]')?.getAttribute('data-mount-id'),
        ).not.toBe(initialMountId);
    });

    it('passes complete row data to the custom renderer in both variants', () => {
        const renderLink: QueryListLinkRenderer = (props) => <a {...props} />;
        const renderRowItem = vi.fn(() => undefined);

        renderHistory({renderLink, renderRowItem});
        const defaultData: QueryListRowRenderData<ExtendedTutorial> = {
            item: FIRST_ITEM,
            index: 1,
            isActive: true,
            variant: 'default',
            renderLink,
        };

        expect(rowsListState.props?.renderRow(defaultData)).toBeUndefined();
        expect(renderRowItem).toHaveBeenLastCalledWith(defaultData);
        expect((renderRowItem.mock.lastCall?.[0].item as ExtendedTutorial).source).toBe('catalog');

        renderHistory({
            renderLink,
            renderRowItem,
            search: {value: 'SELECT', fullSearch: true, onUpdate: vi.fn()},
        });
        const searchData: QueryListRowRenderData<ExtendedTutorial> = {
            ...defaultData,
            variant: 'search',
        };

        expect(rowsListState.props?.renderRow(searchData)).toBeUndefined();
        expect(renderRowItem).toHaveBeenLastCalledWith(searchData);

        const headerData: QueryListRowRenderData<ExtendedTutorial> = {
            item: HEADER,
            index: 0,
            isActive: false,
            variant: 'search',
            renderLink,
        };
        rowsListState.props?.renderRow(headerData);
        expect(renderRowItem).toHaveBeenLastCalledWith(headerData);
    });
});
