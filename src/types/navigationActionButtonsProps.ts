import type {ButtonProps} from '@gravity-ui/uikit';
import type {NavigationAction} from './navigation';

export type NavigationActionButtonsProps<TArg> = {
    actions?: Array<NavigationAction<TArg>>;
    arg: TArg;
    className?: string;
    buttonClassName?: string;
    size?: ButtonProps['size'];
};
