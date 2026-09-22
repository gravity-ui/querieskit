// @vitest-environment jsdom

import React, {act} from 'react';
import type {Root} from 'react-dom/client';
import {createRoot} from 'react-dom/client';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {NavigationHeader} from '../../src/modules/NavigationHeader/NavigationHeader';
import {NavigationDetail} from '../../src/modules/NavigationDetail/NavigationDetail';
import {QueriesNavigation} from '../../src/widgets/QueriesNavigation/QueriesNavigation';
import type {NavigationHeaderAction} from '../../src/types/navigation';

vi.mock('../../src/components/Breadcrumbs', () => ({
    Breadcrumbs: () => <div data-testid="breadcrumbs" />,
}));

const LOCATION = {cluster: 'test', path: '/home'};

const makeAction = (id: string): NavigationHeaderAction => ({
    id,
    title: id,
    content: id,
    onClick: vi.fn(),
});

describe('NavigationHeader actions', () => {
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

    it('keeps rendering standard action buttons by default', () => {
        const action = makeAction('standard-action');

        act(() => {
            root.render(
                <NavigationHeader location={LOCATION} actions={[action]} onUpdate={vi.fn()} />,
            );
        });

        const button = container.querySelector<HTMLButtonElement>(
            'button[aria-label="standard-action"]',
        );
        expect(button).not.toBeNull();

        act(() => button?.click());
        expect(action.onClick).toHaveBeenCalledWith(LOCATION);
    });

    it('renders custom actions directly and treats null as an empty result', () => {
        const action = makeAction('custom-action');
        const renderActions = vi.fn(({location, actions}) => (
            <a href="/custom" data-location={location.path}>
                {actions[0]?.title}
            </a>
        ));

        act(() => {
            root.render(
                <NavigationHeader
                    location={LOCATION}
                    actions={[action]}
                    renderActions={renderActions}
                    onUpdate={vi.fn()}
                />,
            );
        });

        expect(container.querySelector('a[href="/custom"]')?.textContent).toBe('custom-action');
        expect(container.querySelector('button[aria-label="custom-action"]')).toBeNull();
        expect(renderActions).toHaveBeenCalledWith({location: LOCATION, actions: [action]});

        act(() => {
            root.render(
                <NavigationHeader
                    location={LOCATION}
                    actions={[action]}
                    renderActions={() => null}
                    onUpdate={vi.fn()}
                />,
            );
        });

        expect(container.querySelector('button[aria-label="custom-action"]')).toBeNull();
    });

    it('passes an empty array to the custom renderer', () => {
        const renderActions = vi.fn(() => null);

        act(() => {
            root.render(
                <NavigationHeader
                    location={LOCATION}
                    renderActions={renderActions}
                    onUpdate={vi.fn()}
                />,
            );
        });

        expect(renderActions).toHaveBeenCalledWith({location: LOCATION, actions: []});
    });

    it('passes merged detail actions in their existing order', () => {
        const inheritedAction = makeAction('inherited');
        const detailAction = makeAction('detail');
        const renderActions = vi.fn(() => null);

        act(() => {
            root.render(
                <NavigationDetail
                    location={LOCATION}
                    config={{
                        tabs: [{id: 'content', title: 'Content', content: 'content'}],
                        actions: [detailAction],
                    }}
                    actions={[inheritedAction]}
                    renderActions={renderActions}
                    onUpdate={vi.fn()}
                />,
            );
        });

        expect(renderActions).toHaveBeenCalledWith({
            location: LOCATION,
            actions: [inheritedAction, detailAction],
        });
    });

    it('uses detail action precedence and the opened item location in the widget', () => {
        const headerAction = makeAction('header');
        const panelAction = makeAction('panel');
        const configAction = makeAction('config');
        const renderActions = vi.fn(() => null);
        const firstItem = {path: '/home/first', title: 'first'};
        const secondItem = {path: '/home/second', title: 'second'};
        const resolve = () => ({
            tabs: [{id: 'content', title: 'Content', content: 'content'}],
            actions: [configAction],
        });

        act(() => {
            root.render(
                <QueriesNavigation
                    location={LOCATION}
                    onUpdate={vi.fn()}
                    header={{actions: [headerAction], renderActions}}
                    detail={{openedItem: firstItem, actions: [panelAction], resolve}}
                />,
            );
        });

        expect(renderActions).toHaveBeenLastCalledWith({
            location: {cluster: 'test', path: firstItem.path},
            actions: [panelAction, configAction],
        });

        act(() => {
            root.render(
                <QueriesNavigation
                    location={LOCATION}
                    onUpdate={vi.fn()}
                    header={{actions: [headerAction], renderActions}}
                    detail={{openedItem: secondItem, resolve}}
                />,
            );
        });

        expect(renderActions).toHaveBeenLastCalledWith({
            location: {cluster: 'test', path: secondItem.path},
            actions: [headerAction, configAction],
        });
    });
});
