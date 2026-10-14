import React, {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {useArgs} from 'storybook/preview-api';
import {Button, Flex, Text} from '@gravity-ui/uikit';
import type {QueryEditorPanel} from '../../../types/queryEditor';
import {QueryEditorExample} from './QueryEditorExample';
import type {QueryEditorExampleProps} from './QueryEditorExample';
import {QueryEditorTabsExample} from './QueryEditorTabsExample';

const meta = {
    title: 'Widgets/QueryEditor',
    component: QueryEditorExample,
    tags: ['autodocs'],
    parameters: {
        layout: 'padded',
        controls: {include: ['readOnly', 'activePanel', 'panelWidth']},
        docs: {
            description: {
                component:
                    'An interactive editor with local settings, parameters, attachments and sharing. Run logs the full request to Actions; formatting and validation are demonstrations.',
            },
        },
    },
    argTypes: {
        readOnly: {control: 'boolean'},
        activePanel: {
            control: 'select',
            options: [undefined, null, 'settings', 'parameters', 'attachments'],
            description:
                'Leave undefined for toolbar-managed panels; a selected value controls the panel externally.',
        },
        panelWidth: {control: {type: 'number', min: 240, step: 16}},
    },
    args: {readOnly: false},
    render: function Render(args) {
        const [, updateArgs] = useArgs<QueryEditorExampleProps>();
        return (
            <QueryEditorExample
                {...args}
                onActivePanelChange={(activePanel) => {
                    if (args.activePanel !== undefined) updateArgs({activePanel});
                }}
                onPanelWidthChange={(panelWidth) => {
                    if (args.panelWidth !== undefined) updateArgs({panelWidth});
                }}
            />
        );
    },
} satisfies Meta<typeof QueryEditorExample>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

function ControlledSplitViewExample(props: QueryEditorExampleProps) {
    const [activePanel, setActivePanel] = useState<QueryEditorPanel>('settings');
    const [width, setWidth] = useState(360);
    return (
        <Flex direction="column" gap={3}>
            <Flex gap={3} alignItems="center">
                <Button
                    onClick={() => setActivePanel(activePanel === 'settings' ? null : 'settings')}
                >
                    Toggle side panel externally
                </Button>
                <Button onClick={() => setWidth(360)}>Reset width</Button>
                <Text>Preferred width: {Math.round(width)} px</Text>
            </Flex>
            <QueryEditorExample
                {...props}
                activePanel={activePanel}
                panelWidth={width}
                onActivePanelChange={setActivePanel}
                onPanelWidthChange={setWidth}
            />
        </Flex>
    );
}

export const ControlledSplitView: Story = {
    render: (args) => <ControlledSplitViewExample {...args} />,
    parameters: {controls: {include: ['readOnly']}},
};
export const NarrowWithLongTitles: Story = {
    args: {width: 440, longTitles: true, defaultActivePanel: 'settings'},
};
export const EmptyOptions: Story = {args: {emptyOptions: true}};
export const ActionStates: Story = {
    args: {
        actionStates: {run: {loading: true}, format: {disabled: true}, validate: {disabled: true}},
    },
};
export const WithQueryTabs: Story = {
    render: () => <QueryEditorTabsExample />,
    parameters: {controls: {disable: true}},
};
export const CustomPanels: Story = {
    args: {customPanels: true, defaultActivePanel: 'settings'},
    parameters: {
        docs: {
            description: {
                story: 'All three side panels accept application-owned content instead of the built-in forms. Edits survive closing and switching panels.',
            },
        },
    },
};
