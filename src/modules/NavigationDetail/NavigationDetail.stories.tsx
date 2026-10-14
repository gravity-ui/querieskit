import React from 'react';
import {Button, Flex, Text} from '@gravity-ui/uikit';
import type {Meta, StoryObj} from '@storybook/react';
import type {NavigationDetailTab} from '../../types/navigation';
import {NavigationDetail} from './NavigationDetail';

const meta: Meta<typeof NavigationDetail> = {
    title: 'Modules/NavigationDetail',
    component: NavigationDetail,
    parameters: {layout: 'padded'},
};
export default meta;
type Story = StoryObj<typeof NavigationDetail>;

const tabs: NavigationDetailTab[] = [
    {id: 'schema', title: 'Schema', content: 'Schema content'},
    {id: 'preview', title: 'Preview', content: 'Preview content'},
];

export const Default: Story = {
    args: {
        config: {tabs},
        location: {cluster: 'demo', path: '//home/demo'},
        onUpdate: () => {},
    },
};

function DynamicTabsExample() {
    const [currentTabs, setCurrentTabs] = React.useState<NavigationDetailTab[]>([]);
    const [selection, setSelection] = React.useState('No user selection');
    return (
        <Flex direction="column" gap={3}>
            <Flex gap={2} wrap="wrap">
                <Button onClick={() => setCurrentTabs(tabs)}>Load tabs</Button>
                <Button onClick={() => setCurrentTabs([tabs[0], {...tabs[1], hidden: true}])}>
                    Hide preview
                </Button>
                <Button onClick={() => setCurrentTabs([tabs[1]])}>Remove schema</Button>
                <Button
                    onClick={() => setCurrentTabs(tabs.map((tab) => ({...tab, disabled: true})))}
                >
                    Disable all
                </Button>
            </Flex>
            <NavigationDetail
                config={{
                    tabs: currentTabs,
                    defaultTab: 'preview',
                    emptyContent: 'No available tabs',
                }}
                location={{cluster: 'demo', path: '//home/demo'}}
                onUpdate={() => {}}
                onTabUpdate={setSelection}
            />
            <Text>User selection: {selection}</Text>
        </Flex>
    );
}

/** Simulates loaded, hidden, removed and disabled tabs without remounting the detail. */
export const DynamicTabs: Story = {render: () => <DynamicTabsExample />};
