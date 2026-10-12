// @vitest-environment jsdom
import React, {act, useEffect} from 'react';
import {type Root, createRoot} from 'react-dom/client';
import {TextInput, ThemeProvider, configure} from '@gravity-ui/uikit';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {QueryEditor} from '../../src/modules/QueryEditor';
import {QuerySettings} from '../../src/modules/QuerySettings';
import type {QueryEditorEngine, QueryEditorProps} from '../../src/types/queryEditor';
import type {QuerySettingsValue} from '../../src/types/querySettings';
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
    it('forwards integrations and derives context from the selected engine and cluster', () => {
        const integrations = {
            editorRef: React.createRef<import('monaco-editor').editor.IStandaloneCodeEditor>(),
            providers: {completion: false} as const,
            extensions: [],
            showStatusBar: true,
            diagnostics: [],
            highlightErrorLines: true,
            highlightedLine: 2,
            onLineNumberClick: vi.fn(),
            onClick: vi.fn(),
            onFocus: vi.fn(),
            onBlur: vi.fn(),
        };
        const data = {catalog: 'test'};
        render({...integrations, providerContext: {language: 'wrong', clusterId: 'wrong', data}});
        for (const [key, value] of Object.entries(integrations))
            expect(editor.props[key]).toBe(value);
        expect(editor.props.providerContext).toEqual({
            language: 'yql',
            engineId: 'yql',
            clusterId: 'a',
            data,
        });
        render({...integrations, engineId: 'ch', clusterId: 'b', providerContext: {data}});
        expect(editor.props.providerContext).toEqual({
            language: 'clickhouse',
            engineId: 'ch',
            clusterId: 'b',
            data,
        });
        expect(editor.mount).toHaveBeenCalledTimes(1);
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
    it('keeps settings content mounted across closing and resizing, independently of query text', () => {
        const onSettingsChange = vi.fn();
        const value = {
            queryName: 'Daily report',
            access: 'private' as const,
            ytOperationTitle: 'Report',
            tokenIds: [],
            attributes: [],
            custom: {},
        };
        render({settings: <QuerySettings value={value} onChange={onSettingsChange} />});
        const input = container.querySelector<HTMLInputElement>('input[aria-label="Query name"]');
        if (!input) throw new Error('Missing Query name input');
        expect(
            input.closest('[role="region"][aria-label="Settings"]')?.hasAttribute('hidden'),
        ).toBe(true);
        click(button('Settings'));
        act(() => {
            Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set?.call(
                input,
                'Edited',
            );
            input.dispatchEvent(new Event('input', {bubbles: true}));
        });
        expect(onSettingsChange).toHaveBeenCalledExactlyOnceWith({...value, queryName: 'Edited'});
        expect(props.onChange).not.toHaveBeenCalled();
        key('ArrowLeft');
        click(button('Close Settings'));
        click(button('Settings'));
        expect(container.querySelector('input[aria-label="Query name"]')).toBe(input);
        expect(separator().getAttribute('aria-valuenow')).toBe('336');
        expect(editor.mount).toHaveBeenCalledTimes(1);
    });
    it('composes built-in settings with engine fields before application fields and forwards changes', () => {
        const onSettingsChange = vi.fn();
        const onFieldBlur = vi.fn();
        const value: QuerySettingsValue = {
            queryName: 'Daily report',
            access: 'private',
            ytOperationTitle: 'Report',
            tokenIds: [],
            attributes: [],
            custom: {version: 'v1', extra: 'retained'},
        };
        const renderEngine = vi.fn<NonNullable<QueryEditorEngine['renderSettingsFields']>>(
            (context) => (
                <TextInput
                    controlProps={{'aria-label': 'Engine version'}}
                    value={String(context.value.custom.version)}
                    onUpdate={(version) =>
                        context.onChange({
                            ...context.value,
                            custom: {...context.value.custom, version},
                        })
                    }
                    onBlur={() => context.onFieldBlur?.({section: 'custom', field: 'version'})}
                    disabled={context.disabled}
                    errorMessage={context.errors?.custom?.version}
                    validationState={context.errors?.custom?.version ? 'invalid' : undefined}
                />
            ),
        );
        const renderSections = vi.fn<NonNullable<QueryEditorEngine['renderSettingsSections']>>(
            () => <div data-testid="engine-section">Engine section</div>,
        );
        const engines = [
            {
                ...props.engines[0],
                renderSettingsFields: renderEngine,
                renderSettingsSections: renderSections,
            },
        ];
        render({
            engines,
            defaultSettingsOpen: true,
            settingsProps: {
                value,
                onChange: onSettingsChange,
                onFieldBlur,
                errors: {custom: {version: 'Unsupported version'}},
                renderCustomFields: () => (
                    <TextInput controlProps={{'aria-label': 'Application field'}} />
                ),
                renderCustomSections: () => (
                    <div data-testid="application-section">Application section</div>
                ),
            },
        });
        expect(renderEngine).toHaveBeenCalledWith(
            expect.objectContaining({
                engineId: 'yql',
                clusterId: 'a',
                value,
                disabled: false,
                errors: {custom: {version: 'Unsupported version'}},
            }),
        );
        expect(renderSections).toHaveBeenCalledWith(
            expect.objectContaining({
                engineId: 'yql',
                clusterId: 'a',
                value,
                disabled: false,
            }),
        );
        const attributesSection = container.querySelectorAll('.qp-query-settings__section')[1];
        const engineSection = container.querySelector('[data-testid="engine-section"]');
        const applicationSection = container.querySelector('[data-testid="application-section"]');
        if (!engineSection || !applicationSection) throw new Error('Missing custom sections');
        expect(attributesSection.compareDocumentPosition(engineSection)).toBe(
            Node.DOCUMENT_POSITION_FOLLOWING,
        );
        expect(engineSection.compareDocumentPosition(applicationSection)).toBe(
            Node.DOCUMENT_POSITION_FOLLOWING,
        );
        expect(
            [...container.querySelectorAll('input')].map((input) =>
                input.getAttribute('aria-label'),
            ),
        ).toEqual(['Query name', 'Engine version', 'Application field', 'YT operation title']);
        const input = container.querySelector<HTMLInputElement>(
            'input[aria-label="Engine version"]',
        );
        if (!input) throw new Error('Missing engine field');
        expect(input.getAttribute('aria-invalid')).toBe('true');
        act(() => {
            Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set?.call(
                input,
                'v2',
            );
            input.dispatchEvent(new Event('input', {bubbles: true}));
        });
        expect(onSettingsChange).toHaveBeenCalledExactlyOnceWith({
            ...value,
            custom: {...value.custom, version: 'v2'},
        });
        expect(props.onChange).not.toHaveBeenCalled();
        act(() => input.focus());
        act(() => input.blur());
        expect(onFieldBlur).toHaveBeenLastCalledWith({section: 'custom', field: 'version'});
        click(button('Close Settings'));
        click(button('Settings'));
        expect(container.querySelector('input[aria-label="Engine version"]')).toBe(input);
    });
    it('leaves settings untouched on engine changes and handles absent engines without remounting the form', () => {
        const onSettingsChange = vi.fn();
        const value: QuerySettingsValue = {
            queryName: 'Report',
            access: 'everyone',
            ytOperationTitle: 'Operation',
            tokenIds: ['token'],
            attributes: [{id: 'a', key: 'pool', value: 'research'}],
            custom: {version: 'v1', clique: 'analytics'},
        };
        const settingsProps = {value, onChange: onSettingsChange};
        const engines = props.engines.map((engine) => ({
            ...engine,
            renderSettingsFields: () => (
                <TextInput controlProps={{'aria-label': `${engine.id} field`}} />
            ),
        }));
        render({engines, settingsProps, defaultSettingsOpen: true});
        const name = container.querySelector('input[aria-label="Query name"]');
        const selector = container.querySelector<HTMLSelectElement>('[aria-label="Engine"]');
        if (!selector) throw new Error('Missing engine selector');
        act(() => {
            selector.value = 'ch';
            selector.dispatchEvent(new Event('change', {bubbles: true}));
        });
        expect(props.onEngineChange).toHaveBeenCalledExactlyOnceWith('ch');
        expect(container.querySelector('input[aria-label="yql field"]')).not.toBeNull();
        render({engines, settingsProps, engineId: 'ch'});
        expect(container.querySelector('input[aria-label="ch field"]')).not.toBeNull();
        expect(container.querySelector('input[aria-label="yql field"]')).toBeNull();
        render({engines, settingsProps, engineId: 'unknown'});
        expect(container.querySelector('input[aria-label="ch field"]')).toBeNull();
        expect(container.querySelector('input[aria-label="Query name"]')).toBe(name);
        expect(editor.props.language).toBe('plaintext');
        expect(onSettingsChange).not.toHaveBeenCalled();
    });
    it('keeps settings disabled independent of text readOnly and skips engine rendering for raw slots', () => {
        const renderSettingsFields = vi.fn<NonNullable<QueryEditorEngine['renderSettingsFields']>>(
            () => null,
        );
        const engines = [{...props.engines[0], renderSettingsFields}];
        render({engines, settings: <div>Custom settings panel</div>});
        expect(container.textContent).toContain('Custom settings panel');
        expect(renderSettingsFields).not.toHaveBeenCalled();
        const settingsProps = {
            value: {
                queryName: '',
                access: 'private' as const,
                ytOperationTitle: '',
                tokenIds: [],
                attributes: [],
                custom: {},
            },
            onChange: vi.fn(),
            disabled: true,
        };
        render({engines, settingsProps});
        expect(renderSettingsFields).toHaveBeenLastCalledWith(
            expect.objectContaining({disabled: true}),
        );
        render({engines, settingsProps: {...settingsProps, disabled: false}, readOnly: true});
        expect(renderSettingsFields).toHaveBeenLastCalledWith(
            expect.objectContaining({disabled: false}),
        );
        expect(editor.props.readOnly).toBe(true);
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
