import React from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {QueryDuration} from './QueryDuration';

const now = Date.now();
const fiveMinutesAgo = now - 5 * 60 * 1000;
const oneHourAgo = now - 60 * 60 * 1000;

const meta: Meta<typeof QueryDuration> = {
    title: 'Components/QueryDuration',
    component: QueryDuration,
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof QueryDuration>;

/** Live timer: endTime not provided — counter ticks every second */
export const Default: Story = {
    args: {
        status: 'running',
        startTime: fiveMinutesAgo,
    },
};

/** All variants side by side: Running updates in real time, Draft is static */
export const AllStatuses: Story = {
    render: () => (
        <div style={{display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center'}}>
            {/* Static */}
            <QueryDuration status="completed" startTime={fiveMinutesAgo} endTime={now} />
            <QueryDuration status="failed" startTime={oneHourAgo} endTime={now} />
            <QueryDuration status="aborted" startTime={fiveMinutesAgo} endTime={now} />
            {/* Live timer */}
            <QueryDuration status="running" startTime={fiveMinutesAgo} />
            {/* Always --:-- */}
            <QueryDuration status="draft" startTime={now} />
        </div>
    ),
};
