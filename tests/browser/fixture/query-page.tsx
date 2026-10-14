import React, {useState} from 'react';
import {createRoot} from 'react-dom/client';
import {TextInput, ThemeProvider, configure} from '@gravity-ui/uikit';
import EditorWorker from 'monaco-editor/editor/editor.worker?worker';
import {QueryPage} from '../../../src/pages/QueryPage';
import {setLang} from '../../../src/i18n';
import '@gravity-ui/uikit/styles/styles.css';

self.MonacoEnvironment = {getWorker: () => new EditorWorker()};
configure({lang: 'en'});
setLang('en');
function Draft({label}: {label: string}) {
    const [value, setValue] = useState('');
    return <TextInput controlProps={{'aria-label': label}} value={value} onUpdate={setValue} />;
}
function Example() {
    const [queries, setQueries] = useState([
        {id: '1', value: 'SELECT 1;'},
        {id: '2', value: 'SELECT 2;'},
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
                            clusters: [{id: 'c', title: 'Cluster'}],
                            clusterId: 'c',
                            onClusterChange() {},
                            engines: [{id: 'e', title: 'SQL', language: 'sql'}],
                            engineId: 'e',
                            onEngineChange() {},
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
