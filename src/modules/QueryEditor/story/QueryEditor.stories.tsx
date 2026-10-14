import React, {useRef, useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {Button, Flex, Modal, Text} from '@gravity-ui/uikit';
import {action} from 'storybook/actions';
import type {QueryEditorPanel, QueryEditorProps} from '../../../types/queryEditor';
import type {QueryShareLink} from '../../../types/queryShare';
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
                {...(props.settingsProps
                    ? {settings: undefined, settingsProps: props.settingsProps}
                    : {settings: props.settings, settingsProps: undefined})}
                {...(props.attachmentsProps
                    ? {attachments: undefined, attachmentsProps: props.attachmentsProps}
                    : {attachments: props.attachments, attachmentsProps: undefined})}
                {...(props.parametersProps
                    ? {parameters: undefined, parametersProps: props.parametersProps}
                    : {parameters: props.parameters, parametersProps: undefined})}
            />
        </div>
    );
}

function SharingExample(props: Partial<QueryEditorProps>) {
    const [link, setLink] = useState<QueryShareLink>();
    const revision = useRef(0);
    const generate = (permanent: boolean) => {
        revision.current += 1;
        setLink({
            url: `https://example.com/queries/shared-${revision.current}`,
            expiresAt: permanent ? null : Date.now() + 24 * 60 * 60 * 1000,
        });
    };
    return (
        <EditableExample
            {...props}
            shareProps={{
                link,
                onGenerate: () => generate(false),
                onRegenerate: () => generate(link?.expiresAt === null),
                onMakePermanent: () => generate(true),
                onExpirationChange: (expiresAt) =>
                    setLink((current) => current && {...current, expiresAt}),
            }}
        />
    );
}

export const Default: Story = {
    render: () => (
        <SharingExample
            additionalActions={[
                {id: 'duplicate', title: 'Duplicate query', onClick: action('duplicate')},
                {id: 'history', title: 'Show history', onClick: action('history'), disabled: true},
            ]}
            saveProps={{onSave: action('onSave'), onSaveAs: action('onSaveAs')}}
            onCodeAssistantClick={action('onCodeAssistantClick')}
        />
    ),
};

export const SplitView: Story = {
    render: () => <EditableExample defaultActivePanel="settings" />,
};

function ControlledSplitViewExample() {
    const [activePanel, setActivePanel] = useState<QueryEditorPanel>('settings');
    const [width, setWidth] = useState(320);
    return (
        <Flex direction="column" gap={3}>
            <Flex gap={3} alignItems="center">
                <Button
                    onClick={() => setActivePanel(activePanel === 'settings' ? null : 'settings')}
                >
                    Toggle side panel externally
                </Button>
                <Button onClick={() => setWidth(320)}>Reset width</Button>
                <Text>Preferred width: {Math.round(width)} px</Text>
            </Flex>
            <EditableExample
                activePanel={activePanel}
                panelWidth={width}
                onActivePanelChange={setActivePanel}
                onPanelWidthChange={setWidth}
            />
        </Flex>
    );
}

export const ControlledSplitView: Story = {render: () => <ControlledSplitViewExample />};
export const NarrowWithLongTitles: Story = {
    render: () => (
        <EditableExample
            width={440}
            defaultActivePanel="settings"
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
                            saveProps={{
                                onSave: () => updateDraft(draft.id, {savedValue: draft.value}),
                                onSaveAs: () => {
                                    const copy = {
                                        ...draft,
                                        id: String(nextId.current++),
                                        title: `${draft.title} (copy)`,
                                        savedValue: draft.value,
                                    };
                                    setDrafts((current) => [...current, copy]);
                                    setActiveId(copy.id);
                                },
                            }}
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
