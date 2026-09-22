// @vitest-environment jsdom

import React, {act} from 'react';
import type {Root} from 'react-dom/client';
import {createRoot} from 'react-dom/client';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {Breadcrumbs} from '../../src/components/Breadcrumbs/Breadcrumbs';

class ResizeObserverMock {
    disconnect = vi.fn();
    observe = vi.fn();
    unobserve = vi.fn();
}

describe('Breadcrumbs links', () => {
    let container: HTMLDivElement;
    let root: Root;

    beforeEach(() => {
        globalThis.IS_REACT_ACT_ENVIRONMENT = true;
        vi.stubGlobal('ResizeObserver', ResizeObserverMock);
        container = document.createElement('div');
        document.body.append(container);
        root = createRoot(container);
    });

    afterEach(() => {
        act(() => root.unmount());
        container.remove();
        vi.unstubAllGlobals();
    });

    const renderBreadcrumbs = (
        onUpdate = vi.fn(),
        getBreadcrumbHref: (location: {cluster?: string; path?: string}) => string | undefined = ({
            cluster,
            path,
        }) => `#/navigation/${cluster}${path ?? ''}`,
        path = '/home',
    ) => {
        act(() => {
            root.render(
                <Breadcrumbs
                    location={{cluster: 'test', path}}
                    onUpdate={onUpdate}
                    getBreadcrumbHref={getBreadcrumbHref}
                />,
            );
        });
    };

    it('resolves links for root, collapsed ancestors, and the current location', () => {
        const getBreadcrumbHref = vi.fn(
            ({cluster, path}) => `#/navigation/${cluster}${path ?? ''}`,
        );

        renderBreadcrumbs(vi.fn(), getBreadcrumbHref, '/one/two/three');

        expect(getBreadcrumbHref.mock.calls.map(([location]) => location)).toEqual([
            {cluster: 'test', path: undefined},
            {cluster: 'test', path: '/one'},
            {cluster: 'test', path: '/one/two'},
            {cluster: 'test', path: '/one/two/three'},
        ]);
        expect(container.querySelector('a[href="#/navigation/test"]')).not.toBeNull();
        expect(container.querySelector('a[href="#/navigation/test/one/two/three"]')).not.toBeNull();
    });

    it('handles a plain left click on an ancestor exactly once', () => {
        const onUpdate = vi.fn();
        renderBreadcrumbs(onUpdate);
        const rootLink = container.querySelector<HTMLAnchorElement>('a[href="#/navigation/test"]');
        const event = new MouseEvent('click', {bubbles: true, cancelable: true, button: 0});

        act(() => rootLink?.dispatchEvent(event));

        expect(event.defaultPrevented).toBe(true);
        expect(onUpdate).toHaveBeenCalledTimes(1);
        expect(onUpdate).toHaveBeenCalledWith({cluster: 'test', path: undefined});
    });

    it('preserves modified and middle-click browser behavior', () => {
        const onUpdate = vi.fn();
        renderBreadcrumbs(onUpdate);
        const rootLink = container.querySelector<HTMLAnchorElement>('a[href="#/navigation/test"]');

        for (const modifier of ['ctrlKey', 'metaKey', 'shiftKey', 'altKey'] as const) {
            const event = new MouseEvent('click', {
                bubbles: true,
                cancelable: true,
                button: 0,
                [modifier]: true,
            });
            act(() => rootLink?.dispatchEvent(event));
            expect(event.defaultPrevented).toBe(false);
        }

        const middleClick = new MouseEvent('auxclick', {
            bubbles: true,
            cancelable: true,
            button: 1,
        });
        act(() => rootLink?.dispatchEvent(middleClick));

        expect(middleClick.defaultPrevented).toBe(false);
        expect(onUpdate).not.toHaveBeenCalled();
    });

    it('does not navigate again on a plain click of the current link', () => {
        const onUpdate = vi.fn();
        renderBreadcrumbs(onUpdate);
        const currentLink = container.querySelector<HTMLAnchorElement>(
            'a[href="#/navigation/test/home"]',
        );
        const event = new MouseEvent('click', {bubbles: true, cancelable: true, button: 0});

        act(() => currentLink?.dispatchEvent(event));

        expect(event.defaultPrevented).toBe(true);
        expect(onUpdate).not.toHaveBeenCalled();
        expect(currentLink?.getAttribute('aria-current')).toBe('page');
    });

    it('keeps the previous non-link behavior when href is unavailable', () => {
        const onUpdate = vi.fn();
        renderBreadcrumbs(onUpdate, () => undefined);
        const rootItem = Array.from(container.querySelectorAll('[role="link"]')).find(
            (item) => item.textContent === 'test',
        );

        expect(rootItem?.tagName).toBe('SPAN');
        act(() => rootItem?.dispatchEvent(new MouseEvent('click', {bubbles: true, button: 0})));
        expect(onUpdate).toHaveBeenCalledWith({cluster: 'test', path: undefined});
    });
});
