import type {ListProps} from '@gravity-ui/uikit';
import type {ReactNode} from 'react';
import type {Attachment} from './attachments';

export type AttachmentListProps<T extends Attachment = Attachment> = Omit<
    ListProps<T>,
    'items' | 'selectedItemIndex' | 'virtualized'
> & {
    attachments: Attachment[];
    className?: string;
    onDelete?: (attachment: Attachment) => void;
    onEdit?: (attachment: Attachment) => void;
    onRevert?: (attachment: Attachment) => void;

    renderEditForm?: (attachment: Attachment) => ReactNode;

    wasAddedIds?: string[];
    wasEditedIds?: string[];

    editingIds?: string[];

    isDeleted?: boolean;
};
