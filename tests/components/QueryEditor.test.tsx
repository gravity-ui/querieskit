// @vitest-environment jsdom
import React, {act, useEffect} from 'react';
import {type Root, createRoot} from 'react-dom/client';
import {TextInput, ThemeProvider, configure} from '@gravity-ui/uikit';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {QueryEditor} from '../../src/widgets/QueryEditor';
import {QuerySettings} from '../../src/modules/QuerySettings';
import type {QueryEditorEngine, QueryEditorProps} from '../../src/types/queryEditor';
import type {AttachmentsProps} from '../../src/types/attachments';
import type {QuerySettingsValue} from '../../src/types/querySettings';
import {setLang} from '../../src/i18n';

// Popup positioning requires browser layout. Keep the actual buttons and layout,
// and replace popup surfaces to exercise our wiring.
const sharePopup = vi.hoisted(() => ({props: {} as import('@gravity-ui/uikit').PopupProps}));
vi.mock('@gravity-ui/uikit', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@gravity-ui/uikit')>();
    return {
        ...actual,
        Popup: (props: import('@gravity-ui/uikit').PopupProps) => {
            sharePopup.props = props;
            return props.open ? <div>{props.children}</div> : null;
        },
        Select: Object.assign(
            (props: import('@gravity-ui/uikit').SelectProps) => (
                <label>
                    {props.label}
                    <select
                        aria-label={props['aria-label']}
                        value={props.value?.[0] ?? ''}
                        disabled={props.disabled}
                        onChange={(event) => props.onUpdate?.([event.target.value])}
                    >
                        <option value="" />
                        {React.Children.toArray(props.children).map((child) => {
                            if (
                                !React.isValidElement<{value: string; content: React.ReactNode}>(
                                    child,
                                )
                            )
                                return null;
                            return (
                                <option key={child.props.value} value={child.props.value}>
                                    {child.props.content}
                                </option>
                            );
                        })}
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
            {Option: actual.Select.Option},
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
            'matchMedia',
            vi.fn(() => ({
                matches: false,
                addEventListener: vi.fn(),
                removeEventListener: vi.fn(),
                addListener: vi.fn(),
                removeListener: vi.fn(),
            })),
        );
        vi.stubGlobal(
            'requestAnimationFrame',
            vi.fn(() => 1),
        );
        vi.stubGlobal('cancelAnimationFrame', vi.fn());
        vi.stubGlobal(
            'ResizeObserver',
            class {
                public observe() {}
                public disconnect() {}
                public unobserve() {}
            },
        );
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
        expect(button('Parameters')).toBeTruthy();
        expect(button('Attachments')).toBeTruthy();
        expect(container.querySelector('[aria-label="More actions"]')).toBeNull();
        expect(container.querySelector('[aria-label="Save"]')).toBeNull();
        expect(container.textContent).not.toContain('Code Assistant');
    });
    it('hides requested actions and disables missing callbacks even with explicit enabled state', () => {
        render({
            hiddenActions: ['run', 'validate'],
            onFormat: undefined,
            actionStates: {format: {disabled: false}},
        });
        expect(container.querySelector('button[aria-label="Run"]')).toBeNull();
        expect(container.querySelector('button[aria-label="Validate"]')).toBeNull();
        expect(button('Format').disabled).toBe(true);
        render({
            onFormat: undefined,
            onValidate: undefined,
            actionStates: {format: {disabled: false}, validate: {disabled: false}},
        });
        expect(button('Format').disabled).toBe(true);
        expect(button('Validate').disabled).toBe(true);
        expect(button('Run').disabled).toBe(false);
        render();
        click(button('Format'));
        expect(props.onFormat).toHaveBeenCalledOnce();
        expect(editor.mount).toHaveBeenCalledOnce();
    });
    it.each(['settings', 'attachments', 'parameters'] as const)(
        'unmounts hidden %s without changing controlled selection or form data',
        (panelName) => {
            const mount = vi.fn();
            const unmount = vi.fn();
            const onPanelChange = vi.fn();
            function Content() {
                useEffect(() => {
                    mount();
                    return unmount;
                }, []);
                return <span data-testid="custom-panel">Custom form</span>;
            }
            const overrides = {
                activePanel: panelName,
                onActivePanelChange: onPanelChange,
                [panelName]: <Content />,
            };
            render({...overrides, hiddenPanels: [panelName]});
            expect(mount).not.toHaveBeenCalled();
            expect(separator()).toBeNull();
            expect(container.querySelector('[data-testid="custom-panel"]')).toBeNull();
            expect(
                container.querySelector(
                    `button[aria-label="${panelName[0].toUpperCase()}${panelName.slice(1)}"]`,
                ),
            ).toBeNull();
            render(overrides);
            expect(mount).toHaveBeenCalledOnce();
            expect(separator()).not.toBeNull();
            render({...overrides, activePanel: null});
            expect(unmount).not.toHaveBeenCalled();
            render({...overrides, hiddenPanels: [panelName]});
            expect(unmount).toHaveBeenCalledOnce();
            expect(separator()).toBeNull();
            render(overrides);
            expect(mount).toHaveBeenCalledTimes(2);
            expect(separator()).not.toBeNull();
            expect(onPanelChange).not.toHaveBeenCalled();
            expect(props.onChange).not.toHaveBeenCalled();
            expect(editor.mount).toHaveBeenCalledOnce();
        },
    );
    it.each(['settings', 'attachments', 'parameters'] as const)(
        'resets hidden uncontrolled %s silently and leaves it closed when restored',
        (panelName) => {
            const onActivePanelChange = vi.fn();
            const overrides = {defaultActivePanel: panelName, onActivePanelChange};
            render(overrides);
            expect(separator()).not.toBeNull();
            render({...overrides, hiddenPanels: [panelName]});
            expect(separator()).toBeNull();
            render(overrides);
            expect(separator()).toBeNull();
            expect(onActivePanelChange).not.toHaveBeenCalled();
            click(button(panelName[0].toUpperCase() + panelName.slice(1)));
            expect(separator()).not.toBeNull();
            expect(onActivePanelChange).toHaveBeenCalledExactlyOnceWith(panelName);
            expect(editor.mount).toHaveBeenCalledOnce();
        },
    );
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
        for (const [propName, value] of Object.entries(integrations))
            expect(editor.props[propName]).toBe(value);
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
        render({onActivePanelChange: onOpen});
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
        expect(onOpen.mock.calls).toEqual([['settings'], [null], ['settings']]);
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
        expect(onSettingsChange).toHaveBeenCalledExactlyOnceWith({...value, queryName: 'Edited'}, {changes: [{section: 'fields', field: 'queryName'}]});
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
            defaultActivePanel: 'settings',
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
        render({engines, settingsProps, defaultActivePanel: 'settings'});
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
            activePanel: 'settings',
            panelWidth: 300,
            onActivePanelChange: onOpen,
            onPanelWidthChange: onWidth,
        });
        click(button('Settings'));
        expect(onOpen).toHaveBeenCalledExactlyOnceWith(null);
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
            defaultActivePanel: 'settings',
            defaultPanelWidth: 400,
            onPanelWidthChange: onWidth,
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
        render({defaultActivePanel: 'settings'});
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
    function panel(name: 'Settings' | 'Attachments' | 'Parameters') {
        const element = container.querySelector<HTMLElement>(
            `[role="region"][aria-label="${name}"]`,
        );
        if (!element) throw new Error(`Missing ${name} panel`);
        return element;
    }
    function textButton(label: string, scope: ParentNode = container) {
        const element = [...scope.querySelectorAll<HTMLButtonElement>('button')].find((candidate) =>
            candidate.textContent?.trim().endsWith(label),
        );
        if (!element) throw new Error(`Missing button ${label}`);
        return element;
    }
    function updateInput(input: HTMLInputElement, value: string) {
        act(() => {
            Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set?.call(
                input,
                value,
            );
            input.dispatchEvent(new Event('input', {bubbles: true}));
        });
    }
    function tab(label: string) {
        const element = [
            ...panel('Attachments').querySelectorAll<HTMLElement>('[role="tab"]'),
        ].find((candidate) => candidate.textContent?.startsWith(label));
        if (!element) throw new Error(`Missing tab ${label}`);
        return element;
    }
    it('switches one shared panel, retains width and connects both permanent buttons to their regions', () => {
        const onActivePanelChange = vi.fn();
        render({onActivePanelChange});
        expect(panel('Settings').hidden).toBe(true);
        expect(panel('Attachments').hidden).toBe(true);
        const buttons = [...container.querySelectorAll('button')];
        expect(buttons.indexOf(button('Attachments'))).toBeLessThan(
            buttons.indexOf(button('Settings')),
        );
        for (const name of ['Settings', 'Attachments'] as const) {
            expect(button(name).getAttribute('aria-controls')).toBe(panel(name).id);
        }
        click(button('Attachments'));
        expect(panel('Attachments').hidden).toBe(false);
        expect(panel('Settings').hidden).toBe(true);
        key('ArrowLeft');
        click(button('Settings'));
        expect(panel('Settings').hidden).toBe(false);
        expect(panel('Attachments').hidden).toBe(true);
        expect(button('Attachments').getAttribute('aria-expanded')).toBe('false');
        expect(separator().getAttribute('aria-valuenow')).toBe('336');
        click(button('Settings'));
        expect(separator()).toBeNull();
        click(button('Attachments'));
        expect(separator().getAttribute('aria-valuenow')).toBe('336');
        click(button('Close Attachments'));
        expect(panel('Attachments').hidden).toBe(true);
        expect(onActivePanelChange.mock.calls).toEqual([
            ['attachments'],
            ['settings'],
            [null],
            ['attachments'],
            [null],
        ]);
        expect(editor.mount).toHaveBeenCalledTimes(1);
    });
    it('only requests controlled panel changes and does not emit events for props updates', () => {
        const onActivePanelChange = vi.fn();
        render({activePanel: 'settings', onActivePanelChange});
        click(button('Attachments'));
        expect(onActivePanelChange).toHaveBeenLastCalledWith('attachments');
        expect(panel('Settings').hidden).toBe(false);
        expect(panel('Attachments').hidden).toBe(true);
        render({activePanel: 'attachments', onActivePanelChange});
        expect(onActivePanelChange).toHaveBeenCalledTimes(1);
        expect(panel('Attachments').hidden).toBe(false);
        click(button('Attachments'));
        expect(onActivePanelChange).toHaveBeenLastCalledWith(null);
        expect(panel('Attachments').hidden).toBe(false);
        render({activePanel: null, onActivePanelChange});
        expect(onActivePanelChange).toHaveBeenCalledTimes(2);
        expect(separator()).toBeNull();
    });
    it('preserves raw attachments and settings nodes when switching and closing panels', () => {
        render({
            attachments: <input data-testid="raw-attachments" defaultValue="attachment draft" />,
            settings: <input data-testid="raw-settings" defaultValue="settings draft" />,
            defaultActivePanel: 'attachments',
        });
        const attachments = container.querySelector<HTMLInputElement>(
            '[data-testid="raw-attachments"]',
        )!;
        const settings = container.querySelector<HTMLInputElement>('[data-testid="raw-settings"]')!;
        updateInput(attachments, 'unsaved attachment');
        click(button('Settings'));
        updateInput(settings, 'unsaved setting');
        click(button('Close Settings'));
        click(button('Attachments'));
        expect(container.querySelector('[data-testid="raw-attachments"]')).toBe(attachments);
        expect(container.querySelector('[data-testid="raw-settings"]')).toBe(settings);
        expect(attachments.value).toBe('unsaved attachment');
        expect(settings.value).toBe('unsaved setting');
        expect(panel('Attachments').querySelector('.qp-attachments')).toBeNull();
        expect(editor.mount).toHaveBeenCalledTimes(1);
    });
    it('connects Parameters to the shared panel and preserves its local draft and saved values', async () => {
        render();
        expect(panel('Parameters').hidden).toBe(true);
        expect(button('Parameters').getAttribute('aria-controls')).toBe(panel('Parameters').id);
        click(button('Parameters'));
        expect(button('Parameters').getAttribute('aria-expanded')).toBe('true');
        expect(separator().getAttribute('aria-controls')).toBe(panel('Parameters').id);
        expect(panel('Parameters').textContent).toContain('No parameters');
        expect(panel('Parameters').querySelector('.qp-query-parameters__header')).toBeNull();
        click(textButton('Add parameter', panel('Parameters')));
        const name = document.querySelector<HTMLInputElement>(
            'input[aria-label="Parameter name 1"]',
        )!;
        updateInput(name, 'limit');
        click(textButton('Apply', document));
        const valueInput = panel('Parameters').querySelector<HTMLInputElement>(
            'input[aria-label="$limit"]',
        )!;
        updateInput(valueInput, 'unsaved value');
        key('ArrowLeft');
        click(button('Settings'));
        expect(panel('Parameters').hidden).toBe(true);
        click(button('Parameters'));
        expect(separator().getAttribute('aria-valuenow')).toBe('336');
        click(button('Close Parameters'));
        click(button('Parameters'));
        expect(panel('Parameters').querySelector('input[aria-label="$limit"]')).toBe(valueInput);
        expect(valueInput.value).toBe('unsaved value');
        await act(async () => textButton('Save', panel('Parameters')).click());
        click(button('Attachments'));
        click(button('Parameters'));
        expect(panel('Parameters').textContent).toContain('limit');
        expect(textButton('Edit', panel('Parameters'))).toBeTruthy();
        expect(props.onChange).not.toHaveBeenCalled();
        expect(editor.mount).toHaveBeenCalledTimes(1);
    });
    it('requests controlled Parameters visibility without changing the supplied active panel', () => {
        const onActivePanelChange = vi.fn();
        render({activePanel: 'settings', onActivePanelChange});
        click(button('Parameters'));
        expect(onActivePanelChange).toHaveBeenLastCalledWith('parameters');
        expect(panel('Parameters').hidden).toBe(true);
        render({activePanel: 'parameters', onActivePanelChange});
        expect(onActivePanelChange).toHaveBeenCalledTimes(1);
        expect(panel('Parameters').hidden).toBe(false);
        expect(panel('Settings').hidden).toBe(true);
        click(button('Close Parameters'));
        expect(onActivePanelChange).toHaveBeenLastCalledWith(null);
        expect(panel('Parameters').hidden).toBe(false);
    });
    it('forwards parameter saves and refreshes independently of readOnly query text', async () => {
        const onChange = vi.fn();
        const onUpdate = vi.fn();
        render({
            defaultActivePanel: 'parameters',
            readOnly: true,
            parametersProps: {
                value: [{id: 'limit', name: 'limit', type: {kind: 'String'}, value: '10'}],
                onChange,
                onUpdate,
            },
        });
        await act(async () => textButton('Update', panel('Parameters')).click());
        expect(onUpdate).toHaveBeenCalledTimes(1);
        click(textButton('Edit', panel('Parameters')));
        updateInput(
            panel('Parameters').querySelector<HTMLInputElement>('input[aria-label="$limit"]')!,
            '20',
        );
        await act(async () => textButton('Save', panel('Parameters')).click());
        expect(onChange).toHaveBeenCalledWith([
            {id: 'limit', name: 'limit', type: {kind: 'String'}, value: '20'},
        ]);
        expect(props.onChange).not.toHaveBeenCalled();
    });
    it('preserves a custom parameters slot across switching and closing', () => {
        render({
            parameters: <input data-testid="raw-parameters" defaultValue="draft" />,
            defaultActivePanel: 'parameters',
        });
        const input = panel('Parameters').querySelector<HTMLInputElement>('input')!;
        updateInput(input, 'unsaved');
        click(button('Settings'));
        click(button('Parameters'));
        click(button('Close Parameters'));
        click(button('Parameters'));
        expect(panel('Parameters').querySelector('input')).toBe(input);
        expect(input.value).toBe('unsaved');
        expect(panel('Parameters').querySelector('.qp-query-parameters')).toBeNull();
    });
    it('provides default empty attachments and preserves an unfinished file draft and selected tab', () => {
        render({defaultActivePanel: 'attachments'});
        expect(panel('Attachments').textContent).toContain('No attachments');
        click(textButton('Add file', panel('Attachments')));
        const input = panel('Attachments').querySelector<HTMLInputElement>('input')!;
        updateInput(input, 'draft.csv');
        click(button('Settings'));
        click(button('Attachments'));
        expect(panel('Attachments').querySelector('input')).toBe(input);
        expect(input.value).toBe('draft.csv');
        act(() => input.dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter', bubbles: true})));
        expect(panel('Attachments').textContent).toContain('draft.csv');
        click(tab('Deleted'));
        click(button('Settings'));
        click(button('Attachments'));
        expect(tab('Deleted').getAttribute('aria-selected')).toBe('true');
        expect(props.onChange).not.toHaveBeenCalled();
    });
    it('forwards token options into link editing and emits the selected token with the saved link', () => {
        const onChange = vi.fn();
        render({
            defaultActivePanel: 'attachments',
            attachmentsProps: {
                tokens: [{value: 'service', title: 'Service token'}],
                onChange,
            },
        });
        click(textButton('Add Link', panel('Attachments')));
        const token = panel('Attachments').querySelector<HTMLSelectElement>('select')!;
        expect(token.textContent).toContain('Service token');
        act(() => {
            token.value = 'service';
            token.dispatchEvent(new Event('change', {bubbles: true}));
        });
        const link = panel('Attachments').querySelector<HTMLTextAreaElement>('textarea')!;
        act(() => {
            Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')?.set?.call(
                link,
                'https://example.com/data',
            );
            link.dispatchEvent(new Event('input', {bubbles: true}));
        });
        updateInput(panel('Attachments').querySelector<HTMLInputElement>('input')!, 'data');
        click(textButton('Save', panel('Attachments')));
        expect(onChange).toHaveBeenLastCalledWith({
            attachments: [
                {
                    id: expect.any(String),
                    name: 'data',
                    link: 'https://example.com/data',
                    token: 'service',
                },
            ],
            deletedAttachments: [],
        });
    });
    it('forwards controlled attachment changes for add, edit, delete and restore without changing query text', () => {
        const onItemClick = vi.fn();
        const original = {id: 'original', name: 'original.csv'};
        let attachmentsProps: NonNullable<QueryEditorProps['attachmentsProps']> = {
            attachments: [original],
            deletedAttachments: [],
            attachmentListProps: {className: 'consumer-attachment-list'},
            onItemClick,
        };
        const onChange = vi.fn<NonNullable<AttachmentsProps['onChange']>>((next) => {
            attachmentsProps = {...attachmentsProps, ...next, onChange};
            render({defaultActivePanel: 'attachments', attachmentsProps});
        });
        attachmentsProps.onChange = onChange;
        render({defaultActivePanel: 'attachments', attachmentsProps});
        expect(onChange).not.toHaveBeenCalled();
        expect(panel('Attachments').querySelector('.consumer-attachment-list')).not.toBeNull();
        const row = () => panel('Attachments').querySelector<HTMLElement>('.qp-attachment-item')!;
        const hoverRow = () => {
            act(() => row().dispatchEvent(new MouseEvent('mouseover', {bubbles: true})));
            return row();
        };
        click(row());
        expect(onItemClick).toHaveBeenCalledWith(original, 0, false, expect.anything());
        click(hoverRow().querySelectorAll('button')[0]);
        let input = panel('Attachments').querySelector<HTMLInputElement>('input')!;
        updateInput(input, 'renamed.csv');
        act(() => input.dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter', bubbles: true})));
        const renamed = {...original, name: 'renamed.csv'};
        expect(onChange).toHaveBeenLastCalledWith({attachments: [renamed], deletedAttachments: []});
        expect(original.name).toBe('original.csv');
        click(hoverRow().querySelectorAll('button')[1]);
        expect(onChange).toHaveBeenLastCalledWith({attachments: [], deletedAttachments: [renamed]});
        click(tab('Deleted'));
        click(hoverRow().querySelector('button')!);
        expect(onChange).toHaveBeenLastCalledWith({attachments: [renamed], deletedAttachments: []});
        click(tab('Current'));
        click(textButton('File', panel('Attachments')));
        expect(onChange).toHaveBeenLastCalledWith({
            attachments: [renamed, {id: expect.any(String), name: '', isNew: true}],
            deletedAttachments: [],
        });
        const draft = attachmentsProps.attachments![1];
        input = panel('Attachments').querySelector<HTMLInputElement>('input')!;
        updateInput(input, 'new.csv');
        act(() => input.dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter', bubbles: true})));
        expect(onChange).toHaveBeenLastCalledWith({
            attachments: [renamed, {id: draft.id, name: 'new.csv'}],
            deletedAttachments: [],
        });
        expect(props.onChange).not.toHaveBeenCalled();
        expect(editor.mount).toHaveBeenCalledTimes(1);
    });
    it('places saving after sharing and before custom right actions', () => {
        render({
            saveProps: {onSave: vi.fn(), onSaveAs: vi.fn()},
            shareProps: {
                onGenerate: vi.fn(),
                onRegenerate: vi.fn(),
                onMakePermanent: vi.fn(),
                onExpirationChange: vi.fn(),
            },
            rightActions: [{id: 'custom', title: 'Custom', icon: () => <svg />, onClick: vi.fn()}],
        });
        const buttons = [...container.querySelectorAll('button')];
        expect(buttons.indexOf(button('Share'))).toBeLessThan(buttons.indexOf(button('Save')));
        expect(buttons.indexOf(button('Save'))).toBeLessThan(buttons.indexOf(button('Custom')));
        expect(container.querySelector('[role="menuitem"]')).toBeNull();
    });
    it.each([
        ['Save', 'onSave', 'onSaveAs'],
        ['Save as', 'onSaveAs', 'onSave'],
    ] as const)(
        'delegates %s without changing editor text or the active panel',
        (label, action, otherAction) => {
            const saveProps = {onSave: vi.fn(), onSaveAs: vi.fn()};
            const onActivePanelChange = vi.fn();
            render({saveProps, defaultActivePanel: 'settings', onActivePanelChange});
            const editorNode = container.querySelector('[data-testid="editor"]');
            click(button('Save'));
            const items = [...container.querySelectorAll<HTMLButtonElement>('[role="menuitem"]')];
            expect(items.map((item) => item.textContent)).toEqual(['Save', 'Save as']);
            expect(saveProps.onSave).not.toHaveBeenCalled();
            expect(saveProps.onSaveAs).not.toHaveBeenCalled();
            click(items.find((item) => item.textContent === label)!);
            expect(saveProps[action]).toHaveBeenCalledTimes(1);
            expect(saveProps[otherAction]).not.toHaveBeenCalled();
            expect(panel('Settings').hidden).toBe(false);
            expect(editor.props.value).toBe('select 1');
            expect(container.querySelector('[data-testid="editor"]')).toBe(editorNode);
            expect(editor.mount).toHaveBeenCalledTimes(1);
            expect(props.onChange).not.toHaveBeenCalled();
            expect(onActivePanelChange).not.toHaveBeenCalled();
        },
    );
    it.each(['disabled', 'loading'] as const)('blocks the save menu while %s', (state) => {
        const saveProps = {onSave: vi.fn(), onSaveAs: vi.fn(), [state]: true};
        render({saveProps});
        click(button('Save'));
        expect(container.querySelector('[role="menuitem"]')).toBeNull();
        expect(saveProps.onSave).not.toHaveBeenCalled();
        expect(saveProps.onSaveAs).not.toHaveBeenCalled();
    });
    it('only renders sharing when configured and places it before custom right actions', () => {
        render();
        expect(container.querySelector('[aria-label="Share"]')).toBeNull();
        const shareProps = {
            onGenerate: vi.fn(),
            onRegenerate: vi.fn(),
            onMakePermanent: vi.fn(),
            onExpirationChange: vi.fn(),
        };
        render({
            shareProps,
            rightActions: [{id: 'custom', title: 'Custom', icon: () => <svg />, onClick: vi.fn()}],
        });
        const buttons = [...container.querySelectorAll('button')];
        expect(buttons.indexOf(button('Share'))).toBeLessThan(buttons.indexOf(button('Custom')));
        expect(container.querySelectorAll('[aria-label="Share"]')).toHaveLength(1);
        click(button('Share'));
        const dialog = document.querySelector('[role="dialog"]');
        if (!dialog) throw new Error('Missing sharing dialog');
        expect(dialog.textContent).toContain('Public link');
        click(textButton('Generate link', dialog));
        expect(shareProps.onGenerate).toHaveBeenCalledTimes(1);
    });
    it('keeps editor text and the active panel intact while sharing in readOnly mode', () => {
        const onActivePanelChange = vi.fn();
        const shareProps = {
            onGenerate: vi.fn(),
            onRegenerate: vi.fn(),
            onMakePermanent: vi.fn(),
            onExpirationChange: vi.fn(),
        };
        render({shareProps, readOnly: true, defaultActivePanel: 'settings', onActivePanelChange});
        const editorNode = container.querySelector('[data-testid="editor"]');
        expect(button('Share').disabled).toBe(false);
        click(button('Share'));
        expect(panel('Settings').hidden).toBe(false);
        act(() => sharePopup.props.onOpenChange?.(false));
        expect(button('Share').getAttribute('aria-expanded')).toBe('false');
        expect(panel('Settings').hidden).toBe(false);
        expect(editor.props.value).toBe('select 1');
        expect(container.querySelector('[data-testid="editor"]')).toBe(editorNode);
        expect(editor.mount).toHaveBeenCalledTimes(1);
        expect(props.onChange).not.toHaveBeenCalled();
        expect(onActivePanelChange).not.toHaveBeenCalled();
    });
    it('anchors sharing to its button, toggles it and handles popup dismissal', () => {
        const shareProps = {
            onGenerate: vi.fn(),
            onRegenerate: vi.fn(),
            onMakePermanent: vi.fn(),
            onExpirationChange: vi.fn(),
        };
        render({shareProps});
        const shareButton = button('Share');
        expect(shareButton.getAttribute('aria-expanded')).toBe('false');
        click(shareButton);
        expect(shareButton.getAttribute('aria-expanded')).toBe('true');
        const popup = document.querySelector('[role="dialog"]');
        expect(popup?.textContent).toContain('Public link');
        expect(sharePopup.props.anchorElement).toBe(shareButton);
        expect(sharePopup.props.placement).toBe('bottom-end');
        expect(popup?.querySelector('[aria-label="Close dialog"]')).toBeNull();
        click(shareButton);
        expect(shareButton.getAttribute('aria-expanded')).toBe('false');
        click(shareButton);
        expect(shareButton.getAttribute('aria-expanded')).toBe('true');
        act(() => sharePopup.props.onOpenChange?.(false));
        expect(document.querySelector('[role="dialog"]')).toBeNull();
        expect(shareButton.getAttribute('aria-expanded')).toBe('false');
        expect(shareProps.onGenerate).not.toHaveBeenCalled();
        expect(props.onChange).not.toHaveBeenCalled();
    });
    it('closes sharing when shareProps are removed and does not reopen when restored', () => {
        const shareProps = {
            onGenerate: vi.fn(),
            onRegenerate: vi.fn(),
            onMakePermanent: vi.fn(),
            onExpirationChange: vi.fn(),
        };
        render({shareProps});
        click(button('Share'));
        expect(document.querySelector('[role="dialog"]')).not.toBeNull();
        render();
        expect(document.querySelector('[role="dialog"]')).toBeNull();
        expect(container.querySelector('[aria-label="Share"]')).toBeNull();
        render({shareProps});
        expect(document.querySelector('[role="dialog"]')).toBeNull();
        click(button('Share'));
        expect(document.querySelector('[role="dialog"]')).not.toBeNull();
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
