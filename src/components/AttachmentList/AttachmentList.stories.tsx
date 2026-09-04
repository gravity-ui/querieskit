import React, {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {Text} from '@gravity-ui/uikit';
import {EditAttachmentItem, EditLinkValues} from './internal/EditAttachmentItem';
import {fn} from 'storybook/test';

import {AttachmentList, type AttachmentListProps} from './AttachmentList';

const attachments: AttachmentListProps['attachments'] = [
    {id: 'readme', name: 'README'},
    {id: 'javascript', name: 'index.js'},
    {id: 'python', name: 'main.py'},
    {id: 'csv', name: 'sales.csv'},
    {id: 'link-image', name: 'https://home/tutorial', link: 'https://home/tutorial'},
    {id: 'excel', name: 'forecast.xlsx'},
    {id: 'cpp', name: 'processor.cpp'},
    {id: 'ql', name: 'analytics.ql'},
    {id: 'yql', name: 'events.yql'},
    {id: 'sql', name: 'report.sql'},
    {id: 'link', name: 'link to file.cpp', link: 'link/to/file.cpp'},
];

const meta = {
    title: 'Components/AttachmentList',
    component: AttachmentList,
    tags: ['autodocs'],
    parameters: {
        layout: 'padded',
    },
    decorators: [
        (Story) => (
            <div style={{width: 360, height: 360}}>
                <Story />
            </div>
        ),
    ],
    args: {
        attachments,
        onDelete: fn(),
        onEdit: fn(),
    },
} satisfies Meta<typeof AttachmentList>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Attachments with supported extensions use their corresponding icons. Row actions appear on hover. */
export const Default: Story = {};

/** `wasAddedIds` and `wasEditedIds` highlight attachments with their current change state. */
export const ChangeStates: Story = {
    args: {
        wasAddedIds: ['javascript', 'csv'],
        wasEditedIds: ['python', 'sql'],
    },
};

/** The inherited List filtering API can be enabled when a consumer needs local attachment search. */
export const Filterable: Story = {
    args: {
        filterable: true,
        filterPlaceholder: 'Filter by attachment name',
        filterItem: (filter) => (attachment) =>
            (attachment as AttachmentListProps['attachments'][number]).name
                .toLocaleLowerCase()
                .includes(filter.toLocaleLowerCase()),
    },
};

const InteractiveAttachmentList = (props: AttachmentListProps) => {
    const [currentAttachments, setCurrentAttachments] = useState(props.attachments);
    const [editedIds, setEditedIds] = useState<string[]>([]);

    return (
        <AttachmentList
            {...props}
            attachments={currentAttachments}
            wasEditedIds={editedIds}
            onDelete={(attachment) => {
                props.onDelete?.(attachment);
                setCurrentAttachments((current) =>
                    current.filter((item) => item.id !== attachment.id),
                );
                setEditedIds((current) => current.filter((id) => id !== attachment.id));
            }}
            onEdit={(attachment) => {
                props.onEdit?.(attachment);
                setEditedIds((current) =>
                    current.includes(attachment.id)
                        ? current.filter((id) => id !== attachment.id)
                        : [...current, attachment.id],
                );
            }}
        />
    );
};

/** Hover a row: edit toggles its edited state and delete removes it from the list. */
export const InteractiveActions: Story = {
    render: (args) => <InteractiveAttachmentList {...args} />,
};

const EditableAttachmentList = (props: AttachmentListProps) => {
    const [currentAttachments, setCurrentAttachments] = useState(props.attachments);
    const [editingId, setEditingId] = useState<string>();
    const [draftName, setDraftName] = useState('');
    const [draftLink, setDraftLink] = useState<EditLinkValues>({
        link: '',
        token: '',
        name: '',
    });

    const handleAcceptDraft = () => {
        setCurrentAttachments((prevState) => {
            return prevState.map((attach) => {
                if (attach.id === editingId && attach.link === undefined) {
                    return {
                        ...attach,
                        name: draftName,
                    };
                }
                if (attach.id === editingId && typeof attach.link === 'string') {
                    return {
                        ...attach,
                        name: draftLink.name,
                        link: draftLink.link,
                    };
                }
                return attach;
            });
        });
        setDraftName('');
        setEditingId('');
    };

    return (
        <AttachmentList
            {...props}
            attachments={currentAttachments}
            editingIds={editingId ? [editingId] : []}
            onDelete={(attach) =>
                setCurrentAttachments((list) => list.filter((l) => l.id !== attach.id))
            }
            onEdit={(attachment) => {
                props.onEdit?.(attachment);
                setEditingId(attachment.id);
                setDraftName(attachment.name);
                if (typeof attachment.link === 'string') {
                    setDraftLink({...draftLink, name: attachment.name, link: attachment.link});
                }
            }}
            renderEditForm={(attachment) => {
                const isLink = typeof attachment.link === 'string';

                if (isLink) {
                    return (
                        <EditAttachmentItem
                            onCancel={() => setEditingId('')}
                            onAccept={handleAcceptDraft}
                            values={draftLink}
                            onChange={setDraftLink}
                            tokens={[
                                {value: 'default_database_logs', title: 'default_database_logs'},
                                {value: 'default_yt', title: 'default_yt'},
                                {value: 'default_yql', title: 'default_yql'},
                                {
                                    value: 'default_long_token_title',
                                    title: 'default_long_token_title',
                                },
                            ]}
                            type={'link'}
                        />
                    );
                }

                return (
                    <EditAttachmentItem
                        fileName={draftName}
                        onChangeFileName={setDraftName}
                        onCancel={() => setEditingId('')}
                        onAccept={handleAcceptDraft}
                        type={'file'}
                    />
                );
            }}
        />
    );
};

/** Hover a row and click edit to replace it with a consumer-provided rename form. */
export const CustomEditForm: Story = {
    render: (args) => <EditableAttachmentList {...args} />,
};

const SortableAttachmentList = (props: AttachmentListProps) => {
    const [orderedAttachments, setOrderedAttachments] = useState(props.attachments);

    return (
        <AttachmentList
            {...props}
            attachments={orderedAttachments}
            onSortEnd={({oldIndex, newIndex}) => {
                props.onSortEnd?.({oldIndex, newIndex});
                setOrderedAttachments((current) => {
                    const next = [...current];
                    const [movedAttachment] = next.splice(oldIndex, 1);

                    if (movedAttachment) {
                        next.splice(newIndex, 0, movedAttachment);
                    }

                    return next;
                });
            }}
        />
    );
};

/** Drag attachments by the handle to reorder them using the inherited List sorting API. */
export const Sortable: Story = {
    args: {
        sortable: true,
        sortHandleAlign: 'left',
        onSortEnd: fn(),
    },
    render: (args) => <SortableAttachmentList {...args} />,
};

/** Consumer-provided content is displayed when the attachment array is empty. */
export const Empty: Story = {
    args: {
        attachments: [],
        emptyPlaceholder: <Text color="secondary">No attachments yet</Text>,
    },
};

/** The inherited loading state can be used while the attachment collection is being fetched. */
export const Loading: Story = {
    args: {
        attachments: [],
        loading: true,
    },
};
