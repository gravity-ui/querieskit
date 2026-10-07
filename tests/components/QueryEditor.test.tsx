// @vitest-environment jsdom
import React, {act, useEffect} from 'react';
import {type Root, createRoot} from 'react-dom/client';
import {ThemeProvider, configure} from '@gravity-ui/uikit';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {QueryEditor} from '../../src/modules/QueryEditor';
import type {QueryEditorProps} from '../../src/types/queryEditor';
import {setLang} from '../../src/i18n';

// Popup positioning requires browser layout. Keep the actual buttons and layout,
// and replace only Select/DropdownMenu popup surfaces to exercise our wiring.
vi.mock('@gravity-ui/uikit', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@gravity-ui/uikit')>();
    return {
        ...actual,
        Select: (props: import('@gravity-ui/uikit').SelectProps) => (
            <label>
                {props.label}
                <select
                    aria-label={props['aria-label']}
                    value={props.value?.[0] ?? ''}
                    disabled={props.disabled}
                    onChange={(event) => props.onUpdate?.([event.target.value])}
                >
                    <option value="" />
                    {props.options?.map(
                        (option) =>
                            'value' in option && (
                                <option
                                    key={option.value}
                                    value={option.value}
                                    disabled={option.disabled}
                                >
                                    {option.content}
                                </option>
                            ),
                    )}
                </select>
            </label>
        ),
        DropdownMenu: (props: import('@gravity-ui/uikit').DropdownMenuProps) => {
            const [open, setOpen] = React.useState(false);
            return (
                <div>
                    {props.renderSwitcher?.({onClick: () => setOpen(!open)})}
                    {open &&
                        props.items?.map(
                            (item, index) =>
                                typeof item === 'object' &&
                                !Array.isArray(item) &&
                                'action' in item && (
                                    <button
                                        key={index}
                                        role="menuitem"
                                        disabled={item.disabled}
                                        onClick={item.action}
                                    >
                                        {item.text}
                                    </button>
                                ),
                        )}
                </div>
            );
        },
    };
});

const editor = vi.hoisted(() => ({mount: vi.fn(), props: {} as Record<string, unknown>}));
vi.mock('../../src/components/MonacoEditor', () => ({
    MonacoEditor: (props: Record<string, unknown>) => {
        editor.props = props;
        useEffect(() => {
            editor.mount();
        }, []);
        return <div data-testid="editor" />;
    },
}));

