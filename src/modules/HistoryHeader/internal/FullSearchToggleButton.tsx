import React, {FC} from 'react';
import {Button, Icon} from '@gravity-ui/uikit';
import CodeIcon from '@gravity-ui/icons/svgs/code.svg';
import ChevronsExpandHorizontalIcon from '@gravity-ui/icons/svgs/chevrons-expand-horizontal.svg';
import i18n from '../i18n';

type Props = {
    active?: boolean;
    onClick: () => void;
    appearance?: 'default' | 'flat';
};

export const FullSearchToggleButton: FC<Props> = ({active, onClick, appearance = 'default'}) => {
    const defaultView = active ? 'action' : 'normal';
    return (
        <Button
            size={appearance === 'flat' ? 's' : 'xs'}
            view={appearance === 'flat' ? 'flat-secondary' : defaultView}
            selected={appearance === 'flat' && active}
            aria-pressed={Boolean(active)}
            aria-label={i18n('action_full-search')}
            onClick={onClick}
        >
            <Icon
                data={appearance === 'flat' ? CodeIcon : ChevronsExpandHorizontalIcon}
                size={12}
            />
        </Button>
    );
};
