import React from 'react';
import {AttachmentListPlaceholder} from './AttachmentListPlaceholder';
import type {Meta, StoryObj} from '@storybook/react';

const meta = {
    title: 'Components/AttachmentListPlaceholder',
    component: AttachmentListPlaceholder,
    tags: ['autodocs'],
    parameters: {
        layout: 'centered',
    },
    decorators: [
        (Story) => (
            <div style={{width: 324, height: 622}}>
                <Story />
            </div>
        ),
    ],
    args: {
        title: 'No attachments',
        description: 'Add attachment for use in the request',
        linkForDoc: '#attachments-help',
    },
} satisfies Meta<typeof AttachmentListPlaceholder>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Empty state with documentation and two secondary actions, matching the Figma example. */
export const Default: Story = {};
