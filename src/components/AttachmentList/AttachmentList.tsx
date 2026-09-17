import React, {ReactNode, useMemo} from 'react';
import {Flex, List, ListProps} from '@gravity-ui/uikit';
import {AttachmentItem, AttachmentItemProps} from './internal/AttachmentItem/AttachmentItem';
import {isInteractiveTarget} from './helpers/isInteractiveTarget';
import './AttachmentList.scss';

export type AttachmentListProps = Omit<
    ListProps<AttachmentItemProps['attachment']>,
    'items' | 'selectedItemIndex' | 'virtualized'
> & {
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
    onItemClick,
    ...listProps
}: AttachmentListProps) => {
    const addedIdsSet = useMemo(() => new Set(wasAddedIds), [wasAddedIds]);
    const editedIdsSet = useMemo(() => new Set(wasEditedIds), [wasEditedIds]);
    const editingIdsSet = useMemo(() => new Set(editingIds), [editingIds]);

    const handleItemClick: AttachmentListProps['onItemClick'] = (
        item,
        index,
        fromKeyboard,
        event,
    ) => {
        if (editingIdsSet.has(item.id)) return;
        if (isInteractiveTarget(event?.target)) return;
        onItemClick?.(item, index, fromKeyboard, event);
    };

    return (
        <Flex className={className} width="100%" height="100%">
            <List<AttachmentListProps['attachments'][number]>
                filterable={false}
                virtualized={false}
                items={attachments}
                onItemClick={handleItemClick}
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
