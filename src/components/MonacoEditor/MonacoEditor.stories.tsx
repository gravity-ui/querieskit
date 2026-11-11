import React from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {MonacoEditor} from './MonacoEditor';

const meta: Meta<typeof MonacoEditor> = {
    title: 'Components/MonacoEditor',
    component: MonacoEditor,
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
type Story = StoryObj<typeof MonacoEditor>;

export const Default: Story = {
    args: {
        value: 'SELECT revenue FROM events;\n',
        language: 'sql',
        monacoConfig: {minimap: {enabled: false}, automaticLayout: true},
    },
};
export const ReadOnly: Story = {
    args: {
        ...Default.args,
        readOnly: true,
        value: 'SELECT region, SUM(revenue)\nFROM events\nGROUP BY region;',
        highlightedLine: 2,
    },
};
