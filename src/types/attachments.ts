import type {AttachmentListProps} from './attachmentListProps';
import type {AttachmentListPlaceholderProps} from './attachmentListPlaceholderProps';
import type {ObjectLinkValidator, Validator} from './attachmentsEditor';

export type Attachment = {id: string; name: string; link?: string};
export type AttachItem = Attachment & {token?: string; isNew?: boolean};

type AttachmentsOptions<T extends AttachItem> = {
    tokens?: {value: string; title: string}[];
    tokenRequired?: boolean;
    placeholderProps?: Omit<AttachmentListPlaceholderProps, 'onAddFile' | 'onAddLink'>;
    attachmentListProps?: Pick<AttachmentListProps<T>, 'className'>;
    attachments?: T[];
    deletedAttachments?: T[];
    onItemClick?: AttachmentListProps<T>['onItemClick'];
    onChange?: (payload: {attachments: T[]; deletedAttachments: T[]}) => void;
    /** The application reads/uploads the file and returns a complete saved attachment. */
    onSelectFile?: (file: File) => Promise<T>;
    nameValidator?: Validator;
    linkValidator?: ObjectLinkValidator;
    /** Exact, case-sensitive name comparison against current saved attachments. */
    validateDuplicates?: boolean;
};

/** Extended models must provide a factory for their required application fields. */
export type AttachmentsProps<T extends AttachItem = AttachItem> = AttachmentsOptions<T> &
    (AttachItem extends T
        ? {createAttachment?: (draft: AttachItem) => T}
        : {createAttachment: (draft: AttachItem) => T});
