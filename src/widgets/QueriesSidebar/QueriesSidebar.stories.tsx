import React, {useEffect, useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {Button, Flex, Icon, SegmentedRadioGroup, Text} from '@gravity-ui/uikit';
import {Star} from '@gravity-ui/icons';
import {QueriesSidebar} from './QueriesSidebar';
import {action} from 'storybook/actions';
import {useQueriesSidebarTabs} from './QueriesSidebar.stories.data';

function Example({external = false, narrow = false, custom = false}) {
    const [activeTab, setActiveTab] = useState('history');
    const tabs = useQueriesSidebarTabs();
    if (custom) {
        tabs.unshift({
            id: 'favorites',
            type: 'custom',
            title: 'Favorites',
            icon: <Icon data={Star} />,
            renderContent: ({active}) => <Favorites active={active} />,
        });
    }
    return (
        <Flex direction="column" gap={4}>
            {external && (
                <SegmentedRadioGroup
                    value={activeTab}
                    onUpdate={setActiveTab}
                    options={tabs.map((tab) => ({value: tab.id, content: tab.id}))}
                />
            )}
            <div style={{width: narrow ? 240 : 500, height: 600}}>
                <QueriesSidebar
                    header={<Text>YQL UI</Text>}
                    tabs={tabs}
                    hideTabs={external}
                    activeTab={external ? activeTab : undefined}
                    keepMounted={false}
                    defaultActiveTab={custom ? 'favorites' : undefined}
                />
            </div>
        </Flex>
    );
}

function Favorites({active}: {active: boolean}) {
    const [count, setCount] = useState(0);
    const [ticks, setTicks] = useState(0);
    useEffect(() => {
        action('favorites.mount')();
        const timer = setInterval(() => setTicks((value) => value + 1), 1000);
        return () => {
            clearInterval(timer);
            action('favorites.cleanup')();
        };
    }, []);
    return (
        <Flex direction="column" gap={2}>
            <Text>{active ? 'Favorites' : 'Inactive'}</Text>
            <Text>Polling ticks: {ticks}</Text>
            <Button onClick={() => setCount(count + 1)}>Saved locally: {count}</Button>
        </Flex>
    );
}

const meta: Meta<typeof QueriesSidebar> = {
    title: 'Widgets/QueriesSidebar',
    component: QueriesSidebar,
    tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof QueriesSidebar>;

export const Default: Story = {render: () => <Example />};
export const ExternalNavigation: Story = {render: () => <Example external />};
export const Narrow: Story = {render: () => <Example narrow />};
export const CustomTabFirst: Story = {render: () => <Example custom />};
