// @vitest-environment jsdom
import React, {act} from 'react';
import {type Root, createRoot} from 'react-dom/client';
import {ThemeProvider, configure} from '@gravity-ui/uikit';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {createTableDetailConfig} from '../../src/modules/QueriesNavigation';
import {NavigationDetail} from '../../src/modules/NavigationDetail';
import type {NavigationDetailConfig, NavigationItem} from '../../src/types/navigation';

const item = {path: '/events', title: 'Events'};

describe('table detail preset composition', () => {
    let container: HTMLDivElement;
    let root: Root;
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
    function render(config: NavigationDetailConfig) {
        act(() =>
            root.render(
                <ThemeProvider>
                    <NavigationDetail
                        config={config}
                        location={{cluster: undefined, path: item.path}}
                        onUpdate={() => {}}
                    />
                </ThemeProvider>,
            ),
        );
    }
    function click(title: string) {
        const button = Array.from(container.querySelectorAll('label')).find(
            (node) => node.textContent === title,
        );
        expect(button).toBeDefined();
        act(() => button?.click());
    }

    it('preserves the default tabs, selection and search settings', () => {
        const config = createTableDetailConfig()(item);
        expect(config.tabs.map((tab) => tab.id)).toEqual(['schema', 'preview', 'meta', 'view']);
        expect(config.tabs.every((tab) => typeof tab.renderContent === 'function')).toBe(true);
        expect(config.defaultTab).toBe('schema');
        expect(config.hasSearch).toBe(false);
        expect(typeof config.searchPlaceholder).toBe('string');
    });

    it('retains standard metadata while replacing schema and preview and omitting view', () => {
        const resolveSchema = vi.fn();
        const resolvePreview = vi.fn();
        const config = createTableDetailConfig({
            resolveMeta: () => ({groups: [{items: [{name: 'Owner', value: 'analytics'}]}]}),
            resolveSchema,
            resolvePreview,
            tabs: [
                'meta',
                {id: 'schema', title: 'Columns', content: 'Custom schema'},
                {id: 'preview', title: 'Sample', renderContent: () => 'Custom preview'},
            ],
        })(item);
        expect(config.tabs.map((tab) => tab.id)).toEqual(['meta', 'schema', 'preview']);
        expect(config.defaultTab).toBe('meta');
        render(config);
        expect(container.textContent).toContain('analytics');
        click('Columns');
        expect(container.textContent).toContain('Custom schema');
        click('Sample');
        expect(container.textContent).toContain('Custom preview');
        expect(resolveSchema).not.toHaveBeenCalled();
        expect(resolvePreview).not.toHaveBeenCalled();
    });

    it('builds item-specific custom tabs and forwards the existing render context', () => {
        type Item = NavigationItem & {rowCount: number};
        const resolve = createTableDetailConfig<Item>({
            tabs: (table) => [
                {id: 'summary', title: 'Summary', content: `${table.title}: ${table.rowCount}`},
                {id: 'preview', renderContent: ({search}) => `${table.path}: ${search}`},
            ],
        });
        const first = resolve({...item, rowCount: 17});
        const second = resolve({path: '/users', title: 'Users', rowCount: 42});
        expect(first.tabs[0].content).toBe('Events: 17');
        expect(second.tabs[0].content).toBe('Users: 42');
        expect(first.tabs[1].renderContent?.({search: 'needle'})).toBe('/events: needle');
        expect(second.tabs[1].renderContent?.({search: 'needle'})).toBe('/users: needle');
    });

    it('selects the first enabled visible tab and supports an empty selection', () => {
        const config = createTableDetailConfig({
            tabs: [{id: 'schema', hidden: true}, {id: 'preview', disabled: true}, 'view', 'meta'],
        })(item);
        expect(config.defaultTab).toBe('view');
        expect(createTableDetailConfig({tabs: []})(item)).toMatchObject({
            tabs: [],
            defaultTab: undefined,
        });
        expect(
            createTableDetailConfig({tabs: [{id: 'schema', disabled: true}]})(item).defaultTab,
        ).toBeUndefined();
    });

    it('lets null content remove a standard renderer and retains custom descriptor semantics', () => {
        const custom = {
            id: 'custom',
            title: 'Custom',
            content: 'Fallback',
            renderContent: () => 'Rendered',
        };
        const config = createTableDetailConfig({tabs: [{id: 'schema', content: null}, custom]})(
            item,
        );
        expect(config.tabs[0].renderContent).toBeUndefined();
        expect(config.tabs[0].content).toBeNull();
        expect(config.tabs[1]).toEqual(custom);
    });

    it('does not mutate caller-owned tab descriptors and keeps standard rendering for title overrides', () => {
        const tab = Object.freeze({id: 'schema' as const, title: 'Fields'});
        const tabs = Object.freeze([tab]);
        const config = createTableDetailConfig({tabs})(item);
        expect(config.tabs[0].title).toBe('Fields');
        expect(typeof config.tabs[0].renderContent).toBe('function');
        expect(tab).toEqual({id: 'schema', title: 'Fields'});
    });
});
