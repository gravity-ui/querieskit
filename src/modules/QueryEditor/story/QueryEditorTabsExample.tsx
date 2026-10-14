import React, {useRef, useState} from 'react';
import {Button, Flex, Modal, Text} from '@gravity-ui/uikit';
import {action} from 'storybook/actions';
import {QueryTabs} from '../../QueryTabs';
import {QueryEditor} from '../QueryEditor';
import {CLUSTERS, TAB_ENGINES} from './demoData';

const QUERY = '-- Query editor example\nSELECT\n    1 AS value;\n';

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
        engineId: TAB_ENGINES[0].id,
    };
}

export function QueryEditorTabsExample() {
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
                            engines={TAB_ENGINES}
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
