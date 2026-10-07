import type {ReactNode} from 'react';
import type {QueryStatus} from './history';

export type QueryTabItem = {
    /** Unique, stable ID within the strip. */
    id: string;
} & (
    | {type: 'query'; title: string; status: QueryStatus; isModified?: boolean}
    | {type: 'comparison'; leftTitle: string; rightTitle: string}
);

export type QueryTabsProps = {
    /** Display order. The application appends new tabs to this array. */
    items: QueryTabItem[];
    /** Falls back to the first item if absent or missing from items, without emitting a change. */
    activeTab?: string;
    onActiveTabChange: (id: string) => void;
    /** Requests creation; the application owns the new ID, title and selection. */
    onAddTab: () => void;
    /** Requests closure; the application owns confirmation, removal and subsequent selection. */
    onCloseTab: (id: string) => void;
    /** Hide the close button when there is exactly one tab. Defaults to false. */
    hideCloseOnLastTab?: boolean;
    /** Right-hand controls with their own event handlers. */
    actions?: ReactNode;
    className?: string;
};
