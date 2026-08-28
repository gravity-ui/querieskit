import React, {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {Text} from '@gravity-ui/uikit';
import {fn} from 'storybook/test';

import {FileList, type FileListProps} from './FileList';

const files: FileListProps['files'] = [
    {id: 'readme', name: 'README'},
    {id: 'javascript', name: 'index.js'},
    {id: 'python', name: 'main.py'},
    {id: 'csv', name: 'sales.csv'},
    {id: 'excel', name: 'forecast.xlsx'},
    {id: 'cpp', name: 'processor.cpp'},
    {id: 'ql', name: 'analytics.ql'},
    {id: 'yql', name: 'events.yql'},
    {id: 'sql', name: 'report.sql'},
];

const meta = {
    title: 'Components/FileList',
    component: FileList,
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
        files,
        onDelete: fn(),
        onEdit: fn(),
    },
} satisfies Meta<typeof FileList>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Files with all supported extensions use their corresponding icons. Row actions appear on hover. */
export const Default: Story = {};

/** `addedFilesIds` and `editedFilesIds` highlight files with their current change state. */
export const ChangeStates: Story = {
    args: {
        addedFilesIds: ['javascript', 'csv'],
        editedFilesIds: ['python', 'sql'],
    },
};

/** The inherited List filtering API can be enabled when a consumer needs local file search. */
export const Filterable: Story = {
    args: {
        filterable: true,
        filterPlaceholder: 'Filter by file name',
        filterItem: (filter) => (file) =>
            (file as FileListProps['files'][number]).name
                .toLocaleLowerCase()
                .includes(filter.toLocaleLowerCase()),
        itemsHeight: 280,
    },
};

const InteractiveFileList = (props: FileListProps) => {
    const [currentFiles, setCurrentFiles] = useState(props.files);
    const [editedFilesIds, setEditedFilesIds] = useState<string[]>([]);

    return (
        <FileList
            {...props}
            files={currentFiles}
            editedFilesIds={editedFilesIds}
            onDelete={(file) => {
                props.onDelete?.(file);
                setCurrentFiles((current) => current.filter((item) => item.id !== file.id));
                setEditedFilesIds((current) => current.filter((id) => id !== file.id));
            }}
            onEdit={(file) => {
                props.onEdit?.(file);
                setEditedFilesIds((current) =>
                    current.includes(file.id)
                        ? current.filter((id) => id !== file.id)
                        : [...current, file.id],
                );
            }}
        />
    );
};

/** Hover a row: edit toggles its edited state and delete removes it from the list. */
export const InteractiveActions: Story = {
    render: (args) => <InteractiveFileList {...args} />,
};

const SortableFileList = (props: FileListProps) => {
    const [orderedFiles, setOrderedFiles] = useState(props.files);

    return (
        <FileList
            {...props}
            files={orderedFiles}
            onSortEnd={({oldIndex, newIndex}) => {
                props.onSortEnd?.({oldIndex, newIndex});
                setOrderedFiles((current) => {
                    const next = [...current];
                    const [movedFile] = next.splice(oldIndex, 1);

                    if (movedFile) {
                        next.splice(newIndex, 0, movedFile);
                    }

                    return next;
                });
            }}
        />
    );
};

/** Drag files by the handle to reorder them using the inherited List sorting API. */
export const Sortable: Story = {
    args: {
        sortable: true,
        sortHandleAlign: 'left',
        onSortEnd: fn(),
    },
    render: (args) => <SortableFileList {...args} />,
};

/** Consumer-provided content is displayed when the file array is empty. */
export const Empty: Story = {
    args: {
        files: [],
        emptyPlaceholder: <Text color="secondary">No files yet</Text>,
    },
};

/** The inherited loading state can be used while the file collection is being fetched. */
export const Loading: Story = {
    args: {
        files: [],
        loading: true,
    },
};
