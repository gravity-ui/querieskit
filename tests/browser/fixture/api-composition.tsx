import React, {useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Button, Flex, TextInput, ThemeProvider, configure} from '@gravity-ui/uikit';
import EditorWorker from 'monaco-editor/editor/editor.worker?worker';
import JsonWorker from 'monaco-editor/languages/features/json/json.worker?worker';
import {HistoryFilter, createHistoryFilter} from '../../../src/components/HistoryFilter';
import {QuerySettings} from '../../../src/modules/QuerySettings';
import {QueriesNavigation, createTableDetailConfig} from '../../../src/modules/QueriesNavigation';
import {createBuiltinQuerySettings} from '../../../src/widgets/QueryEditor/presets/builtin';
import type {BuiltinEngineSettings} from '../../../src/types/builtinQueryEngines';
import {setLang} from '../../../src/i18n';
import '@gravity-ui/uikit/styles/styles.css';

self.MonacoEnvironment = {
    getWorker: (_moduleId, label) => (label === 'json' ? new JsonWorker() : new EditorWorker()),
};
configure({lang: 'en'});
setLang('en');

function Filter() {
    const [values, setValues] = useState({owner: ''});
    return (
        <>
            <HistoryFilter
                {...createHistoryFilter({
                    initialValues: {owner: ''},
                    values,
                    onApply: setValues,
                    onReset: () => setValues({owner: ''}),
                    isChanged: Boolean(values.owner),
                    renderFields: ({value, onChange}) => (
                        <TextInput
                            value={value.owner}
                            controlProps={{'aria-label': 'Filter owner'}}
                            onUpdate={(owner) => onChange({owner})}
                        />
                    ),
                })}
            />
            <p data-testid="applied">{values.owner}</p>
            <Button onClick={() => setValues({owner: 'external'})}>Load external filter</Button>
        </>
    );
}
function Settings() {
    const [engine, setEngine] = useState('spyt');
    const [value, setValue] = useState<BuiltinEngineSettings>({spytConfig: '{}'});
    return (
        <div style={{width: 380}}>
            <Flex gap={2}>
                <Button onClick={() => setEngine('yql')}>Use YQL</Button>
                <Button onClick={() => setEngine('spyt')}>Use SPYT</Button>
            </Flex>
            <QuerySettings
                {...createBuiltinQuerySettings({
                    engine: {
                        engineId: engine,
                        value,
                        onChange: setValue,
                        options: {yql: {versions: ['stable']}, spyt: {connectAvailable: true}},
                    },
                    sections: [
                        {
                            id: 'custom',
                            title: 'Application settings',
                            content: (
                                <TextInput controlProps={{'aria-label': 'Application owner'}} />
                            ),
                        },
                    ],
                })}
            />
            <p data-testid="saved-config">{value.spytConfig}</p>
        </div>
    );
}
function Table() {
    const resolve = createTableDetailConfig({
        resolveMeta: () => ({groups: [{items: [{name: 'Owner', value: 'analytics'}]}]}),
        tabs: [
            'meta',
            {id: 'schema', content: 'Application schema'},
            {id: 'preview', content: 'Application preview'},
            {id: 'activity', title: 'Activity', content: 'Application activity'},
        ],
    });
    return (
        <div style={{width: 560, height: 400}}>
            <QueriesNavigation
                location={{cluster: undefined, path: '/home'}}
                onUpdate={() => {}}
                detail={{openedItem: {path: '/home/table', title: 'Table'}, resolve}}
            />
        </div>
    );
}
const scenario = new URLSearchParams(location.search).get('scenario');
let Scenario = Filter;
if (scenario === 'settings') Scenario = Settings;
if (scenario === 'table') Scenario = Table;
const container = document.getElementById('root');
if (!container) throw new Error('Missing fixture root');
createRoot(container).render(
    <ThemeProvider>
        <Scenario />
    </ThemeProvider>,
);
