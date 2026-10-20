import type {AttachmentItemProps} from '../../../../types/attachmentsEditor';
import React, {useMemo} from 'react';
import {Button, Flex, Icon, Text} from '@gravity-ui/uikit';
import {ArrowRotateLeft, Link, Pencil, TrashBin} from '@gravity-ui/icons';
import {getAttachmentIcon} from '../../helpers/getIconByAttachmentName';
import cn from 'bem-cn-lite';
import './AttachmentItem.scss';
import type {Attachment} from '../../../../types/attachments';
import i18n from '../../i18n';

const block = cn('qp-attachment-item');

export const AttachmentItem = <T extends Attachment>({
    attachment,
    wasAdded,
    wasEdited,
    onEdit,
    onDelete,
    onRevert,
    isDeleted,
}: AttachmentItemProps<T>) => {
    const attachmentIcon = useMemo(() => {
        if (typeof attachment.link === 'string') return Link;
        return getAttachmentIcon(attachment.name);
    }, [attachment.name, attachment.link]);

    return (
        <Flex
            width="100%"
            height="32px"
            alignItems="center"
            justifyContent="space-between"
            spacing={{px: 4}}
            className={block({wasEdited, wasAdded})}
        >
            <Flex gap={2} alignItems="center" className={block('info')}>
                <Icon width={16} className={block('attachment-icon')} data={attachmentIcon} />
                <Text variant="body-1" ellipsis className={block('attachment-name')}>
                    {attachment.name}
                </Text>
            </Flex>

            {!isDeleted && (
                <Flex gap={1} className={block('actions')}>
                    <Button
                        aria-label={i18n('action_edit')}
                        size="s"
                        view="flat"
                        onClick={(event) => {
                            event.stopPropagation();
                            onEdit?.(attachment);
                        }}
                    >
                        <Icon data={Pencil} />
                    </Button>

                    <Button
                        aria-label={i18n('action_delete')}
                        size="s"
                        view="flat"
                        onClick={(event) => {
                            event.stopPropagation();
                            onDelete?.(attachment);
                        }}
                    >
                        <Icon data={TrashBin} />
                    </Button>
                </Flex>
            )}

            {isDeleted && (
                <Flex gap={1} className={block('actions')}>
                    <Button
                        aria-label={i18n('action_restore')}
                        size="s"
                        view="flat"
                        onClick={(event) => {
                            event.stopPropagation();
                            onRevert?.(attachment);
                        }}
                    >
                        <Icon data={ArrowRotateLeft} />
                    </Button>
                </Flex>
            )}
        </Flex>
    );
};
