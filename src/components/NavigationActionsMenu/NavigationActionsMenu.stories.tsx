import React from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {NavigationActionsMenu} from './NavigationActionsMenu';

const meta: Meta<typeof NavigationActionsMenu> = {
    title: 'Components/NavigationActionsMenu',
    component: NavigationActionsMenu,
    parameters: {layout: 'padded'},
};
export default meta;
type Story = StoryObj<typeof NavigationActionsMenu>;

export const Default: Story = {
    render: () => (
        <NavigationActionsMenu
            arg={{path: '/tables/events'}}
            actions={[
                {id: 'copy', title: 'Copy path', content: null, onClick: () => {}},
                {id: 'open', title: 'Open in browser', content: null, onClick: () => {}},
            ]}
        />
    ),
};

export const Grouped: Story = {
    render: () => (
        <NavigationActionsMenu
            arg={{path: '/tables/events'}}
            groups={[
                {
                    id: 'copy',
                    title: 'Copy to clipboard',
                    actions: [
                        {id: 'path', title: 'Path', content: null, onClick: () => {}},
                        {id: 'link', title: 'Link', content: null, onClick: () => {}},
                    ],
                },
                {
                    id: 'insert',
                    title: 'Insert into editor',
                    actions: [
                        {id: 'path', title: 'Path', content: null, onClick: () => {}},
                        {
                            id: 'select',
                            title: 'SELECT expression',
                            content: null,
                            disabled: true,
                            onClick: () => {},
                        },
                    ],
                },
            ]}
        />
    ),
};
