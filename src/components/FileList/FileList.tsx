import React, {useMemo} from 'react';
import {Flex, List, ListProps} from '@gravity-ui/uikit';
import {FileItem, FileItemProps} from './internal/FileItem/FileItem';
import './FileList.scss';

export type FileListProps = Omit<ListProps, 'items' | 'selectedItemIndex'> & {
    files: FileItemProps['file'][];
    className?: string;
    onDelete?: (file: FileItemProps['file']) => void;
    onEdit?: (file: FileItemProps['file']) => void;
    addedFilesIds?: string[];
    editedFilesIds?: string[];
};

export const FileList = ({
    files,
    onEdit,
    onDelete,
    addedFilesIds,
    editedFilesIds,
    className,
    ...listProps
}: FileListProps) => {
    const addedIdsSet = useMemo(() => new Set(addedFilesIds), [addedFilesIds]);
    const editedIdsSet = useMemo(() => new Set(editedFilesIds), [editedFilesIds]);

    return (
        <Flex className={className} width="100%" height="100%">
            <List<FileListProps['files'][number]>
                filterable={false}
                items={files}
                renderItem={(file) => (
                    <FileItem
                        file={file}
                        isAdded={addedIdsSet.has(file.id)}
                        isEdit={editedIdsSet.has(file.id)}
                        onEdit={onEdit}
                        onDelete={onDelete}
                    />
                )}
                {...listProps}
            />
        </Flex>
    );
};
