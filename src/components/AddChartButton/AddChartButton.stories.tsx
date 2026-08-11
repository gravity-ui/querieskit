import type {Meta, StoryObj} from '@storybook/react';
import {action} from 'storybook/actions';

import {AddChartButton} from './AddChartButton';

const meta: Meta<typeof AddChartButton> = {
    title: 'Components/AddChartButton',
    component: AddChartButton,
    tags: ['autodocs'],
    parameters: {
        layout: 'padded',
    },
    args: {
        onSelect: action('onSelect'),
        onOpenToggle: action('onOpenToggle'),
    },
};

export default meta;
type Story = StoryObj<typeof AddChartButton>;

export const Default: Story = {};

export const Opened: Story = {
    args: {
        open: true,
    },
};

export const CustomText: Story = {
    args: {
        text: 'Add visualization',
    },
};
