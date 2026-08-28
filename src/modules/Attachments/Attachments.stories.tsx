import React from 'react';
import {Attachments} from './Attachments';
import type {Meta, StoryObj} from '@storybook/react';

const meta = {
    title: 'Modules/Attachments',
    component: () => (
        <div style={{height: '620px'}}>
            <Attachments />
        </div>
    ),
    tags: ['autodocs'],
    parameters: {
        layout: 'padded',
    },
} satisfies Meta<typeof Attachments>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
