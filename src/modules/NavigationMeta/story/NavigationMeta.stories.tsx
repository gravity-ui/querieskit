import React from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {Label, Text} from '@gravity-ui/uikit';
import {NavigationMeta} from '..';
import {META_GROUPS} from './mockData';

const meta: Meta<typeof NavigationMeta> = {
    title: 'Modules/NavigationMeta',
    component: NavigationMeta,
    tags: ['autodocs'],
    parameters: {
        layout: 'padded',
    },
    decorators: [
        (Story) => (
            <div style={{width: 560}}>
                <Story />
            </div>
        ),
    ],
};

export default meta;
type Story = StoryObj<typeof NavigationMeta>;

export const Default: Story = {
    args: {
        data: {groups: META_GROUPS, loaded: true},
    },
};

export const Loading: Story = {
    args: {
        data: {groups: [], loading: true},
    },
};

export const Empty: Story = {
    args: {
        data: {groups: [], loaded: true},
    },
};

export const Error: Story = {
    args: {
        data: {groups: [], errorContent: 'Failed to load table metadata'},
    },
};

export const WithExtraContent: Story = {
    args: {
        data: {groups: META_GROUPS, loaded: true},
        view: {
            extraContent: (
                <Text color="secondary" variant="caption-2">
                    Additional info rendered below the default groups
                </Text>
            ),
        },
    },
};

export const CustomRender: Story = {
    args: {
        data: {groups: META_GROUPS, loaded: true},
        view: {
            render: (data) => (
                <div style={{display: 'flex', flexWrap: 'wrap', gap: 8}}>
                    {data.groups
                        .flatMap((group) => group.items)
                        .map((item, index) => (
                            <Label key={index}>
                                {item.name}: {String(item.value)}
                            </Label>
                        ))}
                </div>
            ),
        },
    },
};
