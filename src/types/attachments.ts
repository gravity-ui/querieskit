import type {AttachmentListProps} from './attachmentListProps';
import type {AttachmentListPlaceholderProps} from './attachmentListPlaceholderProps';
import type {ObjectLinkValidator, Validator} from './attachmentsEditor';

export type Attachment = {id: string; name: string; link?: string};
export type AttachItem = Attachment & {token?: string};

/** Unfinished editor input, separate from committed application objects. */
export type AttachmentDraft = {mode: 'create' | 'update'; value: AttachItem};
export type AttachmentsValue<T extends AttachItem = AttachItem> = {
    attachments: T[];
    deletedAttachments: T[];
};
export type AttachmentsChange<T extends AttachItem = AttachItem> =
    | {type: 'create'; item: T}
    | {type: 'update'; item: T; previous: T}
    | {type: 'delete' | 'restore'; item: T}
    | {type: 'delete-all'; items: T[]};

type AttachmentsOptions<T extends AttachItem> = {
    tokens?: {value: string; title: string}[];
    tokenRequired?: boolean;
    placeholderProps?: Omit<AttachmentListPlaceholderProps, 'onAddFile' | 'onAddLink'>;
    attachmentListProps?: Pick<AttachmentListProps<T>, 'className'>;
    /** Controlled committed collections; omit to use local state. */
    attachments?: T[];
    defaultAttachments?: T[];
    defaultDeletedAttachments?: T[];
    /** Controlled editor drafts, including every unfinished text edit. */
    drafts?: AttachmentDraft[];
    defaultDrafts?: AttachmentDraft[];
    onDraftsChange?: (drafts: AttachmentDraft[]) => void;
    deletedAttachments?: T[];
    onItemClick?: AttachmentListProps<T>['onItemClick'];
    onChange?: (value: AttachmentsValue<T>, change: AttachmentsChange<T>) => void;
    /** The application reads/uploads the file and returns a complete saved attachment. */
    onSelectFile?: (file: File) => Promise<T>;
    nameValidator?: Validator;
    linkValidator?: ObjectLinkValidator;
    /** Exact, case-sensitive name comparison against current saved attachments. */
    validateDuplicates?: boolean;
};

/** Called only after valid Apply for a new item; preserve the supplied identity and editable values. */
export type AttachmentsProps<T extends AttachItem = AttachItem> = AttachmentsOptions<T> &
    (AttachItem extends T
        ? {createAttachment?: (draft: AttachItem) => T}
        : {createAttachment: (draft: AttachItem) => T});
