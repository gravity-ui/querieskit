import React, {ReactNode, useMemo} from 'react';
import {Flex, List, ListProps} from '@gravity-ui/uikit';
import {AttachmentItem, AttachmentItemProps} from './internal/AttachmentItem/AttachmentItem';
import './AttachmentList.scss';

export type AttachmentListProps = Omit<ListProps, 'items' | 'selectedItemIndex' | 'virtialized'> & {
    attachments: AttachmentItemProps['attachment'][];
    className?: string;
    onDelete?: (attachment: AttachmentItemProps['attachment']) => void;
    onEdit?: (attachment: AttachmentItemProps['attachment']) => void;
    onRevert?: (attachment: AttachmentItemProps['attachment']) => void;

    renderEditForm?: (attachment: AttachmentItemProps['attachment']) => ReactNode;

    wasAddedIds?: string[];
    wasEditedIds?: string[];

    editingIds?: string[];

    isDeleted?: boolean;
};

export const AttachmentList = ({
    attachments,
    onEdit,
    onDelete,
    onRevert,
    wasAddedIds,
    wasEditedIds,
    editingIds,
    renderEditForm,
    className,
    isDeleted,
    ...listProps
}: AttachmentListProps) => {
    const addedIdsSet = useMemo(() => new Set(wasAddedIds), [wasAddedIds]);
    const editedIdsSet = useMemo(() => new Set(wasEditedIds), [wasEditedIds]);
    const editingIdsSet = useMemo(() => new Set(editingIds), [editingIds]);

    return (
        <Flex className={className} width="100%" height="100%">
            <List<AttachmentListProps['attachments'][number]>
                filterable={false}
                virtualized={false}
                items={attachments}
                renderItem={(attachment) => {
                    if (editingIdsSet.has(attachment.id)) {
                        return renderEditForm?.(attachment);
                    }

                    return (
                        <AttachmentItem
                            attachment={attachment}
                            wasAdded={addedIdsSet.has(attachment.id)}
                            wasEdited={editedIdsSet.has(attachment.id)}
                            onEdit={onEdit}
                            onRevert={onRevert}
                            onDelete={onDelete}
                            isDeleted={isDeleted}
                        />
                    );
                }}
                {...listProps}
            />
        </Flex>
    );
};
