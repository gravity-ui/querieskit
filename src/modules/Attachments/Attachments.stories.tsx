import React, {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {fn} from 'storybook/test';
import {Attachments} from './Attachments';

type AttachmentsProps = React.ComponentProps<typeof Attachments>;
type Attachment = NonNullable<AttachmentsProps['attachments']>[number];

const attachments: Attachment[] = [
    {id: 'readme', name: 'README.md'},
    {id: 'query', name: 'daily-report.sql'},
    {
        id: 'documentation',
        name: 'Query documentation',
        link: 'https://example.com/docs/query',
        token: 'documentation-token',
    },
];

const attachmentsLongList: Attachment[] = [
    {id: 'readme', name: 'README.md'},
    {id: 'query', name: 'daily-report.sql'},
    {id: 'schema', name: 'schema.json'},
    {id: 'changelog', name: 'CHANGELOG.md'},
    {id: 'weekly-report', name: 'weekly-report.sql'},
    {id: 'monthly-report', name: 'monthly-report.sql'},
    {id: 'data-export', name: 'data-export.csv'},
    {id: 'users-dump', name: 'users-dump.csv'},
    {id: 'metrics', name: 'metrics.tsv'},
    {id: 'notes', name: 'notes.txt'},
    {
        id: 'documentation',
        name: 'Query documentation',
        link: 'https://example.com/docs/query',
        token: 'documentation-token',
    },
    {
        id: 'dashboard',
        name: 'Main dashboard',
        link: 'https://example.com/dashboards/main',
        token: 'dashboard-token',
    },
    {
        id: 'runbook',
        name: 'Incident runbook',
        link: 'https://example.com/docs/runbook',
        token: 'documentation-token',
    },
    {
        id: 'api-reference',
        name: 'API reference',
        link: 'https://example.com/docs/api',
        token: 'documentation-token',
    },
    {
        id: 'grafana',
        name: 'Grafana board',
        link: 'https://example.com/grafana/board',
        token: 'dashboard-token',
    },
    {
        id: 'kibana',
        name: 'Kibana logs',
        link: 'https://example.com/kibana/logs',
        token: 'dashboard-token',
    },
    {
        id: 'wiki',
        name: 'Team wiki',
        link: 'https://example.com/wiki/team',
        token: 'documentation-token',
    },
    {
        id: 'design-doc',
        name: 'Design document',
        link: 'https://example.com/docs/design',
        token: 'documentation-token',
    },
    {
        id: 'roadmap',
        name: 'Product roadmap',
        link: 'https://example.com/roadmap',
        token: 'documentation-token',
    },
    {
        id: 'analytics',
        name: 'Analytics dashboard',
        link: 'https://example.com/dashboards/analytics',
        token: 'dashboard-token',
    },
];

const deletedAttachments: Attachment[] = [
    {id: 'archive', name: 'archive.csv'},
    {
        id: 'old-dashboard',
        name: 'Old dashboard',
        link: 'https://example.com/dashboards/old',
        token: 'dashboard-token',
    },
];

const tokens: NonNullable<AttachmentsProps['tokens']> = [
    {value: 'documentation-token', title: 'Documentation token'},
    {value: 'dashboard-token', title: 'Dashboard token'},
];

const meta = {
    title: 'Modules/Attachments',
    component: Attachments,
    tags: ['autodocs'],
    parameters: {
        layout: 'padded',
    },
    decorators: [
        (Story) => (
            <div style={{height: 500, width: 322, overflow: 'hidden'}}>
                <Story />
            </div>
        ),
    ],
    args: {
        tokens,
        onChange: fn(),
    },
} satisfies Meta<typeof Attachments>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Empty state with content configured through `placeholderProps`. */
export const Default: Story = {
    args: {
        placeholderProps: {
            title: 'No attachments',
            description: 'Add files or links that should be available to the query.',
            linkForDoc: '#attachments-help',
            linkText: 'About attachments',
        },
        onItemClick: console.info,
    },
};

/** Initial files and links supplied through the uncontrolled `attachments` API. */
export const WithAttachments: Story = {
    args: {
        attachments,
        deletedAttachments: [],
        onItemClick: console.info,
    },
};

/** Current and deleted collections. Open the Deleted tab to restore an attachment. */
export const WithDeletedAttachments: Story = {
    args: {
        attachments,
        deletedAttachments,
        onItemClick: console.info,
    },
};

export const WithLongList: Story = {
    args: {
        attachments: attachmentsLongList,
        deletedAttachments: [],
        onItemClick: console.info,
    },
};

const ControlledAttachments = (props: AttachmentsProps) => {
    const [currentAttachments, setCurrentAttachments] = useState(props.attachments ?? []);
    const [currentDeletedAttachments, setCurrentDeletedAttachments] = useState(
        props.deletedAttachments ?? [],
    );

    return (
        <Attachments
            {...props}
            attachments={currentAttachments}
            deletedAttachments={currentDeletedAttachments}
            onItemClick={console.info}
            onChange={(payload) => {
                setCurrentAttachments(payload.attachments);
                setCurrentDeletedAttachments(payload.deletedAttachments);
                props.onChange?.(payload);
            }}
        />
    );
};

/** Controlled usage: every edit, delete, restore, or addition is applied from `onChange`. */
export const Controlled: Story = {
    args: {
        attachments,
        deletedAttachments,
    },
    render: (args) => <ControlledAttachments {...args} />,
};
