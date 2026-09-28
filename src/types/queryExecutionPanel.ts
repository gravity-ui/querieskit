import type {ReactNode} from 'react';
import type {NavigationMetaProps} from '../modules/NavigationMeta';
import type {ErrorTreeProps} from './errorTree';
import type {NavigationMetaItem} from './navigation';
import type {QueryProgressProps} from './queryGraph';
import type {QueryResultsProps} from './queryResults';
import type {QueryStatisticsProps} from './queryStatistics';

export type QueryExecutionTabBase = {
    /** Unique, non-empty and stable within one execution. */
    id: string;
    disabled?: boolean;
};

export type QueryExecutionTabRenderContext = {active: boolean};

export type QueryExecutionTab<
    TRow extends Record<string, unknown> = Record<string, unknown>,
    TMetaItem extends NavigationMetaItem = NavigationMetaItem,
> = QueryExecutionTabBase &
    (
        | {type: 'result'; title?: ReactNode; props: QueryResultsProps<TRow>}
        | {type: 'progress'; title?: ReactNode; props: QueryProgressProps}
        | {type: 'info'; props?: ErrorTreeProps}
        | {type: 'statistics'; title?: ReactNode; props: QueryStatisticsProps}
        | {type: 'meta'; title?: ReactNode; props: NavigationMetaProps<TMetaItem>}
        | {
              type: 'charts';
              title?: ReactNode;
              renderContent: (context: QueryExecutionTabRenderContext) => ReactNode;
          }
        | {
              type: 'custom';
              title: ReactNode;
              renderContent: (context: QueryExecutionTabRenderContext) => ReactNode;
          }
    );

export type QueryExecutionPanelProps<
    TRow extends Record<string, unknown> = Record<string, unknown>,
    TMetaItem extends NavigationMetaItem = NavigationMetaItem,
> = {
    /** Array order is display order. Keep each tab's id and type stable. */
    tabs: QueryExecutionTab<TRow, TMetaItem>[];
    /** Do not switch between controlled and uncontrolled modes after mounting. */
    activeTab?: string;
    defaultActiveTab?: string;
    /** Followed until the first manual selection in uncontrolled mode. */
    preferredActiveTab?: string;
    /** Called on changes after initialization; never called with an empty selection. */
    onActiveTabChange?: (id: string) => void;
    /** Values are formatted by the application, including its timezone. */
    execution?: {startedAt?: ReactNode; author?: ReactNode};
    expanded?: boolean;
    onExpandedChange?: (expanded: boolean) => void;
    onClose?: () => void;
    emptyContent?: ReactNode;
    className?: string;
};
