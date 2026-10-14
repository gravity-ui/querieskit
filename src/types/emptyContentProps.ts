import type {EmptyContentTextOverrides} from './listPanel';

export type EmptyContentVariant = 'no-files' | 'no-clusters' | 'nothing-found' | 'no-data';

export type EmptyContentProps = EmptyContentTextOverrides & {
    variant: EmptyContentVariant;
    className?: string;
};
