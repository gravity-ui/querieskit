import React from 'react';
import {Button, Icon} from '@gravity-ui/uikit';
import FunnelIcon from '@gravity-ui/icons/svgs/funnel.svg';

export const HistoryFilter = () => {
    return (
        <Button>
            <Icon data={FunnelIcon} size={16} />
        </Button>
    );
};
