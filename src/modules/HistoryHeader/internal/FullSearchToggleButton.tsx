import React, {FC} from 'react';
import {Button, Icon} from '@gravity-ui/uikit';
import ChevronsExpandHorizontalIcon from '@gravity-ui/icons/svgs/chevrons-expand-horizontal.svg';

type Props = {
    active?: boolean;
    onClick: () => void;
};

export const FullSearchToggleButton: FC<Props> = ({active, onClick}) => {
    return (
        <Button size="xs" view={active ? 'action' : undefined} onClick={onClick}>
            <Icon data={ChevronsExpandHorizontalIcon} size={12} />
        </Button>
    );
};
