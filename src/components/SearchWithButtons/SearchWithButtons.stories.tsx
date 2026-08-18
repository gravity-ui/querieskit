import React, {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {Button, Icon} from '@gravity-ui/uikit';
import ChevronsExpandHorizontalIcon from '@gravity-ui/icons/svgs/chevrons-expand-horizontal.svg';
import FunnelIcon from '@gravity-ui/icons/svgs/funnel.svg';
import GearIcon from '@gravity-ui/icons/svgs/gear.svg';
import {SearchWithButtons} from './SearchWithButtons';

const meta: Meta<typeof SearchWithButtons> = {
    title: 'Components/SearchWithButtons',
    component: SearchWithButtons,
    tags: ['autodocs'],
    parameters: {
        layout: 'padded',
    },
};

export default meta;
type Story = StoryObj<typeof SearchWithButtons>;

const PlainStory = () => {
    const [value, setValue] = useState('');

    return (
        <SearchWithButtons value={value} placeholder="Search" hasClear={true} onUpdate={setValue} />
    );
};

const WithInnerButtonStory = () => {
    const [value, setValue] = useState('');
    const [active, setActive] = useState(false);

    return (
        <SearchWithButtons
            value={value}
            placeholder="Search"
            hasClear={true}
            onUpdate={setValue}
            innerButtons={[
                <Button
                    key="full-search"
                    size="xs"
                    view={active ? 'action' : undefined}
                    onClick={() => setActive(!active)}
                >
                    <Icon data={ChevronsExpandHorizontalIcon} size={12} />
                </Button>,
            ]}
        />
    );
};

const WithEndButtonsStory = () => {
    const [value, setValue] = useState('');

    return (
        <SearchWithButtons
            value={value}
            placeholder="Search"
            hasClear={true}
            onUpdate={setValue}
            endButtons={[
                <Button key="filter">
                    <Icon data={FunnelIcon} size={16} />
                </Button>,
                <Button key="settings">
                    <Icon data={GearIcon} size={16} />
                </Button>,
            ]}
        />
    );
};

const WithBothSlotsStory = () => {
    const [value, setValue] = useState('');

    return (
        <SearchWithButtons
            value={value}
            placeholder="Search"
            hasClear={true}
            onUpdate={setValue}
            innerButtons={[
                <Button key="full-search" size="xs">
                    <Icon data={ChevronsExpandHorizontalIcon} size={12} />
                </Button>,
            ]}
            endButtons={[
                <Button key="filter">
                    <Icon data={FunnelIcon} size={16} />
                </Button>,
            ]}
        />
    );
};

/** Just the search input, without any buttons */
export const Default: Story = {render: () => <PlainStory />};

/** A toggle button rendered inside the input */
export const WithInnerButton: Story = {render: () => <WithInnerButtonStory />};

/** Several buttons rendered after the input */
export const WithEndButtons: Story = {render: () => <WithEndButtonsStory />};

/** Both slots are filled at the same time */
export const WithBothSlots: Story = {render: () => <WithBothSlotsStory />};
