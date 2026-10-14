import React from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {useArgs} from 'storybook/preview-api';
import {action} from 'storybook/actions';
import {EngineSettingsExample} from './EngineSettingsExample';
import type {EngineSettingsExampleProps} from './EngineSettingsExample';

const meta = {
    title: 'Modules/QueryEditor',
    component: EngineSettingsExample,
    parameters: {layout: 'padded'},
    args: {
        engineId: 'yql',
        onEngineChange: action('engine changed'),
        loading: false,
        empty: false,
        connectAvailable: false,
        disabled: false,
        withErrors: false,
        customEngine: false,
    },
    argTypes: {
        engineId: {control: 'select', options: ['yql', 'chyt', 'spyt', 'custom']},
        onEngineChange: {control: false, table: {disable: true}},
        loading: {control: 'boolean'},
        empty: {control: 'boolean'},
        connectAvailable: {control: 'boolean'},
        disabled: {control: 'boolean'},
        withErrors: {control: 'boolean'},
        customEngine: {control: 'boolean'},
    },
    render: function Render(args) {
        const [, updateArgs] = useArgs<EngineSettingsExampleProps>();
        return (
            <EngineSettingsExample
                {...args}
                customEngine={args.customEngine || args.engineId === 'custom'}
                onEngineChange={(engineId) => {
                    updateArgs({engineId});
                    args.onEngineChange(engineId);
                }}
            />
        );
    },
} satisfies Meta<typeof EngineSettingsExample>;

export default meta;
type Story = StoryObj<typeof meta>;

export const EngineSettings: Story = {};
