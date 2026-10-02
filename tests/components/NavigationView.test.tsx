// @vitest-environment jsdom

import React, {act} from 'react';
import {ThemeProvider} from '@gravity-ui/uikit';
import type {Root} from 'react-dom/client';
import {createRoot} from 'react-dom/client';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {NavigationView} from '../../src/modules/NavigationView';
import {createTableDetailConfig} from '../../src/modules/QueriesNavigation/helpers/createTableDetailConfig';
import type {NavigationViewConfig} from '../../src/types/navigation';

function makeData(): NavigationViewConfig {
    return {
        loaded: true,
        sections: [
            {
                id: 'primary',
                title: 'Primary view',
                columns: ['name', 'count'],
                rows: [
                    {name: 'Alpha record', count: 42},
                    {name: 'Beta record', count: 7, hidden: 'alpha'},
                ],
                loaded: true,
                defaultExpanded: true,
            },
            {
                id: 'secondary',
                title: 'Secondary view',
                columns: ['description'],
                rows: [{description: 'Alpha description'}, {description: 'Gamma description'}],
                loaded: true,
                defaultExpanded: true,
            },
        ],
    };
}

describe('NavigationView search', () => {
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

    function renderContent(content: React.ReactNode) {
        act(() => root.render(<ThemeProvider>{content}</ThemeProvider>));
    }

    function updateSearch(value: string) {
        const input = container.querySelector('input');
        expect(input).not.toBeNull();
        act(() => {
            Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set?.call(
                input,
                value,
            );
            input?.dispatchEvent(new Event('input', {bubbles: true}));
        });
    }

    it('filters each section by its columns and restores all rows when cleared', () => {
        renderContent(<NavigationView data={makeData()} />);

        updateSearch(' ALPHA ');
        expect(container.textContent).toContain('Alpha record');
        expect(container.textContent).toContain('Alpha description');
        expect(container.textContent).not.toContain('Beta record');
        expect(container.textContent).not.toContain('Gamma description');

        updateSearch('42');
        expect(container.textContent).toContain('Alpha record');
        expect(container.textContent).not.toContain('Alpha description');

        updateSearch('');
        expect(container.textContent).toContain('Beta record');
        expect(container.textContent).toContain('Gamma description');
    });

    it('keeps section headings and shows nothing-found for unmatched rows', () => {
        renderContent(<NavigationView data={makeData()} />);

        updateSearch('missing');

        expect(container.textContent).toContain('Primary view');
        expect(container.textContent).toContain('Secondary view');
        expect(container.textContent).not.toContain('Alpha record');
        expect(container.textContent?.match(/Nothing found/g)).toHaveLength(2);
    });

    it('forwards controlled search, its placeholder and updates through the View tab factory', () => {
        const data = makeData();
        const config = createTableDetailConfig({resolveView: () => data})({
            path: '/table',
            title: 'table',
        });
        const viewTab = config.tabs.find((tab) => tab.id === 'view');
        const onSearchUpdate = vi.fn();
        const render = (search: string) => {
            renderContent(
                viewTab?.renderContent?.({
                    search,
                    onSearchUpdate,
                    searchPlaceholder: 'Find view rows',
                }),
            );
        };

        render('Beta');
        expect(container.querySelector('input')?.placeholder).toBe('Find view rows');
        expect(container.querySelector('input')?.value).toBe('Beta');
        expect(container.textContent).toContain('Beta record');
        expect(container.textContent).not.toContain('Alpha record');

        updateSearch('Alpha');
        expect(onSearchUpdate).toHaveBeenLastCalledWith('Alpha');
        expect(container.textContent).toContain('Beta record');

        render('Alpha');
        expect(container.textContent).toContain('Alpha record');
        expect(container.textContent).not.toContain('Beta record');
    });

    it('preserves expansion and passes the original section to actions while filtering', () => {
        const data = makeData();
        const section = data.sections[0];
        const onClick = vi.fn();
        section.actions = [{id: 'open', title: 'Open view', content: 'Open', onClick}];
        renderContent(<NavigationView data={data} />);

        const toggle = Array.from(container.querySelectorAll('button')).find((button) =>
            button.textContent?.includes('Secondary view'),
        );
        expect(toggle?.getAttribute('aria-expanded')).toBe('true');
        act(() => toggle?.click());
        expect(toggle?.getAttribute('aria-expanded')).toBe('false');

        updateSearch('Alpha');
        expect(toggle?.getAttribute('aria-expanded')).toBe('false');
        act(() => container.querySelector<HTMLButtonElement>('[aria-label="Open view"]')?.click());
        expect(onClick).toHaveBeenCalledWith(section);
        expect(onClick.mock.calls[0][0]).toBe(section);
        expect(section.rows).toHaveLength(2);
    });
});
