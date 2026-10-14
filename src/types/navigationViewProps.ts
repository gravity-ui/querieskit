import type {Column} from '@gravity-ui/react-data-table';
import type {NavigationViewConfig, NavigationViewRow} from './navigation';

export type NavigationViewViewConfig<TRow extends NavigationViewRow = NavigationViewRow> = {
    tableColumns?: Array<Column<TRow>>;
    extraColumns?: Array<Column<TRow>>;
};

export type NavigationViewProps<TRow extends NavigationViewRow = NavigationViewRow> = {
    data: NavigationViewConfig<TRow>;
    view?: NavigationViewViewConfig<TRow>;
    search?: string;
    onSearchUpdate?: (value: string) => void;
    searchPlaceholder?: string;
    className?: string;
};
