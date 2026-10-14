import React, {useState} from 'react';
import {createRoot} from 'react-dom/client';
import {ThemeProvider, configure} from '@gravity-ui/uikit';
import EditorWorker from 'monaco-editor/editor/editor.worker?worker';
import {QueriesHistory} from '../../../src/modules/QueriesHistory';
import {setLang} from '../../../src/i18n';
import type {QueryHistoryRow} from '../../../src/types/history';
import '@gravity-ui/uikit/styles/styles.css';

self.MonacoEnvironment = {getWorker: () => new EditorWorker()};
configure({lang: 'en'});
setLang('en');

const items: QueryHistoryRow[] = [
    {
        id: 'query',
        title: 'History query',
        query: 'SELECT 42 AS answer;',
        href: '#query',
        height: 40,
        status: 'completed',
        engine: 'yql',
    },
];

function Fixture() {
    const [search, setSearch] = useState({value: '', fullSearch: false});
    window.historyLoadingTest = {
        search: () => setSearch({value: 'SELECT', fullSearch: true}),
    };
    return (
        <ThemeProvider theme="light">
            <div style={{width: 600, height: 500}}>
                <QueriesHistory items={items} search={{...search, onUpdate: setSearch}} />
            </div>
        </ThemeProvider>
    );
}

const container = document.getElementById('root');
if (!container) throw new Error('Missing fixture root');
createRoot(container).render(<Fixture />);

declare global {
    interface Window {
        historyLoadingTest: {search: () => void};
    }
}
