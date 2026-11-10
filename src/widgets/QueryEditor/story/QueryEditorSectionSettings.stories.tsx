import React, {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {Text, TextInput} from '@gravity-ui/uikit';
import {QueryEditor} from '../QueryEditor';
import {createBuiltinQueryEngines, createBuiltinQuerySettings} from '../presets/builtin';
import type {
    BuiltinEngineSettings,
    BuiltinQueryEnginesOptions,
} from '../../../types/builtinQueryEngines';
import {FormField} from '../../../components/FormField';

const engineOptions: BuiltinQueryEnginesOptions = {
    yql: {versions: ['stable', 'preview']},
    chyt: {cliques: [{alias: 'analytics', state: 'active', health: 'good'}]},
    spyt: {connectAvailable: true},
};
const engines = createBuiltinQueryEngines(engineOptions);

function Example({disabled = false}) {
    const [query, setQuery] = useState('SELECT 1;');
    const [engineId, setEngineId] = useState('yql');
    const [engineSettings, setEngineSettings] = useState<BuiltinEngineSettings>({
        yqlVersion: 'stable',
    });
    const [queryName, setQueryName] = useState('Daily report');
    const [owner, setOwner] = useState('Analytics team');

    return (
        <div style={{height: 600}}>
            <QueryEditor
                value={query}
                onChange={setQuery}
                engines={engines}
                engineId={engineId}
                onEngineChange={setEngineId}
                clusters={[]}
                onClusterChange={() => {}}
                onRun={() => {}}
                onFormat={() => {}}
                onValidate={() => {}}
                defaultActivePanel="settings"
                defaultPanelWidth={360}
                settingsProps={createBuiltinQuerySettings({
                    engine: {
                        engineId,
                        options: engineOptions,
                        value: engineSettings,
                        onChange: setEngineSettings,
                    },
                    disabled,
                    general: {
                        queryName: {value: queryName, onChange: setQueryName},
                        customFields: (
                            <Text color="secondary">Settings are owned independently.</Text>
                        ),
                    },
                    sections: [
                        {
                            id: 'ownership',
                            title: 'Ownership',
                            content: (
                                <FormField label="Owner">
                                    <TextInput
                                        value={owner}
                                        onUpdate={setOwner}
                                        disabled={disabled}
                                        controlProps={{'aria-label': 'Owner'}}
                                    />
                                </FormField>
                            ),
                        },
                    ],
                })}
            />
        </div>
    );
}

const meta = {
    title: 'Widgets/QueryEditor/SectionSettings',
    component: Example,
    parameters: {layout: 'padded'},
    args: {disabled: false},
    tags: ['autodocs'],
} satisfies Meta<typeof Example>;
export default meta;
type Story = StoryObj<typeof meta>;

export const BuiltinAndCustom: Story = {};
export const Disabled: Story = {args: {disabled: true}};
