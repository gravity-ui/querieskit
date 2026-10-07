import React, {useRef, useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {ArrowUpFromSquare, FloppyDisk} from '@gravity-ui/icons';
import {Button, Flex, Modal, Text} from '@gravity-ui/uikit';
import {action} from 'storybook/actions';
import type {QueryEditorProps} from '../../../types/queryEditor';
import {QueryTabs} from '../../QueryTabs';
import {QueryEditor} from '../QueryEditor';

const QUERY = '-- Query editor example\nSELECT\n    1 AS value;\n';
const CLUSTERS = [
    {id: 'production', title: 'Production'},
    {id: 'development', title: 'Development'},
];
const ENGINES = [
    {id: 'yql', title: 'YQL', language: 'yql'},
    {id: 'clickhouse', title: 'ClickHouse', language: 'clickhouse'},
];

const meta: Meta<typeof QueryEditor> = {
    title: 'Modules/QueryEditor',
    component: QueryEditor,
    tags: ['autodocs'],
    parameters: {layout: 'padded'},
};
export default meta;
type Story = StoryObj<typeof QueryEditor>;

function EditableExample({
    width = '100%',
    ...props
}: Partial<QueryEditorProps> & {width?: number | string}) {
    const [value, setValue] = useState(QUERY);
    const [clusterId, setClusterId] = useState(CLUSTERS[0].id);
    const [engineId, setEngineId] = useState(ENGINES[0].id);
    return (
        <div style={{height: 480, width, maxWidth: '100%'}}>
            <QueryEditor
                value={value}
                onChange={setValue}
                clusters={CLUSTERS}
                clusterId={clusterId}
                onClusterChange={setClusterId}
                engines={ENGINES}
                engineId={engineId}
                onEngineChange={setEngineId}
                onRun={action('onRun')}
                onFormat={action('onFormat')}
                onValidate={action('onValidate')}
                {...props}
            />
        </div>
    );
}

export const Default: Story = {render: () => <EditableExample />};

export const AllActions: Story = {
    render: () => (
        <EditableExample
            additionalActions={[
                {id: 'duplicate', title: 'Duplicate query', onClick: action('duplicate')},
                {id: 'history', title: 'Show history', onClick: action('history'), disabled: true},
            ]}
            rightActions={[
                {id: 'save', title: 'Save', icon: FloppyDisk, onClick: action('save')},
                {id: 'share', title: 'Share', icon: ArrowUpFromSquare, onClick: action('share')},
            ]}
            onCodeAssistantClick={action('onCodeAssistantClick')}
        />
    ),
};

export const SettingsOpen: Story = {
    render: () => <EditableExample defaultSettingsOpen />,
};

function ControlledSettingsExample() {
    const [open, setOpen] = useState(true);
    const [width, setWidth] = useState(320);
    return (
        <Flex direction="column" gap={3}>
            <Flex gap={3} alignItems="center">
                <Button onClick={() => setOpen(!open)}>Toggle Settings externally</Button>
                <Button onClick={() => setWidth(320)}>Reset width</Button>
                <Text>Preferred width: {Math.round(width)} px</Text>
            </Flex>
            <EditableExample
                settingsOpen={open}
                settingsWidth={width}
                onSettingsOpenChange={setOpen}
                onSettingsWidthChange={setWidth}
            />
        </Flex>
    );
}

export const ControlledSettings: Story = {render: () => <ControlledSettingsExample />};
export const NarrowWithLongTitles: Story = {
    render: () => (
        <EditableExample
            width={440}
            defaultSettingsOpen
            clusters={CLUSTERS.map((item) => ({
                ...item,
                title: `${item.title}: analytics cluster in the primary region`,
            }))}
            engines={ENGINES.map((item) => ({
                ...item,
                title: `${item.title}: distributed query engine`,
            }))}
        />
    ),
};
export const EmptyOptions: Story = {
    render: () => (
        <EditableExample clusters={[]} engines={[]} clusterId={undefined} engineId={undefined} />
    ),
};
export const ActionStates: Story = {
    render: () => (
        <EditableExample
            actionStates={{
                run: {loading: true},
                format: {disabled: true},
                validate: {disabled: true},
            }}
        />
    ),
};

type Draft = {
    id: string;
    title: string;
    value: string;
    savedValue: string;
    clusterId: string;
    engineId: string;
};
function createDraft(id: string): Draft {
    return {
        id,
        title: `Query ${id}`,
        value: QUERY,
        savedValue: QUERY,
        clusterId: CLUSTERS[0].id,
        engineId: ENGINES[0].id,
    };
}

function TabsExample() {
    const [drafts, setDrafts] = useState(() => [createDraft('1'), createDraft('2')]);
    const [activeId, setActiveId] = useState<string | undefined>('1');
    const [pendingClose, setPendingClose] = useState<string>();
    const nextId = useRef(3);
    const updateDraft = (id: string, update: Partial<Draft>) => {
        setDrafts((current) =>
            current.map((draft) => (draft.id === id ? {...draft, ...update} : draft)),
        );
    };
    const closeTab = (id: string) => {
        const index = drafts.findIndex((draft) => draft.id === id);
        if (activeId === id) setActiveId(drafts[index + 1]?.id ?? drafts[index - 1]?.id);
        setDrafts((current) => current.filter((draft) => draft.id !== id));
        setPendingClose(undefined);
    };
    return (
        <Flex direction="column" gap={3}>
            <Text color="secondary">
                Edit a query to mark its tab as modified. Save establishes a new baseline; closing a
                modified tab asks for confirmation.
            </Text>
            <div>
                <QueryTabs
                    items={drafts.map((draft) => ({
                        id: draft.id,
                        title: draft.title,
                        type: 'query',
                        status: 'draft',
                        isModified: draft.value !== draft.savedValue,
                    }))}
                    activeTab={activeId}
                    onActiveTabChange={setActiveId}
                    onAddTab={() => {
                        const draft = createDraft(String(nextId.current++));
                        setDrafts((current) => [...current, draft]);
                        setActiveId(draft.id);
                    }}
                    onCloseTab={(id) => {
                        const draft = drafts.find((item) => item.id === id);
                        if (draft && draft.value !== draft.savedValue) setPendingClose(id);
                        else closeTab(id);
                    }}
                />
                {/* Keep every editor mounted: each owns its model, cursor and Undo stack. */}
                {drafts.map((draft) => (
                    <div key={draft.id} hidden={draft.id !== activeId} style={{height: 480}}>
                        <QueryEditor
                            value={draft.value}
                            onChange={(value) => updateDraft(draft.id, {value})}
                            clusters={CLUSTERS}
                            clusterId={draft.clusterId}
                            onClusterChange={(clusterId) => updateDraft(draft.id, {clusterId})}
                            engines={ENGINES}
                            engineId={draft.engineId}
                            onEngineChange={(engineId) => updateDraft(draft.id, {engineId})}
                            onRun={() => action('onRun')(draft)}
                            onFormat={() => {
                                // Demo only: the consuming application supplies its actual formatter.
                                updateDraft(draft.id, {value: draft.value.trim() + '\n'});
                                action('onFormat')(draft.id);
                            }}
                            onValidate={() => action('onValidate')(draft)}
                            rightActions={[
                                {
                                    id: 'save',
                                    title: 'Save',
                                    icon: FloppyDisk,
                                    onClick: () => updateDraft(draft.id, {savedValue: draft.value}),
                                },
                            ]}
                        />
                    </div>
                ))}
            </div>
            <Modal
                open={pendingClose !== undefined}
                onClose={() => setPendingClose(undefined)}
                aria-label="Close modified query?"
            >
                <Flex
                    direction="column"
                    gap={4}
                    style={{padding: 'var(--g-spacing-6)', maxWidth: 420}}
                >
                    <Text variant="subheader-3">Close modified query?</Text>
                    <Text>Unsaved changes will be lost. Do you want to close this tab?</Text>
                    <Flex gap={2} justifyContent="flex-end">
                        <Button onClick={() => setPendingClose(undefined)}>Cancel</Button>
                        <Button
                            view="outlined-danger"
                            onClick={() => {
                                if (pendingClose !== undefined) closeTab(pendingClose);
                            }}
                        >
                            Close tab
                        </Button>
                    </Flex>
                </Flex>
            </Modal>
        </Flex>
    );
}
export const WithQueryTabs: Story = {render: () => <TabsExample />};
