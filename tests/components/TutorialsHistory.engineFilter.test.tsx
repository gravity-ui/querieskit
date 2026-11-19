// @vitest-environment jsdom

import React, {act} from 'react';
import {type Root, createRoot} from 'react-dom/client';
import {ThemeProvider} from '@gravity-ui/uikit';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {TutorialsHistory} from '../../src/modules/TutorialsHistory';
import type {TutorialsEngineFilterConfig} from '../../src/types/tutorialsHistory';

vi.mock('../../src/components/HistoryFilter', () => ({HistoryFilter: () => null}));
vi.mock('../../src/components/MonacoEditor', () => ({
    MonacoEditor: () => null,
    MonacoLanguage: {YQL: 'yql'},
}));

const engines = [
    {id: 'yql', title: 'YQL'},
    {id: 'chyt', title: 'CHYT'},
];

describe('TutorialsHistory engine filter', () => {
    let container: HTMLDivElement;
    let root: Root;
    const onUpdate = vi.fn();
    const button = () => container.querySelector<HTMLButtonElement>('button[aria-label="Engine"]');
    const render = async (
        engineFilter?: TutorialsEngineFilterConfig,
        search = '',
        fullSearch = false,
    ) => {
        await act(async () =>
            root.render(
                <ThemeProvider>
                    <TutorialsHistory
                        items={[]}
                        search={{value: search, fullSearch, onUpdate: vi.fn()}}
                        engineFilter={engineFilter}
                    />
                </ThemeProvider>,
            ),
        );
    };
    const select = async (title: string) => {
        expect(button()).not.toBeNull();
        await act(async () => button()?.click());
        const option = [...document.querySelectorAll<HTMLElement>('[role="option"]')].find(
            (node) => node.textContent === title,
        );
        expect(option).toBeDefined();
        await act(async () => option?.click());
    };
    beforeEach(() => {
        globalThis.IS_REACT_ACT_ENVIRONMENT = true;
        onUpdate.mockClear();
        vi.stubGlobal(
            'ResizeObserver',
            class {
                public observe() {}
                public unobserve() {}
                public disconnect() {}
            },
        );
        container = document.createElement('div');
        document.body.append(container);
        root = createRoot(container);
    });
    afterEach(() => {
        act(() => root.unmount());
        container.remove();
        vi.unstubAllGlobals();
    });

    it.each([null, undefined])('shows All and an unfiltered empty state for %s', async (value) => {
        await render({engines, value, onUpdate});
        expect(button()?.textContent).toContain('All');
        expect(container.textContent).toContain('No tutorials');
        expect(container.textContent).not.toContain('Nothing found');
        expect(onUpdate).not.toHaveBeenCalled();
    });

    it.each([
        undefined,
        {onUpdate},
        {value: 'yql', onUpdate},
        {engines: [], value: 'yql', onUpdate},
    ])('hides absent/empty engines and ignores their selected value (%j)', async (filter) => {
        await render(filter);
        expect(button()).toBeNull();
        expect(container.textContent).toContain('No tutorials');
        expect(onUpdate).not.toHaveBeenCalled();
    });

    it('preserves engine order, emits selection immediately, and follows controlled updates', async () => {
        await render({engines, onUpdate});
        await act(async () => button()?.click());
        expect(
            [...document.querySelectorAll('[role="option"]')].map((node) => node.textContent),
        ).toEqual(['All', 'YQL', 'CHYT']);
        await act(async () =>
            document.querySelectorAll<HTMLElement>('[role="option"]')[2]?.click(),
        );
        expect(onUpdate).toHaveBeenLastCalledWith('chyt');
        expect(button()?.textContent).toContain('All');
        await render({engines, value: 'chyt', onUpdate});
        expect(button()?.textContent).toContain('CHYT');
        expect(container.textContent).toContain('Nothing found');
        await select('All');
        expect(onUpdate).toHaveBeenLastCalledWith(null);
        await render({engines, value: null, onUpdate});
        expect(button()?.textContent).toContain('All');
        expect(container.textContent).toContain('No tutorials');
    });

    it.each(['', 'all', '__all__', '0'])(
        'does not confuse the engine ID %j with All',
        async (id) => {
            const options = [{id, title: 'Custom engine'}];
            await render({engines: options, onUpdate});
            await select('Custom engine');
            expect(onUpdate).toHaveBeenLastCalledWith(id);
            await render({engines: options, value: id, onUpdate});
            expect(button()?.textContent).toContain('Custom engine');
            expect(container.textContent).toContain('Nothing found');
            await select('All');
            expect(onUpdate).toHaveBeenLastCalledWith(null);
        },
    );

    it.each([false, true])(
        'keeps search empty-state semantics in fullSearch=%s',
        async (fullSearch) => {
            await render({engines, value: 'yql', onUpdate}, 'missing', fullSearch);
            expect(container.textContent).toContain('Nothing found');
            expect(container.querySelector('input')?.value).toBe('missing');
            await render({engines, value: undefined, onUpdate}, 'missing', fullSearch);
            expect(container.textContent).toContain('Nothing found');
            expect(button()?.textContent).toContain('All');
        },
    );
});
