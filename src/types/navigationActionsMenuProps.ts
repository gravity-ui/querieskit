import type {DropdownMenuProps} from '@gravity-ui/uikit';
import type {NavigationAction} from './navigation';

export type NavigationActionGroup<TArg> = {
    id: string;
    title?: string;
    actions: Array<NavigationAction<TArg>>;
};

export type NavigationActionsMenuProps<TArg> = {
    arg: TArg;
    /** Ungrouped actions appear before the named groups. */
    actions?: Array<NavigationAction<TArg>>;
    /** Empty groups and hidden actions are omitted. */
    groups?: Array<NavigationActionGroup<TArg>>;
    disabled?: boolean;
    size?: DropdownMenuProps<TArg>['size'];
    open?: boolean;
    onOpenToggle?: (open: boolean) => void;
    /** Custom switchers must provide an accessible name and apply disabled. */
    renderSwitcher?: DropdownMenuProps<TArg>['renderSwitcher'];
    className?: string;
};
