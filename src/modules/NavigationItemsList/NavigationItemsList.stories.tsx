import React from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {NavigationItemsList} from './NavigationItemsList';

const meta: Meta<typeof NavigationItemsList> = {
    title: 'Modules/NavigationItemsList',
    component: NavigationItemsList,
    parameters: {layout: 'padded'},
    decorators: [
        (Story) => (
            <div style={{width: 360, height: 360}}>
                <Story />
            </div>
        ),
    ],
    args: {
        titleLabel: 'Name',
        path: '/analytics',
        sort: 'asc',
        items: [
            {path: '/analytics/reports', title: 'Reports', kind: 'folder', hasChildren: true},
            {path: '/analytics/events', title: 'Events', kind: 'table'},
            {path: '/analytics/query.sql', title: 'query.sql', kind: 'file'},
            {path: '/analytics/private', title: 'Private dataset', kind: 'table', disabled: true},
        ],
    },
};

export default meta;
type Story = StoryObj<typeof NavigationItemsList>;

export const Default: Story = {};
export const Descriptions: Story = {
    args: {getItemRowConfig: (item) => ({description: `Location: ${item.path}`})},
};
export const Empty: Story = {args: {items: [], emptyContent: 'This directory is empty'}};
export const EmptySearch: Story = {
    args: {items: [], search: 'unknown', emptyContent: 'No matching files'},
};
