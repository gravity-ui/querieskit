import type {AttachmentItemProps, AttachmentListProps} from '../components/AttachmentList';
import type {AttachmentListPlaceholderProps} from '../components/AttachmentListPlaceholder';

export type AttachItem = AttachmentItemProps['attachment'] & {token?: string; isNew?: boolean};

export type AttachmentsProps = {
    tokens?: {value: string; title: string}[];
    placeholderProps?: Omit<AttachmentListPlaceholderProps, 'onAddFile' | 'onAddLink'>;
    attachmentListProps?: Pick<AttachmentListProps, 'className'>;
    attachments?: AttachItem[];
    deletedAttachments?: AttachItem[];
    onItemClick?: AttachmentListProps<AttachItem>['onItemClick'];
    onChange?: (payload: {attachments: AttachItem[]; deletedAttachments: AttachItem[]}) => void;
};
