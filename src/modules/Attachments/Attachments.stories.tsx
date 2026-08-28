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
            <div style={{height: 620, width: 322}}>
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
    },
};

/** Initial files and links supplied through the uncontrolled `attachments` API. */
export const WithAttachments: Story = {
    args: {
        attachments,
    },
};

/** Current and deleted collections. Open the Deleted tab to restore an attachment. */
export const WithDeletedAttachments: Story = {
    args: {
        attachments,
        deletedAttachments,
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
