import React from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {EmptyContent} from './EmptyContent';

const meta: Meta<typeof EmptyContent> = {
    title: 'Components/EmptyContent',
    component: EmptyContent,
    parameters: {layout: 'padded'},
    decorators: [
        (Story) => (
            <div style={{width: 400, height: 320}}>
                <Story />
            </div>
        ),
    ],
};
export default meta;
type Story = StoryObj<typeof EmptyContent>;

export const NoData: Story = {args: {variant: 'no-data'}};
export const NothingFound: Story = {args: {variant: 'nothing-found'}};
export const CustomMessage: Story = {
    args: {
        variant: 'no-files',
        title: 'No reports yet',
        description: 'Create a report to get started',
    },
};
