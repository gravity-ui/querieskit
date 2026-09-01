import React from 'react';
import {ChevronsDown, ChevronsUp} from '@gravity-ui/icons';
import {Button, Icon} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';

import {SearchWithButtons} from '../../../components';
import i18n from '../i18n';

import './QueryStatisticsToolbar.scss';

const block = cn('qp-query-statistics-toolbar');

export type QueryStatisticsToolbarProps = {
    search: string;
    hasGroups: boolean;
    onSearchUpdate: (value: string) => void;
    onExpandAll: () => void;
    onCollapseAll: () => void;
};

export function QueryStatisticsToolbar({
    search,
    hasGroups,
    onSearchUpdate,
    onExpandAll,
    onCollapseAll,
}: QueryStatisticsToolbarProps) {
    const buttons = [
        <Button
            key="expand"
            size="m"
            aria-label={i18n('action_expand-all')}
            title={i18n('action_expand-all')}
            disabled={!hasGroups}
            onClick={onExpandAll}
        >
            <Icon data={ChevronsDown} size={16} />
        </Button>,
        <Button
            key="collapse"
            size="m"
            aria-label={i18n('action_collapse-all')}
            title={i18n('action_collapse-all')}
            disabled={!hasGroups}
            onClick={onCollapseAll}
        >
            <Icon data={ChevronsUp} size={16} />
        </Button>,
    ];

    return (
        <SearchWithButtons
            value={search}
            placeholder={i18n('field_search')}
            hasClear
            onUpdate={onSearchUpdate}
            endButtons={buttons}
            className={block()}
        />
    );
}
