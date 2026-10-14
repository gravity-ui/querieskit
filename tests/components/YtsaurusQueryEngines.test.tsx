// @vitest-environment jsdom
import React, {act} from 'react';
import {type Root, createRoot} from 'react-dom/client';
import {type SelectProps, ThemeProvider, configure} from '@gravity-ui/uikit';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {createYtsaurusQueryEngines} from '../../src/widgets/QueryEditor/presets/ytsaurus';
import type {QueryEditorEngineSettingsContext} from '../../src/types/queryEditor';
import type {
    YtsaurusEngineSettings,
    YtsaurusQueryEngineId,
    YtsaurusQueryEnginesOptions,
} from '../../src/types/ytsaurusQueryEngines';
import type {MonacoEditorProps} from '../../src/types/monacoEditor';
import {setLang} from '../../src/i18n';

// Exercise the adapter contract without relying on popup positioning in jsdom.
const select = vi.hoisted(() => ({props: undefined as SelectProps | undefined}));
vi.mock('@gravity-ui/uikit', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@gravity-ui/uikit')>();
    return {
        ...actual,
        Select: (props: SelectProps) => {
            select.props = props;
            return <div aria-label={props['aria-label']}>{props.errorMessage}</div>;
        },
    };
});

const editor = vi.hoisted(() => ({props: undefined as MonacoEditorProps | undefined}));
vi.mock('../../src/components/MonacoEditor', () => ({
    MonacoEditor: (props: MonacoEditorProps) => {
        editor.props = props;
        return <div aria-label={props.monacoConfig?.ariaLabel}>{props.value}</div>;
    },
}));

type Custom = YtsaurusEngineSettings & {pool: string};

