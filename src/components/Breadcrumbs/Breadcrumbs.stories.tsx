import React, {useEffect, useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {fn} from 'storybook/test';
import {Breadcrumbs} from './Breadcrumbs';

const meta: Meta<typeof Breadcrumbs> = {
    title: 'Components/Breadcrumbs',
    component: Breadcrumbs,
    tags: ['autodocs'],
    args: {location: {cluster: 'production', path: '//home/analytics/events'}, onUpdate: fn()},
    render: function Render(args) {
        const [location, setLocation] = useState(args.location);
        useEffect(() => setLocation(args.location), [args.location]);
        return (
            <Breadcrumbs
                {...args}
                location={location}
                onUpdate={(value) => {
                    setLocation(value);
                    args.onUpdate(value);
                }}
            />
        );
    },
};
export default meta;
type Story = StoryObj<typeof Breadcrumbs>;
export const Default: Story = {};
export const Empty: Story = {args: {location: {cluster: undefined, path: undefined}}};
export const ClusterRoot: Story = {args: {location: {cluster: 'production', path: undefined}}};
export const LongPath: Story = {
    args: {location: {cluster: 'production', path: '//home/analytics/daily/2026/october/events'}},
    decorators: [
        (Story) => (
            <div style={{width: 320}}>
                <Story />
            </div>
        ),
    ],
};
export const WithLinks: Story = {
    args: {getBreadcrumbHref: ({cluster, path}) => `#${cluster ?? ''}${path ?? ''}`},
};
