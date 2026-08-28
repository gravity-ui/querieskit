import React, {ReactNode} from 'react';
import {Button, Flex, Icon, Link, Text} from '@gravity-ui/uikit';
import {Plus} from '@gravity-ui/icons';
import cn from 'bem-cn-lite';
import image from './assets/empty-attachments.svg';
import i18n from './i18n';
import './AttachmentListPlaceholder.scss';

export type AttachmentListPlaceholderProps = {
    title?: ReactNode;
    description?: ReactNode;
    linkForDoc?: string;
    linkText?: string;
    className?: string;
    onAddFile?: () => void;
    onAddLink?: () => void;
    qa?: string;
};

const block = cn('qp-attachment-list-placeholder');

export const AttachmentListPlaceholder = ({
    title: customerTitle,
    description: customerDescription,
    linkForDoc,
    linkText: customerLinkText,
    className,
    onAddFile,
    onAddLink,
    qa,
}: AttachmentListPlaceholderProps) => {
    const title = customerTitle ?? i18n('title_no-attachments');
    const description = customerDescription ?? i18n('context_add-attachment-for-request');
    const linkText = customerLinkText ?? i18n('action_attachments-help');

    return (
        <Flex
            direction="column"
            alignItems="center"
            justifyContent="center"
            gap={5}
            width="100%"
            height="100%"
            className={block(null, className)}
            data-qa={qa}
        >
            <img src={`${image}`} alt="empty-attachments-image" />

            <Flex gap={1} direction="column" alignItems="center">
                <Text variant="subheader-1">{title}</Text>
                <Text variant="body-1">{description}</Text>
                {linkForDoc && (
                    <Link className={block('doc-link')} href={linkForDoc}>
                        {linkText}
                    </Link>
                )}
            </Flex>

            <Flex gap={2}>
                <Button onClick={onAddFile}>
                    <Icon data={Plus} />
                    {i18n('action_add-file')}
                </Button>

                <Button onClick={onAddLink} view="outlined">
                    <Icon data={Plus} />
                    {i18n('action_add-link')}
                </Button>
            </Flex>
        </Flex>
    );
};
