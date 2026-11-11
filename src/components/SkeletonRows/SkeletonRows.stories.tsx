import React from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {SkeletonRows} from './SkeletonRows';
import './SkeletonRows.stories.scss';

const meta: Meta<typeof SkeletonRows> = {
    title: 'Components/SkeletonRows',
    component: SkeletonRows,
    parameters: {layout: 'padded'},
    decorators: [
        (Story) => (
            <div style={{width: 400, height: 160}}>
                <Story />
            </div>
        ),
    ],
};
export default meta;
type Story = StoryObj<typeof SkeletonRows>;

export const Default: Story = {args: {count: 3, rowClassName: 'qp-skeleton-rows-story__row'}};
export const SingleRow: Story = {args: {count: 1, rowClassName: 'qp-skeleton-rows-story__row'}};
