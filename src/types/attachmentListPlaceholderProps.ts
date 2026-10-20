import type {ReactNode} from 'react';

export type AttachmentListPlaceholderProps = {
    title?: ReactNode;
    description?: ReactNode;
    linkForDoc?: string;
    linkText?: string;
    className?: string;
    addFileText?: ReactNode;
    onAddFile?: () => void;
    onAddLink?: () => void;
    qa?: string;
};
