/** A public query link managed by the consuming application. */
export type QueryShareLink = {
    url: string;
    /** Unix timestamp in milliseconds; null means that the link does not expire. */
    expiresAt: number | null;
};

export type QueryShareAction = 'generate' | 'regenerate' | 'makePermanent' | 'updateExpiration';

export type QueryShareProps = {
    open: boolean;
    onClose: () => void;
    link?: QueryShareLink;
    onGenerate: () => void;
    onRegenerate: () => void;
    onMakePermanent: () => void;
    /** Save the selected expiration as a Unix timestamp in milliseconds. */
    onExpirationChange: (expiresAt: number) => void;
    pendingAction?: QueryShareAction;
    error?: string;
    className?: string;
};
