import React, {useState, useSyncExternalStore} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {Text} from '@gravity-ui/uikit';
import {QueryPage} from '..';
import {QueryWorkspaceLayout} from '../../../modules/QueryWorkspaceLayout';
import {QueryEditor} from '../../../widgets/QueryEditor';
import {QueryExecutionPanel} from '../../../widgets/QueryExecutionPanel';

const engines = [{id: 'sql', title: 'SQL', language: 'sql'}];
type SessionValue = {text: string; result?: string};
type SessionBinding = {value: SessionValue; onChange: (value: SessionValue) => void};

function Workspace({active, value, onChange}: SessionBinding & {active: boolean}) {
    return (
        <QueryWorkspaceLayout
            active={active}
            showResults={value.result !== undefined}
            renderEditor={({active: editorActive}) => (
                <QueryEditor
                    active={editorActive}
                    engines={engines}
                    engineId="sql"
                    onEngineChange={() => {}}
                    clusters={[]}
                    onClusterChange={() => {}}
                    value={value.text}
                    onChange={(text) => onChange({...value, text})}
                    onRun={() => onChange({...value, result: value.text})}
                    hiddenActions={['validate']}
                    hiddenPanels={['settings', 'attachments', 'parameters']}
                />
            )}
            renderExecutionPanel={(layout) => (
                <QueryExecutionPanel
                    {...layout}
                    tabs={[
                        {
                            id: 'result',
                            type: 'custom',
                            title: 'Result',
                            renderContent: () => <Text>{value.result}</Text>,
                        },
                    ]}
                />
            )}
        />
    );
}

function LocalSession({active}: {active: boolean}) {
    const [value, onChange] = useState<SessionValue>({text: 'select 1'});
    return <Workspace active={active} value={value} onChange={onChange} />;
}

// A minimal external store demonstrates that the library does not own query sessions.
function createSessionStore() {
    const values = new Map<string, SessionValue>();
    const listeners = new Set<() => void>();
    return {
        subscribe(listener: () => void) {
            listeners.add(listener);
            return () => {
                listeners.delete(listener);
            };
        },
        get(id: string) {
            const existing = values.get(id);
            if (existing) return existing;
            const value = {text: `select '${id}'`};
            values.set(id, value);
            return value;
        },
        set(id: string, value: SessionValue) {
            values.set(id, value);
            listeners.forEach((listener) => listener());
        },
        remove(id: string) {
            values.delete(id);
        },
    };
}

function ExternalSession({
    id,
    active,
    store,
}: {
    id: string;
    active: boolean;
    store: ReturnType<typeof createSessionStore>;
}) {
    const value = useSyncExternalStore(store.subscribe, () => store.get(id));
    return <Workspace active={active} value={value} onChange={(next) => store.set(id, next)} />;
}

function Example({external = false}: {external?: boolean}) {
    const [store] = useState(createSessionStore);
    const [ids, setIds] = useState(['query-1', 'query-2']);
    const [nextId, setNextId] = useState(3);
    const [activeTab, setActiveTab] = useState('query-1');
    return (
        <div style={{height: 760}}>
            <QueryPage
                sidebarProps={{
                    tabs: [
                        {
                            id: 'history',
                            type: 'history',
                            renderContent: () => <Text>Application-owned history</Text>,
                        },
                    ],
                }}
                tabsProps={{
                    items: ids.map((id) => ({
                        id,
                        type: 'query',
                        title: id,
                        status: 'draft',
                        renderContent: ({active}) =>
                            external ? (
                                <ExternalSession id={id} active={active} store={store} />
                            ) : (
                                <LocalSession active={active} />
                            ),
                    })),
                    activeTab,
                    onActiveTabChange: setActiveTab,
                    onAddTab: () => {
                        const id = `query-${nextId}`;
                        setNextId(nextId + 1);
                        setIds([...ids, id]);
                        setActiveTab(id);
                    },
                    onCloseTab: (id) => {
                        const remaining = ids.filter((entry) => entry !== id);
                        setIds(remaining);
                        if (id === activeTab) setActiveTab(remaining[0] ?? '');
                        store.remove(id);
                    },
                }}
            />
        </div>
    );
}
const meta = {title: 'Pages/QueryPage/Composition', component: Example} satisfies Meta<
    typeof Example
>;
export default meta;
type Story = StoryObj<typeof meta>;
export const LocalState: Story = {};
export const ExternalStore: Story = {args: {external: true}};
