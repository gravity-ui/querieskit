import type {AttachmentListProps} from './attachmentListProps';
import type {AttachmentListPlaceholderProps} from './attachmentListPlaceholderProps';

export type Attachment = {id: string; name: string; link?: string};

export type AttachItem = Attachment & {token?: string; isNew?: boolean};

export type AttachmentsProps = {
    tokens?: {value: string; title: string}[];
    placeholderProps?: Omit<AttachmentListPlaceholderProps, 'onAddFile' | 'onAddLink'>;
    attachmentListProps?: Pick<AttachmentListProps, 'className'>;
    attachments?: AttachItem[];
    deletedAttachments?: AttachItem[];
    onItemClick?: AttachmentListProps<AttachItem>['onItemClick'];
    onChange?: (payload: {attachments: AttachItem[]; deletedAttachments: AttachItem[]}) => void;
};
