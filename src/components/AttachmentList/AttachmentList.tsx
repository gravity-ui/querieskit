import {Flex, List} from '@gravity-ui/uikit';
import React, {useMemo} from 'react';
import type {AttachmentListProps} from '../../types/attachmentListProps';
import './AttachmentList.scss';
import {isInteractiveTarget} from './helpers/isInteractiveTarget';
import {AttachmentItem} from './internal/AttachmentItem/AttachmentItem';
export type {AttachmentListProps} from '../../types/attachmentListProps';

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
        <Flex className={className} width="100%" height="100%" overflow="auto">
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
