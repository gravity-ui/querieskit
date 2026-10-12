import React, {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {Flex, Text} from '@gravity-ui/uikit';
import {action} from 'storybook/actions';
import type {AttachItem, AttachmentsProps} from '../../../types/attachments';
import type {QueryEditorPanel} from '../../../types/queryEditor';
import type {QuerySettingsValue} from '../../../types/querySettings';
import {QueryEditor} from '../QueryEditor';

const initialAttachments: AttachItem[] = [
    {id: 'query', name: 'daily-report.sql'},
    {id: 'schema', name: 'schema.json'},
    {
        id: 'documentation',
        name: 'Query documentation',
        link: 'https://example.com/docs/query',
        token: 'documentation-token',
    },
];
const initialDeletedAttachments: AttachItem[] = [{id: 'archive', name: 'archive.csv'}];
const tokens: AttachmentsProps['tokens'] = [
    {value: 'documentation-token', title: 'Documentation token'},
    {value: 'analytics-token', title: 'Analytics token'},
];

function Example({
    empty = false,
    narrow = false,
    initialPanel = 'attachments',
    customSlot = false,
}: {
    empty?: boolean;
    narrow?: boolean;
    initialPanel?: QueryEditorPanel;
    customSlot?: boolean;
}) {
    const [query, setQuery] = useState('SELECT 1;');
    const [activePanel, setActivePanel] = useState<QueryEditorPanel>(initialPanel);
    const [panelWidth, setPanelWidth] = useState(narrow ? 240 : 360);
    const [attachments, setAttachments] = useState(initialAttachments);
    const [deletedAttachments, setDeletedAttachments] = useState(initialDeletedAttachments);
    const [settings, setSettings] = useState<QuerySettingsValue>({
        queryName: 'Daily report',
        access: 'private',
        ytOperationTitle: 'Daily report',
        tokenIds: [],
        attributes: [],
        custom: {},
    });
    let attachmentOptions:
        | {attachments?: React.ReactNode; attachmentsProps?: never}
        | {attachments?: never; attachmentsProps: AttachmentsProps} = {};
    if (customSlot) {
        attachmentOptions = {
            attachments: (
                <Flex direction="column" gap={3} spacing={{p: 4}}>
                    <Text variant="subheader-1">Application attachments</Text>
                    <Text color="secondary">
                        The application supplies this content through the attachments slot.
                    </Text>
                </Flex>
            ),
        };
    } else if (!empty) {
        attachmentOptions = {
            attachmentsProps: {
                attachments,
                deletedAttachments,
                tokens,
                onItemClick: action('attachment clicked'),
                onChange: (payload) => {
                    setAttachments(payload.attachments);
                    setDeletedAttachments(payload.deletedAttachments);
                    action('attachments changed')(payload);
                },
            },
        };
    }
    return (
        <Flex direction="column" gap={3}>
            <Text color="secondary">
                Switch between Attachments and Settings using the toolbar. Draft edits, the selected
                attachment tab, and panel width are preserved. Click the selected button to close.
            </Text>
            <div style={{height: 540, width: narrow ? 600 : '100%', maxWidth: '100%'}}>
                <QueryEditor
                    value={query}
                    onChange={setQuery}
                    clusters={[{id: 'production', title: 'Production'}]}
                    clusterId="production"
                    onClusterChange={action('cluster changed')}
                    engines={[{id: 'yql', title: 'YQL', language: 'yql'}]}
                    engineId="yql"
                    onEngineChange={action('engine changed')}
                    onRun={() => action('run')({query, settings})}
                    onFormat={action('format')}
                    onValidate={action('validate')}
                    activePanel={activePanel}
                    onActivePanelChange={(nextPanel) => {
                        setActivePanel(nextPanel);
                        action('active panel changed')(nextPanel);
                    }}
                    panelWidth={panelWidth}
                    onPanelWidthChange={setPanelWidth}
                    settingsProps={{value: settings, onChange: setSettings}}
                    {...attachmentOptions}
                />
            </div>
        </Flex>
    );
}

const meta: Meta<typeof Example> = {
    title: 'Modules/QueryEditor/Attachments',
    component: Example,
    parameters: {layout: 'padded'},
};
export default meta;
type Story = StoryObj<typeof Example>;

/** No attachments props: the empty component manages its own additions and edits. */
export const Empty: Story = {args: {empty: true}};
/** The parent applies both lists from onChange. Deleted attachments can be restored. */
export const Controlled: Story = {};
export const SwitchingPanels: Story = {args: {initialPanel: 'settings'}};
export const Narrow: Story = {args: {narrow: true}};
export const DarkAndNarrow: Story = {args: {narrow: true}, globals: {theme: 'dark'}};
export const CustomContent: Story = {args: {customSlot: true}};
