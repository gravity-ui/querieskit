import React, {useMemo, useState} from 'react';
import {Button, Flex, Icon, Text} from '@gravity-ui/uikit';
import {ArrowRotateLeft, Link, Pencil, TrashBin} from '@gravity-ui/icons';
import {getAttachmentIcon} from '../../helpers/getIconByAttachmentName';
import cn from 'bem-cn-lite';
import './AttachmentItem.scss';

export type AttachmentItemProps = {
    attachment: {id: string; name: string; link?: string};
    wasEdited?: boolean;
    wasAdded?: boolean;
    onEdit?: (attachment: AttachmentItemProps['attachment']) => void;
    onDelete?: (attachment: AttachmentItemProps['attachment']) => void;
    onRevert?: (attachment: AttachmentItemProps['attachment']) => void;
    isDeleted?: boolean;
};

const block = cn('qp-attachment-item');

export const AttachmentItem = ({
    attachment,
    wasAdded,
    wasEdited,
    onEdit,
    onDelete,
    onRevert,
    isDeleted,
}: AttachmentItemProps) => {
    const [isHovered, setIsHovered] = useState(false);

    const attachmentIcon = useMemo(() => {
        if (typeof attachment.link === 'string') return Link;
        return getAttachmentIcon(attachment.name);
    }, [attachment.name, attachment.link]);

    return (
        <Flex
            width="100%"
            height="32px"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
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

            {isHovered && !isDeleted && (
                <Flex gap={1} className={block('actions')}>
                    <Button size="s" view="flat" onClick={() => onEdit?.(attachment)}>
                        <Icon data={Pencil} />
                    </Button>

                    <Button size="s" view="flat" onClick={() => onDelete?.(attachment)}>
                        <Icon data={TrashBin} />
                    </Button>
                </Flex>
            )}

            {isHovered && isDeleted && (
                <Flex gap={1} className={block('actions')}>
                    <Button size="s" view="flat" onClick={() => onRevert?.(attachment)}>
                        <Icon data={ArrowRotateLeft} />
                    </Button>
                </Flex>
            )}
        </Flex>
    );
};
