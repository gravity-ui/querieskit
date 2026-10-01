import React, {FC} from 'react';
import {Button, Icon} from '@gravity-ui/uikit';
import CodeIcon from '@gravity-ui/icons/svgs/code.svg';
import ChevronsExpandHorizontalIcon from '@gravity-ui/icons/svgs/chevrons-expand-horizontal.svg';
import i18n from '../i18n';

type Props = {
    active?: boolean;
    onClick: () => void;
    variant?: 'default' | 'tutorials';
};

export const FullSearchToggleButton: FC<Props> = ({active, onClick, variant = 'default'}) => {
    const defaultView = active ? 'action' : 'normal';
    return (
        <Button
            size={variant === 'tutorials' ? 's' : 'xs'}
            view={variant === 'tutorials' ? 'flat-secondary' : defaultView}
            selected={variant === 'tutorials' && active}
            aria-pressed={Boolean(active)}
            aria-label={i18n('action_full-search')}
            onClick={onClick}
        >
            <Icon
                data={variant === 'tutorials' ? CodeIcon : ChevronsExpandHorizontalIcon}
                size={12}
            />
        </Button>
    );
};
