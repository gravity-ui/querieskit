// @vitest-environment jsdom

import React, {act} from 'react';
import type {Root} from 'react-dom/client';
import {createRoot} from 'react-dom/client';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {NavigationItemsList} from '../../src/modules/NavigationItemsList/NavigationItemsList';
import type {NavigationItem} from '../../src/types/navigation';

type LazyListProps = {
    items: NavigationItem[];
    isEmpty?: boolean;
    emptyContent?: React.ReactNode;
    renderItem: (item: NavigationItem, isActive: boolean, index: number) => React.ReactNode;
    onItemClick?: (item: NavigationItem, index: number) => void;
};

const lazyListState = vi.hoisted(() => ({props: undefined as LazyListProps | undefined}));

vi.mock('../../src/components/LazyList', () => ({
    LazyList: (props: LazyListProps) => {
        lazyListState.props = props;
        return <div data-testid="lazy-list">{props.isEmpty ? props.emptyContent : null}</div>;
    },
}));

const ITEM: NavigationItem = {path: '/home/item', title: 'item'};

describe('NavigationItemsList parent row', () => {
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

    const renderList = (
        props: Partial<React.ComponentProps<typeof NavigationItemsList<NavigationItem>>> = {},
    ) => {
        act(() => {
            root.render(
                <NavigationItemsList
                    items={[ITEM]}
                    path="/home/project"
                    titleLabel="Name"
                    {...props}
                />,
            );
        });
    };

    it('keeps the parent hidden during search by default', () => {
        renderList({search: 'item'});
        expect(lazyListState.props?.items).toEqual([ITEM]);

        renderList({search: 'item', parentRow: {showDuringSearch: false}});
        expect(lazyListState.props?.items).toEqual([ITEM]);
    });

    it('shows the parent before results and marks custom render data', () => {
        const renderRowItem = vi.fn(() => null);
        const onItemClick = vi.fn();
        renderList({
            search: 'item',
            parentRow: {showDuringSearch: true},
            renderRowItem,
            onItemClick,
        });

        const parent = lazyListState.props?.items[0];
        expect(parent).toMatchObject({path: '/home', hasChildren: true});
        expect(lazyListState.props?.items[1]).toBe(ITEM);
        if (!parent) {
            throw new Error('Expected a parent row');
        }

        lazyListState.props?.renderItem(parent, false, 0);
        expect(renderRowItem).toHaveBeenCalledWith({
            item: parent,
            index: 0,
            isActive: false,
            isParentRow: true,
        });

        lazyListState.props?.onItemClick?.(parent, 0);
        expect(onItemClick).toHaveBeenCalledTimes(1);
        expect(onItemClick).toHaveBeenCalledWith(parent);
    });

    it('shows the parent once alongside an empty search state', () => {
        const onItemClick = vi.fn();
        renderList({
            items: [],
            search: 'missing',
            parentRow: {showDuringSearch: true},
            emptyContent: <div data-testid="empty-content" />,
            renderRowItem: ({isParentRow}) =>
                isParentRow ? <div data-testid="parent-row-content" /> : null,
            onItemClick,
        });

        expect(container.querySelectorAll('[data-testid="parent-row-content"]')).toHaveLength(1);
        expect(container.querySelector('[data-testid="empty-content"]')).not.toBeNull();

        const parentContainer = container.querySelector('.qp-navigation-items-list__parent-row');
        act(() => parentContainer?.dispatchEvent(new MouseEvent('click', {bubbles: true})));
        expect(onItemClick).toHaveBeenCalledTimes(1);
    });

    it('does not create a parent row at the cluster root', () => {
        renderList({path: '/', search: 'item', parentRow: {showDuringSearch: true}});
        expect(lazyListState.props?.items).toEqual([ITEM]);

        renderList({path: undefined, search: undefined});
        expect(lazyListState.props?.items).toEqual([ITEM]);
    });
});
