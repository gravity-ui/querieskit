import React from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {TutorialSearchRow} from './TutorialSearchRow';
import {TutorialHistoryRow} from '../../types/tutorial';

const QUERY = `use test;

SELECT
    "test_session" AS session_id,
    "test_task" AS task_id,
    SUBSTRING("test", 1, 1) AS truncated_char`;

const makeRow = (overrides: Partial<TutorialHistoryRow>): TutorialHistoryRow => ({
    id: 1,
    title: 'Getting started with YQL',
    query: QUERY,
    height: 110,
    ...overrides,
});

const meta: Meta<typeof TutorialSearchRow> = {
    title: 'Modules/TutorialSearchRow',
    component: TutorialSearchRow,
    tags: ['autodocs'],
    parameters: {
        layout: 'padded',
    },
    args: {
        item: makeRow({}),
    },
    decorators: [
        (Story) => (
            <div style={{width: 420}}>
                <Story />
            </div>
        ),
    ],
};

export default meta;
type Story = StoryObj<typeof TutorialSearchRow>;

/** Default tutorial search row */
export const Default: Story = {};
