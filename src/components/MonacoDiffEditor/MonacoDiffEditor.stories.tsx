import React from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {MonacoDiffEditor} from './MonacoDiffEditor';

const meta: Meta<typeof MonacoDiffEditor> = {
    title: 'Components/MonacoDiffEditor',
    component: MonacoDiffEditor,
    parameters: {layout: 'padded'},
    decorators: [
        (Story) => (
            <div style={{width: 800, height: 320}}>
                <Story />
            </div>
        ),
    ],
};
export default meta;
type Story = StoryObj<typeof MonacoDiffEditor>;

export const Split: Story = {
    args: {
        original: 'SELECT revenue FROM events;',
        modified: 'SELECT revenue, region FROM events;',
        language: 'sql',
        mode: 'split',
    },
};
export const Unified: Story = {args: {...Split.args, mode: 'unified'}};