describe('createYtsaurusQueryEngines', () => {
    let root: Root;
    let container: HTMLDivElement;
    let context: QueryEditorEngineSettingsContext<Custom>;
    const onChange = vi.fn();
    const onFieldBlur = vi.fn();

    beforeEach(() => {
        globalThis.IS_REACT_ACT_ENVIRONMENT = true;
        configure({lang: 'en'});
        setLang('en');
        onChange.mockClear();
        onFieldBlur.mockClear();
        container = document.createElement('div');
        document.body.append(container);
        root = createRoot(container);
        context = {
            engineId: 'yql',
            clusterId: 'primary',
            disabled: false,
            value: {
                queryName: 'Query',
                access: 'private',
                ytOperationTitle: 'Operation',
                tokenIds: ['token'],
                attributes: [{id: 'first', key: 'a', value: 'b'}],
                custom: {
                    pool: 'research',
                    yqlVersion: 'v1',
                    clique: 'old',
                    discoveryGroup: '//old',
                },
            },
            onChange,
            onFieldBlur,
        };
    });

    afterEach(() => {
        act(() => root.unmount());
        container.remove();
        vi.restoreAllMocks();
    });

    function render(engineId: YtsaurusQueryEngineId, options: YtsaurusQueryEnginesOptions = {}) {
        const engine = createYtsaurusQueryEngines<Custom>(options).find(
            (item) => item.id === engineId,
        );
        select.props = undefined;
        act(() =>
            root.render(
                <ThemeProvider>
                    {engine?.renderSettingsFields?.({...context, engineId})}
                </ThemeProvider>,
            ),
        );
        return select.props;
    }

    function selector() {
        if (!select.props) throw new Error('Expected an engine settings selector');
        return select.props;
    }

    function optionValues() {
        return selector().options?.flatMap((option) => ('value' in option ? [option.value] : []));
    }

    it('provides registered languages and respects explicit engine order including an empty list', () => {
        expect(createYtsaurusQueryEngines().map(({id, language}) => ({id, language}))).toEqual([
            {id: 'yql', language: 'yql'},
            {id: 'chyt', language: 'clickhouse'},
            {id: 'spyt', language: 's-expression'},
            {id: 'ql', language: 'yql_ansi'},
        ]);
        expect(createYtsaurusQueryEngines({engines: ['ql', 'chyt']}).map(({id}) => id)).toEqual([
            'ql',
            'chyt',
        ]);
        expect(createYtsaurusQueryEngines({engines: []})).toEqual([]);
    });

    it('hides YQL without versions and renders no engine field for QL or SPYT Connect', () => {
        expect(render('yql')).toBeUndefined();
        expect(render('yql', {yql: {versions: []}})).toBeUndefined();
        expect(render('ql')).toBeUndefined();
        expect(render('spyt', {spyt: {connectAvailable: true}})).toBeUndefined();
        expect(onChange).not.toHaveBeenCalled();
    });

    it('keeps YQL controlled, preserves unrelated values and leaves defaults to the parent', () => {
        const original = structuredClone(context.value);
        render('yql', {yql: {versions: ['v1', 'v2']}});
        expect(optionValues()).toEqual(['v1', 'v2']);
        expect(selector().value).toEqual(['v1']);
        act(() => selector().onUpdate?.(['v2']));
        expect(onChange).toHaveBeenCalledExactlyOnceWith({
            ...context.value,
            custom: {...context.value.custom, yqlVersion: 'v2'},
        });
        expect(context.value).toEqual(original);
        context.value = {...context.value, custom: {pool: 'research'}};
        render('yql', {yql: {versions: ['v1', 'v2']}});
        expect(selector().value ?? []).toEqual([]);
        expect(onChange).toHaveBeenCalledTimes(1);
    });

    it('sorts healthy active CHYT cliques first without changing the supplied list', () => {
        const cliques = [
            {alias: 'stopped', state: 'stopped', health: 'good'},
            {alias: 'unhealthy', state: 'active', health: 'bad'},
            {alias: 'healthy', state: 'active', health: 'good', operationId: 'operation'},
            {alias: 'disabled', state: 'active', health: 'good', disabled: true},
        ];
        const original = structuredClone(cliques);
        render('chyt', {chyt: {cliques}});
        expect(optionValues()).toEqual(['healthy', 'disabled', 'stopped', 'unhealthy']);
        expect(cliques).toEqual(original);
        expect(selector().options?.[0]).toMatchObject({
            content: expect.stringContaining('Active'),
        });
        expect(selector().options?.[0]).toMatchObject({
            content: expect.stringContaining('operation'),
        });
        expect(
            selector().options?.find((option) => 'value' in option && option.value === 'disabled'),
        ).toMatchObject({disabled: true});
        act(() => selector().onUpdate?.(['healthy']));
        expect(onChange).toHaveBeenCalledExactlyOnceWith({
            ...context.value,
            custom: {...context.value.custom, clique: 'healthy'},
        });
    });

    it('hides stale CHYT aliases only after loading finishes and never resets parent data', () => {
        render('chyt');
        expect(selector().value).toEqual(['old']);
        render('chyt', {chyt: {cliques: [], loading: true}});
        expect(selector().loading).toBe(true);
        expect(selector().disabled).toBe(true);
        expect(selector().value).toEqual(['old']);
        render('chyt', {chyt: {cliques: [{alias: 'old'}], loading: true}});
        expect(selector().value).toEqual(['old']);
        expect(selector().disabled).toBe(false);
        render('chyt', {chyt: {cliques: [], loading: false}});
        expect(selector().value ?? []).toEqual([]);
        expect(context.value.custom.clique).toBe('old');
        expect(onChange).not.toHaveBeenCalled();
    });

    it('renders legacy SPYT discovery options and clears only the selected engine field', () => {
        render('spyt', {
            spyt: {
                discoveryGroups: [
                    {path: '//one', title: 'First'},
                    {path: '//two', disabled: true},
                ],
            },
        });
        expect(optionValues()).toEqual(['//one', '//two']);
        act(() => selector().onUpdate?.(['//one']));
        expect(onChange).toHaveBeenLastCalledWith({
            ...context.value,
            custom: {...context.value.custom, discoveryGroup: '//one'},
        });
        act(() => selector().onUpdate?.([]));
        expect(onChange).toHaveBeenLastCalledWith({
            ...context.value,
            custom: {...context.value.custom, discoveryGroup: undefined},
        });
    });

    it.each([
        ['yql', 'yqlVersion'],
        ['chyt', 'clique'],
        ['spyt', 'discoveryGroup'],
    ] as const)(
        'passes external errors, disabled state and typed blur for %s',
        (engineId, field) => {
            context.disabled = true;
            context.errors = {custom: {[field]: 'Invalid selection'}};
            render(engineId, {yql: {versions: ['v1']}});
            expect(selector().disabled).toBe(true);
            expect(selector().validationState).toBe('invalid');
            expect(container.textContent).toContain('Invalid selection');
            act(() => selector().onBlur?.({} as React.FocusEvent));
            expect(onFieldBlur).toHaveBeenCalledExactlyOnceWith({section: 'custom', field});
            expect(onChange).not.toHaveBeenCalled();
        },
    );
    it.each([undefined, false, true])(
        'shows mutually exclusive SPYT controls when connectAvailable is %s',
        (connectAvailable) => {
            const engine = createYtsaurusQueryEngines<Custom>({spyt: {connectAvailable}}).find(
                ({id}) => id === 'spyt',
            )!;
            const engineContext = {...context, engineId: 'spyt'};
            const fields = engine.renderSettingsFields?.(engineContext);
            const sections = engine.renderSettingsSections?.(engineContext);
            expect(Boolean(fields)).toBe(!connectAvailable);
            expect(Boolean(sections)).toBe(Boolean(connectAvailable));
            expect(onChange).not.toHaveBeenCalled();
        },
    );

    function renderSpyt() {
        const engine = createYtsaurusQueryEngines<Custom>({spyt: {connectAvailable: true}}).find(
            ({id}) => id === 'spyt',
        );
        act(() =>
            root.render(
                <ThemeProvider>
                    {engine?.renderSettingsSections?.({...context, engineId: 'spyt'})}
                </ThemeProvider>,
            ),
        );
    }

    function clickAction(label: string) {
        const button = [...container.querySelectorAll('button')].find((item) =>
            item.textContent?.endsWith(label),
        );
        if (!button) throw new Error(`Missing ${label} button`);
        act(() => button.click());
    }

    it('keeps SPYT edits local until Save and Cancel restores the controlled config', () => {
        renderSpyt();
        expect(editor.props?.value).toBe('{}');
        expect(editor.props?.language).toBe('json');
        expect(onChange).not.toHaveBeenCalled();
        act(() => editor.props?.onChange?.('{"spark.executor.cores": 2}'));
        expect(onChange).not.toHaveBeenCalled();
        clickAction('Save');
        expect(onChange).toHaveBeenCalledExactlyOnceWith({
            ...context.value,
            custom: {...context.value.custom, spytConfig: '{"spark.executor.cores": 2}'},
        });
        context.value = onChange.mock.calls[0][0];
        renderSpyt();
        act(() => editor.props?.onChange?.('{"draft": true}'));
        clickAction('Cancel');
        expect(editor.props?.value).toBe('{"spark.executor.cores": 2}');
        expect(onChange).toHaveBeenCalledTimes(1);
    });

    it.each(['{broken', '[]', 'null', '42', '"text"'])(
        'rejects invalid SPYT object config %s',
        (draft) => {
            renderSpyt();
            act(() => editor.props?.onChange?.(draft));
            clickAction('Save');
            expect(container.querySelector('[role="alert"]')?.textContent).toBe(
                'Enter a valid JSON object',
            );
            expect(onChange).not.toHaveBeenCalled();
            clickAction('Cancel');
            expect(container.querySelector('[role="alert"]')).toBeNull();
        },
    );

    it('resets the SPYT draft on external config and cluster changes', () => {
        renderSpyt();
        act(() => editor.props?.onChange?.('{"draft": true}'));
        context.value = {
            ...context.value,
            custom: {...context.value.custom, spytConfig: '{"external": true}'},
        };
        renderSpyt();
        expect(editor.props?.value).toBe('{"external": true}');
        act(() => editor.props?.onChange?.('{"draft": true}'));
        context.clusterId = 'secondary';
        renderSpyt();
        expect(editor.props?.value).toBe('{"external": true}');
        expect(onChange).not.toHaveBeenCalled();
    });

    it('passes SPYT errors, read-only state and typed blur without changing disabled settings', () => {
        context.disabled = true;
        context.errors = {custom: {spytConfig: 'Config rejected'}};
        renderSpyt();
        expect(editor.props?.readOnly).toBe(true);
        expect(container.querySelector('[role="alert"]')?.textContent).toBe('Config rejected');
        act(() => editor.props?.onChange?.('{"attempt": true}'));
        expect(editor.props?.value).toBe('{}');
        clickAction('Save');
        expect(onChange).not.toHaveBeenCalled();
        act(() => editor.props?.onBlur?.());
        expect(onFieldBlur).toHaveBeenCalledExactlyOnceWith({
            section: 'custom',
            field: 'spytConfig',
        });
    });
});
