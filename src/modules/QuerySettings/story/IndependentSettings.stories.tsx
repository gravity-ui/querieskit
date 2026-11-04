import React, {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {TextInput} from '@gravity-ui/uikit';
import {QuerySettings} from '../QuerySettings';
import {BuiltinEngineSettingsFields} from '../../../widgets/QueryEditor/presets/builtin';
import type {BuiltinEngineSettings} from '../../../types/builtinQueryEngines';
import type {QuerySettingsAttribute} from '../../../types/querySettings';

function IndependentSettingsExample() {
    const [title, setTitle] = useState('Independent state owners');
    const [engine, setEngine] = useState<BuiltinEngineSettings>({yqlVersion: 'stable'});
    const [attributes, setAttributes] = useState<QuerySettingsAttribute<number>[]>([
        {id: 'limit', key: 'limit', value: 10},
    ]);
    return (
        <QuerySettings
            mode="sections"
            general={{
                queryName: {value: title, onChange: setTitle},
                customFields: (
                    <BuiltinEngineSettingsFields
                        engineId="yql"
                        options={{yql: {versions: ['stable', 'latest']}}}
                        value={engine}
                        onChange={setEngine}
                    />
                ),
            }}
            attributes={{
                items: attributes,
                onChange: setAttributes,
                attributeCodec: {
                    format: String,
                    parse: (text) =>
                        text.trim() && Number.isFinite(Number(text))
                            ? {value: Number(text)}
                            : {error: 'Enter a number'},
                },
            }}
        />
    );
}
const meta = {
    title: 'Modules/QuerySettings/Independent state',
    component: IndependentSettingsExample,
} satisfies Meta<typeof IndependentSettingsExample>;
export default meta;
type Story = StoryObj<typeof meta>;
export const IndependentBindings: Story = {};

/** Application settings can use their own model without the standard General fields. */
export const CustomSections: Story = {
    render: function CustomSectionsStory() {
        const [workspace, setWorkspace] = useState('analytics');
        return (
            <QuerySettings
                mode="sections"
                sections={[
                    {
                        id: 'workspace',
                        title: 'Application workspace',
                        content: (
                            <TextInput
                                label="Workspace"
                                controlProps={{'aria-label': 'Workspace'}}
                                value={workspace}
                                onUpdate={setWorkspace}
                            />
                        ),
                    },
                ]}
            />
        );
    },
};
