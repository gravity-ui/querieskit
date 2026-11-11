import React from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {RowActionsMenu} from './RowActionsMenu';

const meta: Meta<typeof RowActionsMenu> = {
    title: 'Components/RowActionsMenu',
    component: RowActionsMenu,
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
type Story = StoryObj<typeof RowActionsMenu>;

export const Default: Story = {
    args: {
        item: {id: 'query', height: 40, title: 'Revenue query'},
        actions: [
            {text: 'Rename query', onClick: () => {}},
            {text: 'Delete query', theme: 'danger', onClick: () => {}},
        ],
    },
};
export const DisabledAction: Story = {
    args: {
        item: {id: 'query', height: 40, title: 'Revenue query'},
        actions: [
            {text: 'Rename query', disabled: true, onClick: () => {}},
            {text: 'Copy query', onClick: () => {}},
        ],
    },
};
