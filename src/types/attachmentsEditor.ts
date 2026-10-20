import type {Attachment} from './attachments';

export type AttachmentItemProps<T extends Attachment = Attachment> = {
    attachment: T;
    wasEdited?: boolean;
    wasAdded?: boolean;
    onEdit?: (attachment: T) => void;
    onDelete?: (attachment: T) => void;
    onRevert?: (attachment: T) => void;
    isDeleted?: boolean;
};

export type EditLinkValues = {
    link: string;
    token: string;
    name: string;
};

export type EditLinkItemProps = {
    linkLabel?: string;
    tokenLabel?: string;
    tokenRequired?: boolean;
    nameLabel?: string;
    onAccept?: (values: EditLinkValues) => void;
    onCancel?: () => void;
    onChange?: (pathedValues: EditLinkValues) => void;
    tokens?: {value: string; title: string}[];
    values?: EditLinkValues;
    defaultValues?: EditLinkValues;
    validator?: ObjectLinkValidator;
};

export type EditFileItemProps = {
    fileName?: string;
    fileLabel?: string;
    defaultFileName?: string;
    onChangeFileName?: (fileName: string) => void;
    onAccept?: (newFileName: string) => void;
    onCancel?: () => void;
    validator?: Validator;
};

export type EditAttachmentItemProps =
    | (EditFileItemProps & {
          type: 'file';
      })
    | (EditLinkItemProps & {
          type: 'link';
      });

export type EditLinkErrors = Partial<{
    link: string;
    token: string;
    name: string;
}>;

export type ObjectLinkValidator = (
    values: Record<string, unknown>,
    isTokenRequired?: boolean,
) => EditLinkErrors | null;

export type Validator = (value: unknown) => string | null;
