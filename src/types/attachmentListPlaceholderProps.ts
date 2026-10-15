import type {ReactNode} from 'react';

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
