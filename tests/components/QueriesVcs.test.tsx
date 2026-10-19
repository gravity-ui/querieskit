// @vitest-environment jsdom
import React, {act} from 'react';
import {type Root, createRoot} from 'react-dom/client';
import {ThemeProvider, configure} from '@gravity-ui/uikit';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {QueriesVcs} from '../../src/modules/QueriesVcs';
import type {QueriesVcsProps, VcsItem, VcsLocation} from '../../src/types/queriesVcs';

vi.mock('../../src/components/MonacoEditor', () => ({
    MonacoEditor: ({value}: {value?: string}) => <div data-testid="editor" data-value={value} />,
}));

type File = VcsItem & {revision: number};
const folder: File = {path: '/queries/nested', title: 'nested', kind: 'folder', revision: 1};
const file: File = {path: '/queries/report.sql', title: 'report.sql', kind: 'file', revision: 2};
const location: VcsLocation = {
    providerId: 'git',
    repositoryId: 'reports',
    branch: 'main',
    path: '/queries',
};

describe('QueriesVcs', () => {
    let container: HTMLDivElement;
    let root: Root;
    const onUpdate = vi.fn();
    const onOpen = vi.fn();
    const onClose = vi.fn();
    const base = (): QueriesVcsProps<File> => ({
        location,
        onUpdate,
        providers: {
            items: [
                {id: 'git', title: 'Git'},
                {id: 'mirror', title: 'Mirror'},
            ],
        },
        branches: {
            items: [
                {id: 'main', title: 'main'},
                {id: 'draft', title: 'draft'},
            ],
        },
        items: [folder, file],
        listState: {loaded: true},
        detail: {onOpen, onClose},
    });
    async function render(props: Partial<QueriesVcsProps<File>> = {}) {
        await act(async () =>
            root.render(
                <ThemeProvider>
                    <QueriesVcs {...base()} {...props} />
                </ThemeProvider>,
            ),
        );
    }
    function clickText(text: string) {
        const element = Array.from(container.querySelectorAll<HTMLElement>('span, div')).find(
            (node) => node.textContent === text && node.childElementCount === 0,
        );
        expect(element, `Expected rendered text: ${text}`).toBeTruthy();
        act(() => element?.click());
    }
    function clickButton(label: string) {
        const button = document.querySelector<HTMLButtonElement>(`button[aria-label="${label}"]`);
        expect(button, `Expected button: ${label}`).toBeTruthy();
        act(() => button?.click());
    }
    async function select(label: string, value: string) {
        clickButton(label);
        const option = Array.from(document.querySelectorAll<HTMLElement>('[role="option"]')).find(
            (node) => node.textContent === value,
        );
        expect(option, `Expected option: ${value}`).toBeTruthy();
        await act(async () => option?.click());
    }
    beforeEach(() => {
        globalThis.IS_REACT_ACT_ENVIRONMENT = true;
        configure({lang: 'en'});
        vi.clearAllMocks();
        vi.stubGlobal(
            'ResizeObserver',
            class {
                public observe() {}
                public unobserve() {}
                public disconnect() {}
            },
        );
        vi.stubGlobal(
            'IntersectionObserver',
            class {
                public observe() {}
                public unobserve() {}
                public disconnect() {}
            },
        );
        vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
            x: 0,
            y: 0,
            top: 0,
            left: 0,
            bottom: 600,
            right: 360,
            width: 360,
            height: 600,
            toJSON() {},
        });
        container = document.createElement('div');
        document.body.append(container);
        root = createRoot(container);
    });
    afterEach(() => {
        act(() => root.unmount());
        container.remove();
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
    });

    it('shows only VCS and branch selectors and allows branches without repository context', async () => {
        await render({location: {providerId: 'git', path: '/'}});
        expect(container.querySelectorAll('.g-select')).toHaveLength(2);
        expect(container.querySelector('[aria-label="Repository"]')).toBeNull();
        await select('Branch', 'draft');
        expect(onUpdate).toHaveBeenCalledWith({providerId: 'git', branch: 'draft', path: '/'});
    });

    it.each([
        [
            'VCS',
            'Mirror',
            {providerId: 'mirror', repositoryId: undefined, branch: undefined, path: '/'},
        ],
        ['Branch', 'draft', {...location, branch: 'draft', path: '/'}],
    ])('resets dependent state when changing %s', async (label, value, next) => {
        await render();
        await select(label as string, value as string);
        expect(onUpdate).toHaveBeenCalledWith(next);
        expect(onClose).toHaveBeenCalledOnce();
    });

    it('reveals contents only after selecting VCS and branch and receiving data', async () => {
        const search = {value: '', onUpdate: vi.fn()};
        const expectHidden = () => {
            expect(container.querySelector('.qp-navigation-items-list')).toBeNull();
            expect(container.querySelector('input[placeholder="Search files"]')).toBeNull();
            expect(container.querySelector('[aria-label="Edit path"]')).toBeNull();
            expect(container.textContent).not.toContain('report.sql');
        };
        await render({location: {path: '/'}, search});
        expectHidden();
        await render({
            location: {providerId: 'git', path: '/'},
            search,
            branches: {items: [], loading: true},
        });
        expectHidden();
        expect(container.querySelector<HTMLButtonElement>('[aria-label="Branch"]')?.disabled).toBe(
            true,
        );
        await render({search, listState: undefined});
        expectHidden();
        await render({search, listState: {loaded: false, loading: true}});
        expectHidden();
        expect(container.querySelector('[role="status"]')).not.toBeNull();
        await render({search, listState: {loaded: true}});
        expect(container.querySelector('.qp-navigation-items-list')).not.toBeNull();
        expect(container.querySelector('input[placeholder="Search files"]')).not.toBeNull();
        expect(container.textContent).toContain('report.sql');
        await render({
            search,
            location: {...location, branch: 'draft'},
            listState: {loaded: false, loading: true},
        });
        expectHidden();
        await render({search, items: [], listState: {loaded: true}});
        expect(container.querySelector('.qp-navigation-items-list')).not.toBeNull();
        expect(container.querySelector('input[placeholder="Search files"]')).not.toBeNull();
    });

    it('hides stale content on selector and repository errors without invoking renderers', async () => {
        const renderRowItem = vi.fn(() => <span>stale row</span>);
        const renderContent = vi.fn(() => <span>stale preview</span>);
        const props = {
            renderRowItem,
            search: {value: ''},
            detail: {openedFile: {item: file, location}, renderContent},
        };
        await render({...props, branches: {items: base().branches.items, loading: true}});
        expect(renderRowItem).not.toHaveBeenCalled();
        expect(renderContent).not.toHaveBeenCalled();
        await render({...props, branches: {items: [], error: 'Branches unavailable'}});
        expect(container.textContent).toContain('Branches unavailable');
        expect(container.querySelector('input[placeholder="Search files"]')).toBeNull();
        await render({...props, listState: {loaded: false, error: 'Repository unavailable'}});
        expect(container.querySelector('[role="alert"]')?.textContent).toBe(
            'Repository unavailable',
        );
        expect(renderContent).not.toHaveBeenCalled();
        expect(container.querySelector('.qp-navigation-items-list')).toBeNull();
    });

    it('retains path and filter while loading a directory but resets them for another branch', async () => {
        const search = {value: '', onUpdate: vi.fn()};
        await render({search});
        const filter = container.querySelector('input[placeholder="Search files"]');
        expect(filter).not.toBeNull();
        clickText('nested');
        expect(onUpdate).toHaveBeenCalledWith({...location, path: folder.path});
        const next = {...location, path: folder.path};
        await render({search, location: next, listState: {loaded: false, loading: true}});
        expect(container.querySelector('input[placeholder="Search files"]')).toBe(filter);
        expect(container.querySelector('[aria-label="Edit path"]')).not.toBeNull();
        expect(container.querySelector('[role="status"]')).not.toBeNull();
        expect(container.querySelector('.qp-navigation-items-list')).toBeNull();
        expect(container.textContent).not.toContain('report.sql');
        await render({
            search,
            location: next,
            listState: {loaded: false, error: 'Folder unavailable'},
        });
        expect(container.querySelector('input[placeholder="Search files"]')).toBe(filter);
        expect(container.querySelector('[role="alert"]')?.textContent).toBe('Folder unavailable');
        await render({search, location: next, items: [], listState: {loaded: true}});
        expect(container.querySelector('input[placeholder="Search files"]')).toBe(filter);
        expect(container.querySelector('.qp-navigation-items-list')).not.toBeNull();
        await render({
            search,
            location: {...location, branch: 'draft'},
            listState: {loaded: false, loading: true},
        });
        expect(container.querySelector('input[placeholder="Search files"]')).toBeNull();
        expect(container.querySelector('[aria-label="Edit path"]')).toBeNull();
        expect(container.querySelector('[role="status"]')).not.toBeNull();
    });

    it('keeps successful contents visible while loading another page', async () => {
        await render({
            search: {value: ''},
            listState: {loaded: true, loading: true, hasMore: true},
        });
        expect(container.textContent).toContain('report.sql');
        expect(container.querySelector('input[placeholder="Search files"]')).not.toBeNull();
    });

    it('navigates folders and opens files with original metadata and directory context', async () => {
        await render();
        clickText('nested');
        expect(onUpdate).toHaveBeenCalledWith({...location, path: folder.path});
        clickText('report.sql');
        expect(onOpen).toHaveBeenCalledWith({item: file, location});
    });

    it('does not pass the synthetic parent to custom row or icon renderers', async () => {
        const renderRowItem = vi.fn(({item}: {item: File}) => (
            <span>
                {item.revision}:{item.title}
            </span>
        ));
        await render({renderRowItem});
        expect(renderRowItem).toHaveBeenCalled();
        expect(
            renderRowItem.mock.calls.every(([ctx]) => ctx.item === file || ctx.item === folder),
        ).toBe(true);
        clickText('…');
        expect(onUpdate).toHaveBeenCalledWith({...location, path: '/'});
        const renderItemIcon = vi.fn(({item}: {item: File}) => (
            <span data-custom-icon={item.path}>{item.revision}</span>
        ));
        await render({renderItemIcon});
        expect(container.querySelectorAll('[data-custom-icon]')).toHaveLength(2);
        expect(
            renderItemIcon.mock.calls.every(([ctx]) => ctx.item === file || ctx.item === folder),
        ).toBe(true);
    });

    it('supports a custom header with controlled navigation', async () => {
        await render({
            renderHeader: (context) => (
                <button onClick={() => context.onUpdate({...location, path: '/'})}>
                    Custom header
                </button>
            ),
        });
        const button = Array.from(container.querySelectorAll('button')).find(
            (node) => node.textContent === 'Custom header',
        );
        act(() => button?.click());
        expect(onUpdate).toHaveBeenCalledWith({...location, path: '/'});
    });

    it('renders empty file text and closes the default preview', async () => {
        await render({detail: {openedFile: {item: file, location}, content: '', onClose}});
        expect(container.querySelector('[data-testid="editor"]')?.getAttribute('data-value')).toBe(
            '',
        );
        clickButton('Back to files');
        expect(onClose).toHaveBeenCalledOnce();
    });

    it('passes content, errors and actions to a full custom preview', async () => {
        const renderContent = vi.fn((context) => <span>Preview {context.item.revision}</span>);
        const onInsertFile = vi.fn();
        await render({
            onInsertFile,
            detail: {
                openedFile: {item: file, location},
                content: '',
                error: 'Could not read',
                renderContent,
                onClose,
            },
        });
        expect(container.textContent).toContain('Preview 2');
        expect(container.querySelector('[data-testid="editor"]')).toBeNull();
        expect(renderContent).toHaveBeenCalledWith(
            expect.objectContaining({
                item: file,
                location,
                content: '',
                error: 'Could not read',
                onClose: expect.any(Function),
            }),
        );
        const context = renderContent.mock.calls[0][0];
        context.actions[0].onClick({item: file, location});
        expect(onInsertFile).toHaveBeenCalledWith({item: file, location});
    });

    it.each(['providerId', 'repositoryId', 'branch', 'path'] as const)(
        'hides stale previews when %s differs',
        async (field) => {
            await render({
                detail: {
                    openedFile: {item: file, location: {...location, [field]: 'other'}},
                    renderContent: () => <span>Stale preview</span>,
                },
            });
            expect(container.textContent).not.toContain('Stale preview');
            expect(container.textContent).toContain('report.sql');
        },
    );

    it('shows file errors without navigating into a folder', async () => {
        await render({
            detail: {openedFile: {item: file, location}, error: 'Cannot read file', onClose},
        });
        expect(container.textContent).toContain('Cannot read file');
        expect(onUpdate).not.toHaveBeenCalled();
        expect(container.querySelector('[data-testid="editor"]')).toBeNull();
    });

    it('isolates file action clicks from row opening and replaces default actions', async () => {
        const onInsertFile = vi.fn();
        await render({onInsertFile});
        clickButton('Insert file');
        expect(onInsertFile).toHaveBeenCalledWith({item: file, location});
        expect(onOpen).not.toHaveBeenCalled();
        const onClick = vi.fn();
        await render({
            onInsertFile,
            getFileActions: () => [
                {id: 'custom', title: 'Custom action', content: 'Custom', onClick},
            ],
        });
        expect(container.querySelector('[aria-label="Insert file"]')).toBeNull();
        clickButton('Custom action');
        expect(onClick).toHaveBeenCalledWith({item: file, location});
        expect(onOpen).not.toHaveBeenCalled();
    });

    it('isolates keyboard file actions from the active list row', async () => {
        const onInsertFile = vi.fn();
        const rootLocation = {...location, path: '/'};
        await render({location: rootLocation, items: [file], onInsertFile});
        const list = container.querySelector<HTMLElement>('.qp-lazy-list');
        const button = container.querySelector<HTMLButtonElement>('[aria-label="Insert file"]');
        if (!list || !button) throw new Error('File list or insert action is missing');
        act(() =>
            list.dispatchEvent(new KeyboardEvent('keydown', {key: 'ArrowDown', bubbles: true})),
        );
        // Prove a list-level Enter would open the active row before exercising the action.
        act(() => list.dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter', bubbles: true})));
        expect(onOpen).toHaveBeenCalledWith({item: file, location: rootLocation});
        onOpen.mockClear();
        act(() => {
            button.focus();
            button.dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter', bubbles: true}));
        });
        expect(onOpen).not.toHaveBeenCalled();
        expect(onUpdate).not.toHaveBeenCalled();
        // jsdom does not generate the native button click from a keyboard event.
        act(() => button.click());
        expect(onInsertFile).toHaveBeenCalledOnce();
        expect(onInsertFile).toHaveBeenCalledWith({item: file, location: rootLocation});
        expect(onOpen).not.toHaveBeenCalled();
    });

    it('distinguishes files with the same title by full path', async () => {
        const other: File = {...file, path: '/archive/report.sql', revision: 3};
        await render({items: [file, other], renderRowItem: ({item}) => <span>{item.path}</span>});
        clickText(other.path);
        expect(onOpen).toHaveBeenCalledWith({item: other, location});
    });

    it('shows errors for the active loading stage', async () => {
        await render({
            providers: {items: [], error: 'Provider unavailable'},
            listState: {error: 'Folder unavailable'},
        });
        expect(container.textContent).toContain('Provider unavailable');
        expect(container.textContent).not.toContain('Folder unavailable');
        await render({listState: {error: 'Folder unavailable'}});
        expect(container.textContent).toContain('Folder unavailable');
    });
    it('delegates manually entered paths without guessing their kind', async () => {
        const onPathSubmit = vi.fn();
        await render({onPathSubmit});
        clickButton('Edit path');
        const input = container.querySelector<HTMLInputElement>('input[placeholder="Path"]');
        if (!input) throw new Error('Path input is missing');
        act(() => {
            Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set?.call(
                input,
                'queries/report.sql',
            );
            input.dispatchEvent(new Event('input', {bubbles: true}));
        });
        act(() => input.dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter', bubbles: true})));
        expect(onPathSubmit).toHaveBeenCalledWith({...location, path: '/queries/report.sql'});
        expect(onUpdate).not.toHaveBeenCalled();
        expect(onOpen).not.toHaveBeenCalled();
    });

    it('supports hidden icons and passes the detail view context to custom icons', async () => {
        await render({renderItemIcon: () => null});
        const row = Array.from(container.querySelectorAll('.qp-navigation-item-row')).find(
            (node) => node.textContent === 'report.sql',
        );
        expect(row).toBeTruthy();
        expect(row?.querySelector('svg')).toBeNull();
        const renderItemIcon = vi.fn(() => <span data-preview-icon>SQL</span>);
        await render({renderItemIcon, detail: {openedFile: {item: file, location}, content: ''}});
        expect(renderItemIcon).toHaveBeenCalledWith({item: file, location, view: 'detail'});
        expect(container.querySelector('[data-preview-icon]')).not.toBeNull();
    });

    it('keeps loading a preview distinct from an empty file', async () => {
        await render({detail: {openedFile: {item: file, location}, loading: true}});
        expect(container.querySelector('[data-testid="editor"]')).toBeNull();
        expect(container.textContent).toContain('report.sql');
        await render({items: [], listState: {loading: true}});
        expect(container.querySelector('[role="status"]')).not.toBeNull();
    });

    it('does not activate disabled files or their actions', async () => {
        const onInsertFile = vi.fn();
        await render({items: [{...file, disabled: true}], onInsertFile});
        clickText('report.sql');
        expect(onOpen).not.toHaveBeenCalled();
        const button = container.querySelector<HTMLButtonElement>('[aria-label="Insert file"]');
        if (!button) throw new Error('Insert action is missing');
        expect(button.disabled).toBe(true);
        act(() => button.click());
        expect(onInsertFile).not.toHaveBeenCalled();
    });
});