describe('QueryEditor', () => {
    let container: HTMLDivElement;
    let root: Root;
    let props: QueryEditorProps;
    beforeEach(() => {
        globalThis.IS_REACT_ACT_ENVIRONMENT = true;
        vi.stubGlobal(
            'requestAnimationFrame',
            vi.fn(() => 1),
        );
        vi.stubGlobal('cancelAnimationFrame', vi.fn());
        configure({lang: 'en'});
        setLang('en');
        editor.mount.mockClear();
        container = document.createElement('div');
        document.body.append(container);
        root = createRoot(container);
        props = {
            value: 'select 1',
            onChange: vi.fn(),
            clusters: [
                {id: 'a', title: 'Alpha'},
                {id: 'b', title: 'Beta'},
            ],
            clusterId: 'a',
            onClusterChange: vi.fn(),
            engines: [
                {id: 'yql', title: 'YQL', language: 'yql'},
                {id: 'ch', title: 'CH', language: 'clickhouse'},
            ],
            engineId: 'yql',
            onEngineChange: vi.fn(),
            onRun: vi.fn(),
            onFormat: vi.fn(),
            onValidate: vi.fn(),
        };
    });
    afterEach(() => {
        act(() => root.unmount());
        container.remove();
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
    });
    function render(overrides: Partial<QueryEditorProps> = {}) {
        act(() =>
            root.render(
                <ThemeProvider>
                    <QueryEditor {...props} {...overrides} />
                </ThemeProvider>,
            ),
        );
    }
    function button(label: string) {
        const element = container.querySelector<HTMLButtonElement>(`button[aria-label="${label}"]`);
        if (!element) throw new Error(`Missing ${label}`);
        return element;
    }
    function click(element: HTMLElement) {
        act(() => element.click());
    }
    function separator() {
        return container.querySelector<HTMLElement>('[role="separator"][aria-valuenow]')!;
    }
    function key(value: string) {
        act(() =>
            separator().dispatchEvent(new KeyboardEvent('keydown', {key: value, bubbles: true})),
        );
    }
    it('shows required actions and delegates them; optional actions are absent', () => {
        render();
        for (const [label, callback] of [
            ['Run', props.onRun],
            ['Format', props.onFormat],
            ['Validate', props.onValidate],
        ] as const) {
            click(button(label));
            expect(callback).toHaveBeenCalledTimes(1);
        }
        expect(button('Settings')).toBeTruthy();
        expect(container.querySelector('[aria-label="More actions"]')).toBeNull();
        expect(container.textContent).not.toContain('Code Assistant');
    });
    it('respects disabled/loading actions and optional toolbar/footer callbacks', () => {
        const onRight = vi.fn();
        const onAssistant = vi.fn();
        render({
            actionStates: {run: {disabled: true}, validate: {loading: true}},
            rightActions: [{id: 'custom', title: 'Custom', icon: () => <svg />, onClick: onRight}],
            onCodeAssistantClick: onAssistant,
        });
        click(button('Run'));
        click(button('Validate'));
        click(button('Custom'));
        expect(props.onRun).not.toHaveBeenCalled();
        expect(props.onValidate).not.toHaveBeenCalled();
        expect(onRight).toHaveBeenCalledTimes(1);
        click(
            Array.from(container.querySelectorAll('button')).find((item) =>
                item.textContent?.includes('Code Assistant'),
            )!,
        );
        expect(onAssistant).toHaveBeenCalledTimes(1);
    });
    it('only shows the additional menu for a nonempty list and invokes its item', async () => {
        const onClick = vi.fn();
        render({additionalActions: []});
        expect(container.querySelector('[aria-label="More actions"]')).toBeNull();
        render({additionalActions: [{id: 'extra', title: 'Extra', onClick}]});
        await act(async () => button('More actions').click());
        const item = Array.from(document.querySelectorAll<HTMLElement>('[role="menuitem"]')).find(
            (element) => element.textContent?.includes('Extra'),
        );
        expect(item).toBeTruthy();
        click(item!);
        expect(onClick).toHaveBeenCalledTimes(1);
    });
    it('always keeps empty selectors and does not choose a default', () => {
        render({clusters: [], engines: [], clusterId: undefined, engineId: undefined});
        expect(container.textContent).toContain('Cluster');
        expect(container.textContent).toContain('Engine');
        expect(props.onClusterChange).not.toHaveBeenCalled();
        expect(props.onEngineChange).not.toHaveBeenCalled();
        expect(editor.props.language).toBe('plaintext');
    });
    it('delegates Cluster and Engine changes without selecting them internally', () => {
        render();
        for (const [label, option, callback, id] of [
            ['Cluster', 'Beta', props.onClusterChange, 'b'],
            ['Engine', 'CH', props.onEngineChange, 'ch'],
        ] as const) {
            const trigger = container.querySelector<HTMLSelectElement>(`[aria-label="${label}"]`)!;
            expect(trigger.textContent).toContain(option);
            act(() => {
                trigger.value = id;
                trigger.dispatchEvent(new Event('change', {bubbles: true}));
            });
            expect(callback).toHaveBeenCalledExactlyOnceWith(id);
        }
        expect(editor.props.language).toBe('yql');
    });
    it('toggles uncontrolled Settings without remounting the editor and keeps resized width', () => {
        const onOpen = vi.fn();
        render({onSettingsOpenChange: onOpen});
        const element = container.querySelector('[data-testid="editor"]');
        expect(separator()).toBeNull();
        click(button('Settings'));
        expect(button('Settings').getAttribute('aria-expanded')).toBe('true');
        key('ArrowLeft');
        expect(separator().getAttribute('aria-valuenow')).toBe('336');
        click(button('Close Settings'));
        click(button('Settings'));
        expect(separator().getAttribute('aria-valuenow')).toBe('336');
        expect(container.querySelector('[data-testid="editor"]')).toBe(element);
        expect(editor.mount).toHaveBeenCalledTimes(1);
        expect(onOpen.mock.calls).toEqual([[true], [false], [true]]);
    });
    it('requests controlled visibility and width without mutating either', () => {
        const onOpen = vi.fn();
        const onWidth = vi.fn();
        render({
            settingsOpen: true,
            settingsWidth: 300,
            onSettingsOpenChange: onOpen,
            onSettingsWidthChange: onWidth,
        });
        click(button('Settings'));
        expect(onOpen).toHaveBeenCalledExactlyOnceWith(false);
        expect(separator()).toBeTruthy();
        key('ArrowRight');
        expect(onWidth).toHaveBeenCalledExactlyOnceWith(284);
        expect(separator().getAttribute('aria-valuenow')).toBe('300');
    });
    it('constrains the visible width on container shrink and restores the preferred width on grow', () => {
        const observers = new Map<Element, ResizeObserverCallback>();
        vi.stubGlobal(
            'ResizeObserver',
            class {
                private callback: ResizeObserverCallback;
                constructor(callback: ResizeObserverCallback) {
                    this.callback = callback;
                }
                public observe(element: Element) {
                    observers.set(element, this.callback);
                }
                public disconnect() {}
                public unobserve() {}
            },
        );
        const onWidth = vi.fn();
        render({
            defaultSettingsOpen: true,
            defaultSettingsWidth: 400,
            onSettingsWidthChange: onWidth,
        });
        const split = container.querySelector<HTMLElement>('.qp-query-editor-split');
        if (!split) throw new Error('Missing split container');
        const resize = (width: number) => {
            Object.defineProperty(split, 'clientWidth', {configurable: true, value: width});
            act(() => observers.get(split)?.([], {} as ResizeObserver));
        };
        resize(700);
        expect(separator().getAttribute('aria-valuenow')).toBe('374');
        resize(500);
        expect(separator().getAttribute('aria-valuenow')).toBe('240');
        expect(separator().getAttribute('aria-valuemax')).toBe('240');
        resize(1000);
        expect(separator().getAttribute('aria-valuenow')).toBe('400');
        expect(onWidth).not.toHaveBeenCalled();
        key('End');
        expect(separator().getAttribute('aria-valuenow')).toBe('674');
        expect(onWidth).toHaveBeenCalledExactlyOnceWith(674);
    });
    it('constrains keyboard resizing to the minimum and handles pointer dragging', () => {
        render({defaultSettingsOpen: true});
        key('Home');
        expect(separator().getAttribute('aria-valuenow')).toBe('240');
        key('ArrowRight');
        expect(separator().getAttribute('aria-valuenow')).toBe('240');
        const divider = separator();
        divider.setPointerCapture = vi.fn();
        divider.releasePointerCapture = vi.fn();
        const pointer = (type: string, x: number) => {
            const event = new MouseEvent(type, {bubbles: true, button: 0, clientX: x});
            Object.defineProperty(event, 'pointerId', {value: 1});
            act(() => divider.dispatchEvent(event));
        };
        pointer('pointerdown', 500);
        pointer('pointermove', 450);
        pointer('pointerup', 450);
        expect(divider.getAttribute('aria-valuenow')).toBe('290');
        expect(divider.setPointerCapture).toHaveBeenCalledWith(1);
    });
    it('forwards editor data, options and theme and derives language from selected engine', () => {
        render({engineId: 'ch', readOnly: true, editorOptions: {fontSize: 16}});
        expect(editor.props).toMatchObject({
            value: 'select 1',
            onChange: props.onChange,
            readOnly: true,
            language: 'clickhouse',
            theme: 'light',
        });
        expect(editor.props.monacoConfig).toMatchObject({
            fontSize: 16,
            automaticLayout: true,
            ariaLabel: 'Query editor',
        });
        render({engineId: 'missing'});
        expect(editor.props.language).toBe('plaintext');
        expect(editor.mount).toHaveBeenCalledTimes(1);
    });
});
