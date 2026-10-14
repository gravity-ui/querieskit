import React, {useRef, useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {Button, DropdownMenu, Flex, Icon} from '@gravity-ui/uikit';
import {Ellipsis, Gear, LayoutColumns} from '@gravity-ui/icons';
import {action} from 'storybook/actions';
import type {QueryTabItem} from '../../types/queryTabs';
import {QueryTabs} from './QueryTabs';

const ITEMS: QueryTabItem[] = [
    {id: 'draft', title: 'New query', type: 'query', status: 'draft'},
    {
        id: 'modified',
        title: 'Modified query',
        type: 'query',
        status: 'completed',
        isModified: true,
    },
    {id: 'running', title: 'Running query', type: 'query', status: 'running'},
    {id: 'completed', title: 'Successful query', type: 'query', status: 'completed'},
    {id: 'failed', title: 'Failed query', type: 'query', status: 'failed'},
    {id: 'aborted', title: 'Aborted query', type: 'query', status: 'aborted'},
    {
        id: 'comparison',
        leftTitle: 'Baseline query',
        rightTitle: 'Updated query',
        type: 'comparison',
    },
];

const meta: Meta<typeof QueryTabs> = {
    title: 'Modules/QueryTabs',
    component: QueryTabs,
    tags: ['autodocs'],
    parameters: {layout: 'padded'},
};

export default meta;
type Story = StoryObj<typeof QueryTabs>;

function InteractiveTabs({
    initialItems = ITEMS,
    width = '100%',
    hideCloseOnLastTab = false,
}: {
    initialItems?: QueryTabItem[];
    width?: number | string;
    hideCloseOnLastTab?: boolean;
}) {
    const [items, setItems] = useState(initialItems);
    const [activeTab, setActiveTab] = useState<string | undefined>(initialItems[0]?.id);
    const nextId = useRef(1);

    const handleAddTab = () => {
        const number = nextId.current++;
        const item: QueryTabItem = {
            id: `new-${number}`,
            title: `New query ${number}`,
            type: 'query',
            status: 'draft',
        };
        action('onAddTab')();
        setItems([...items, item]);
        setActiveTab(item.id);
    };

    const handleCloseTab = (id: string) => {
        action('onCloseTab')(id);
        const index = items.findIndex((item) => item.id === id);
        if (index === -1) return;

        setItems(items.filter((item) => item.id !== id));
        if (activeTab === id) {
            setActiveTab(items[index + 1]?.id ?? items[index - 1]?.id);
        }
    };

    return (
        <div style={{width, maxWidth: '100%'}}>
            <QueryTabs
                items={items}
                activeTab={activeTab}
                onActiveTabChange={(id) => {
                    action('onActiveTabChange')(id);
                    setActiveTab(id);
                }}
                onAddTab={handleAddTab}
                onCloseTab={handleCloseTab}
                hideCloseOnLastTab={hideCloseOnLastTab}
                actions={
                    <Flex alignItems="center" gap={0.5}>
                        <Button
                            view="flat-secondary"
                            size="m"
                            title="Settings"
                            aria-label="Settings"
                            onClick={action('onSettingsClick')}
                        >
                            <Icon data={Gear} size={16} />
                        </Button>
                        <Button
                            view="flat-secondary"
                            size="m"
                            title="Toggle panel"
                            aria-label="Toggle panel"
                            onClick={action('onTogglePanel')}
                        >
                            <Icon data={LayoutColumns} size={16} />
                        </Button>
                        <DropdownMenu
                            renderSwitcher={(props) => (
                                <Button
                                    {...props}
                                    view="flat-secondary"
                                    size="m"
                                    title="More actions"
                                    aria-label="More actions"
                                >
                                    <Icon data={Ellipsis} size={16} />
                                </Button>
                            )}
                            items={[
                                {text: 'Keyboard shortcuts', action: action('onKeyboardShortcuts')},
                                {text: 'Help', action: action('onHelp')},
                            ]}
                        />
                    </Flex>
                }
            />
        </div>
    );
}

export const Default: Story = {render: () => <InteractiveTabs />};

export const Overflow: Story = {
    render: () => (
        <InteractiveTabs
            width={480}
            initialItems={ITEMS.map((item) =>
                item.type === 'query'
                    ? {
                          ...item,
                          title: `${item.title}: a long title for a query across multiple data sources`,
                      }
                    : {
                          ...item,
                          leftTitle:
                              'Baseline query across multiple data sources with a long title',
                          rightTitle:
                              'Updated query across multiple data sources with a long title',
                      },
            )}
        />
    ),
};

export const Empty: Story = {render: () => <InteractiveTabs initialItems={[]} />};

export const HideCloseOnLastTab: Story = {
    render: () => (
        <InteractiveTabs
            hideCloseOnLastTab
            initialItems={[
                {
                    id: 'modified',
                    type: 'query',
                    title: 'New Query',
                    status: 'draft',
                    isModified: true,
                },
            ]}
        />
    ),
};

export const Comparison: Story = {
    render: () => (
        <InteractiveTabs
            initialItems={[
                {
                    id: 'comparison',
                    type: 'comparison',
                    leftTitle: 'New Query',
                    rightTitle: 'New Query',
                },
                {id: 'draft', type: 'query', title: 'New Query', status: 'draft'},
            ]}
        />
    ),
};

export const Modified: Story = {
    render: () => (
        <InteractiveTabs
            initialItems={[
                {
                    id: 'modified',
                    type: 'query',
                    title: 'New Query',
                    status: 'draft',
                    isModified: true,
                },
                {id: 'draft', type: 'query', title: 'New Query', status: 'draft'},
            ]}
        />
    ),
};
