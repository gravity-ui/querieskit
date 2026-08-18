import React from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {TutorialRow} from './TutorialRow';
import {TutorialHistoryRow} from '../../types/tutorial';

const makeRow = (overrides: Partial<TutorialHistoryRow>): TutorialHistoryRow => ({
    id: 1,
    title: 'Getting started with YQL',
    height: 28,
    ...overrides,
});

const meta: Meta<typeof TutorialRow> = {
    title: 'Modules/TutorialRow',
    component: TutorialRow,
    tags: ['autodocs'],
    parameters: {
        layout: 'padded',
    },
    args: {
        item: makeRow({}),
    },
    decorators: [
        (Story) => (
            <div style={{width: 380}}>
                <Story />
            </div>
        ),
    ],
};

export default meta;
type Story = StoryObj<typeof TutorialRow>;

/** Default tutorial row */
export const Default: Story = {};

/** Row with a link */
export const WithHref: Story = {
    args: {
        item: makeRow({href: '#'}),
    },
};
