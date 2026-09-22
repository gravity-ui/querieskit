// @vitest-environment jsdom

import React, {act} from 'react';
import type {Root} from 'react-dom/client';
import {createRoot} from 'react-dom/client';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {RowsList} from '../../src/modules/RowsList/RowsList';
import type {
    QueryListItem,
    QueryListLinkRenderer,
    QueryListRowRenderData,
} from '../../src/types/queryList';
import type {TutorialHistoryRow} from '../../src/types/tutorial';

type ExtendedTutorial = TutorialHistoryRow & {source: string};

const lazyListState = vi.hoisted(() => ({
    props: undefined as
        | {
              selectedItemIndex?: unknown;
              renderItem: (
                  item: QueryListItem<ExtendedTutorial>,
                  isActive: boolean,
                  index: number,
              ) => React.ReactNode;
          }
        | undefined,
}));

vi.mock('../../src/components/LazyList', () => ({
    LazyList: (props: NonNullable<typeof lazyListState.props>) => {
        lazyListState.props = props;
        return <div data-testid="lazy-list" />;
    },
}));
vi.mock('../../src/components/EmptyContent', () => ({EmptyContent: () => null}));

const ITEMS: QueryListItem<ExtendedTutorial>[] = [
    {header: 'Basics', height: 28},
    {id: 'first', title: 'First', height: 28, source: 'catalog'},
    {id: 'selected-string-id', title: 'Selected', height: 28, source: 'catalog'},
];

describe('RowsList tutorial data', () => {
    let container: HTMLDivElement;
    let root: Root;

    beforeEach(() => {
        globalThis.IS_REACT_ACT_ENVIRONMENT = true;
        lazyListState.props = undefined;
        container = document.createElement('div');
        document.body.append(container);
        root = createRoot(container);
    });

    afterEach(() => {
        act(() => root.unmount());
        container.remove();
    });

    it('selects a row by string id and prepares complete custom-render data', () => {
        const renderLink: QueryListLinkRenderer = (props) => <a {...props} />;
        const renderRow = vi.fn((_data: QueryListRowRenderData<ExtendedTutorial>) => null);

        act(() => {
            root.render(
                <RowsList
                    items={ITEMS}
                    selectedRowId="selected-string-id"
                    rowVariant="search"
                    renderLink={renderLink}
                    renderRow={renderRow}
                />,
            );
        });

        expect(lazyListState.props?.selectedItemIndex).toBe(2);

        lazyListState.props?.renderItem(ITEMS[2], true, 2);
        expect(renderRow).toHaveBeenCalledWith({
            item: ITEMS[2],
            index: 2,
            isActive: true,
            variant: 'search',
            visibleFields: undefined,
            actions: undefined,
            editing: undefined,
            comparison: undefined,
            renderLink,
        });

        lazyListState.props?.renderItem(ITEMS[0], false, 0);
        expect(renderRow).toHaveBeenLastCalledWith(
            expect.objectContaining({item: ITEMS[0], index: 0, isActive: false}),
        );
    });
});
