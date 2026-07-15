import type {Meta, StoryObj} from '@storybook/react';

import {QueriesHistory} from './QueriesHistory';

const meta: Meta<typeof QueriesHistory> = {
    title: 'Components/QueriesHistory',
    component: QueriesHistory,
};

export default meta;

type Story = StoryObj<typeof QueriesHistory>;

export const Default: Story = {};
