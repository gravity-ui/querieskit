import React, {useState} from 'react';
import {NavigationActionsMenu} from '../NavigationActionsMenu';
import type {Meta, StoryObj} from '@storybook/react';
import {NavigationItemRow} from './NavigationItemRow';

const meta: Meta<typeof NavigationItemRow> = {
    title: 'Components/NavigationItemRow',
    component: NavigationItemRow,
    parameters: {layout: 'padded'},
    decorators: [
        (Story) => (
            <div style={{width: 400}}>
                <Story />
            </div>
        ),
    ],
};
export default meta;
type Story = StoryObj<typeof NavigationItemRow>;

export const Default: Story = {
    args: {
        item: {path: '/home/events', title: 'Events', kind: 'table'},
        description: 'Daily event records',
    },
};
export const Disabled: Story = {
    args: {
        item: {path: '/home/archive', title: 'Archived events', kind: 'table', disabled: true},
        actions: [{id: 'open', title: 'Open table', content: 'Open', onClick: () => {}}],
    },
};
export const BrokenLink: Story = {
    args: {
        item: {
            path: '/home/missing',
            title: 'Missing destination',
            kind: 'link',
            targetPathBroken: true,
        },
        description: 'The destination is unavailable',
    },
};

export const GroupedActions: Story = {
    args: {
        item: {path: '/home/events', title: 'Events', kind: 'table'},
        actions: [{id: 'favorite', title: 'Favorite', content: '☆', onClick: () => {}}],
        menuActionGroups: [
            {
                id: 'copy',
                title: 'Copy',
                actions: [{id: 'path', title: 'Path', content: null, onClick: () => {}}],
            },
            {
                id: 'insert',
                title: 'Insert into editor',
                actions: [{id: 'reference', title: 'Reference', content: null, onClick: () => {}}],
            },
        ],
    },
};

export const AlwaysVisibleActions: Story = {
    args: {...GroupedActions.args, actionsVisibility: 'always'},
};

export const CustomControlledMenu: Story = {
    render: function CustomControlledMenuStory() {
        const [open, setOpen] = useState(false);
        const [lastAction, setLastAction] = useState('Open the menu, then move outside the row');
        return (
            <NavigationItemRow
                item={{path: '/home/events', title: 'Events', kind: 'table'}}
                description={lastAction}
                actionsMenuOpen={open}
                renderMenuTrigger={({item, disabled}) => (
                    <NavigationActionsMenu
                        arg={item}
                        disabled={disabled}
                        open={open}
                        onOpenToggle={setOpen}
                        groups={[
                            {
                                id: 'copy',
                                title: 'Copy',
                                actions: [
                                    {
                                        id: 'path',
                                        title: 'Path',
                                        content: null,
                                        onClick: (original) => setLastAction(original.path),
                                    },
                                ],
                            },
                        ]}
                    />
                )}
            />
        );
    },
};
