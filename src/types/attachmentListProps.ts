import type {ListProps} from '@gravity-ui/uikit';
import type {ReactNode} from 'react';
import type {Attachment} from './attachments';

export type AttachmentListProps<T extends Attachment = Attachment> = Omit<
    ListProps<T>,
    'items' | 'selectedItemIndex' | 'virtualized'
> & {
    attachments: T[];
    className?: string;
    onDelete?: (attachment: T) => void;
    onEdit?: (attachment: T) => void;
    onRevert?: (attachment: T) => void;

    renderEditForm?: (attachment: T) => ReactNode;

    wasAddedIds?: string[];
    wasEditedIds?: string[];

    editingIds?: string[];

    isDeleted?: boolean;
};
