import React, {FC} from 'react';
import {Button, Icon} from '@gravity-ui/uikit';
import CodeIcon from '@gravity-ui/icons/svgs/code.svg';
import i18n from '../i18n';

type Props = {
    active?: boolean;
    onClick: () => void;
};

export const FullSearchToggleButton: FC<Props> = ({active, onClick}) => {
    return (
        <Button
            size="s"
            view="flat-secondary"
            selected={active}
            aria-pressed={Boolean(active)}
            aria-label={i18n('action_full-search')}
            onClick={onClick}
        >
            <Icon data={CodeIcon} size={12} />
        </Button>
    );
};
