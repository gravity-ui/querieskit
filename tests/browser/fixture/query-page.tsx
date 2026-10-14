import React, {createRef, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {TextInput, ThemeProvider, configure} from '@gravity-ui/uikit';
import EditorWorker from 'monaco-editor/editor/editor.worker?worker';
import * as monaco from 'monaco-editor/editor/editor.api';
import {createBuiltinQueryEngines} from '../../../src/widgets/QueryEditor/presets/builtin';
import {createQueryEditorPreset} from '../../../src/helpers/queryEditorPreset';
import type {EditorPreset} from '../../../src/types/editorProviders';
import type {BuiltinQueryEngineId} from '../../../src/types/builtinQueryEngines';
import {QueryPage} from '../../../src/pages/QueryPage';
import {setLang} from '../../../src/i18n';
import '@gravity-ui/uikit/styles/styles.css';

self.MonacoEnvironment = {getWorker: () => new EditorWorker()};
configure({lang: 'en'});
setLang('en');
const engines = createBuiltinQueryEngines();
const refs: Record<string, React.RefObject<monaco.editor.IStandaloneCodeEditor | null>> = {
    '1': createRef(),
    '2': createRef(),
};
const requests: {engineId?: string; language?: string; clusterId?: string}[] = [];
const lifecycle = {created: 0, disposed: 0};
const basePreset = createQueryEditorPreset({
    listPathChildren(request) {
        requests.push({
            engineId: request.engineId,
            language: request.language,
            clusterId: request.clusterId,
        });
        return [{name: `catalog_${request.clusterId}_${request.engineId}`, kind: 'table'}];
    },
});
const preset: EditorPreset = {
    create(context) {
        lifecycle.created++;
        const instance = basePreset.create(context);
        return {
            ...instance,
            dispose() {
                lifecycle.disposed++;
                instance.dispose?.();
            },
        };
    },
};
const queryPageTest = {
    snapshot() {
        return {
            models: monaco.editor
                .getModels()
                .map((model) => ({uri: model.uri.toString(), language: model.getLanguageId()})),
            editors: Object.fromEntries(
                Object.entries(refs).map(([id, ref]) => [
                    id,
                    {
                        language: ref.current?.getModel()?.getLanguageId(),
                        uri: ref.current?.getModel()?.uri.toString(),
                    },
                ]),
            ),
            requests: [...requests],
            lifecycle: {...lifecycle},
        };
    },
    suggest(id: string) {
        const editor = refs[id]?.current;
        if (!editor) throw new Error(`Missing editor ${id}`);
        editor.setValue('SELECT * FROM catalog_');
        editor.setPosition({lineNumber: 1, column: 23});
        editor.focus();
        editor.trigger('test', 'editor.action.triggerSuggest', {});
    },
};
declare global {
    interface Window {
        queryPageTest: typeof queryPageTest;
    }
}
window.queryPageTest = queryPageTest;

function Draft({label}: {label: string}) {
    const [value, setValue] = useState('');
    return <TextInput controlProps={{'aria-label': label}} value={value} onUpdate={setValue} />;
}
function Example() {
    const [queries, setQueries] = useState([
        {id: '1', value: 'SELECT 1;', engineId: 'yql' as BuiltinQueryEngineId, clusterId: 'c'},
        {id: '2', value: 'SELECT 2;', engineId: 'yql' as BuiltinQueryEngineId, clusterId: 'c'},
    ]);
    const [activeTab, setActiveTab] = useState('1');
    return (
        <div style={{height: 'calc(100vh - 16px)'}}>
            <QueryPage
                sidebarProps={{
                    tabs: [
                        {
                            id: 'draft',
                            type: 'custom',
                            title: 'Draft',
                            icon: 'D',
                            renderContent: () => <Draft label="Sidebar draft" />,
                        },
                    ],
                    keepMounted: true,
                }}
                tabsProps={{
                    activeTab,
                    onActiveTabChange: setActiveTab,
                    onAddTab() {},
                    onCloseTab: (id) =>
                        setQueries((items) => items.filter((item) => item.id !== id)),
                    actions:
                        new URLSearchParams(location.search).get('tallTabs') === '1' ? (
                            <div style={{height: 80}}>Tab actions</div>
                        ) : undefined,
                    items: queries.map((query) => ({
                        id: query.id,
                        type: 'query',
                        title: `Query ${query.id}`,
                        status: 'draft',
                        editorProps: {
                            value: query.value,
                            onChange: (value) =>
                                setQueries((items) =>
                                    items.map((item) =>
                                        item.id === query.id ? {...item, value} : item,
                                    ),
                                ),
                            clusters: [
                                {id: 'c', title: 'Cluster'},
                                {id: 'secondary', title: 'Secondary'},
                            ],
                            clusterId: query.clusterId,
                            onClusterChange: (clusterId) =>
                                setQueries((items) =>
                                    items.map((item) =>
                                        item.id === query.id ? {...item, clusterId} : item,
                                    ),
                                ),
                            engines,
                            engineId: query.engineId,
                            onEngineChange: (engineId) =>
                                setQueries((items) =>
                                    items.map((item) =>
                                        item.id === query.id
                                            ? {...item, engineId: engineId as BuiltinQueryEngineId}
                                            : item,
                                    ),
                                ),
                            preset,
                            editorRef: refs[query.id],
                            onRun() {},
                            onFormat() {},
                            onValidate() {},
                        },
                        executionPanelProps: {
                            tabs: [
                                {
                                    id: 'notes',
                                    type: 'custom',
                                    title: 'Notes',
                                    renderContent: ({active}) => (
                                        <div data-execution-active={active}>
                                            <Draft label="Result draft" />
                                        </div>
                                    ),
                                },
                            ],
                        },
                    })),
                }}
            />
        </div>
    );
}
const root = document.getElementById('root');
if (!root) throw new Error('Missing root');
createRoot(root).render(
    <ThemeProvider>
        <Example />
    </ThemeProvider>,
);
