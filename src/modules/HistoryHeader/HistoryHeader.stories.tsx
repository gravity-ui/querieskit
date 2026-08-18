import React, {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {HistoryHeader} from './HistoryHeader';

const meta: Meta<typeof HistoryHeader> = {
    title: 'Modules/HistoryHeader',
    component: HistoryHeader,
    tags: ['autodocs'],
    parameters: {
        layout: 'padded',
    },
};

export default meta;
type Story = StoryObj<typeof HistoryHeader>;

const DefaultStory = () => {
    const [search, setSearch] = useState({value: '', fullSearch: false});

    return (
        <HistoryHeader
            search={search.value}
            fullSearch={search.fullSearch}
            hasClear={true}
            onUpdate={setSearch}
        />
    );
};

const FullSearchStory = () => {
    const [search, setSearch] = useState({value: 'users', fullSearch: true});

    return (
        <HistoryHeader
            search={search.value}
            fullSearch={search.fullSearch}
            hasClear={true}
            onUpdate={setSearch}
        />
    );
};

/** Empty header with a search field */
export const Default: Story = {render: () => <DefaultStory />};

/** Full-text search is active (button is highlighted) */
export const FullSearchActive: Story = {render: () => <FullSearchStory />};
