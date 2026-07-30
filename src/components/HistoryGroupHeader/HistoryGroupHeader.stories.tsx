import type {Meta, StoryObj} from '@storybook/react';
import {HistoryGroupHeader} from './HistoryGroupHeader';

const meta: Meta<typeof HistoryGroupHeader> = {
    title: 'Components/HistoryGroupHeader',
    component: HistoryGroupHeader,
    tags: ['autodocs'],
    argTypes: {
        title: {control: 'text'},
    },
};

export default meta;
type Story = StoryObj<typeof HistoryGroupHeader>;

export const Default: Story = {
    args: {
        title: 'Last 7 days',
    },
};
