import React from 'react';
import {Flex, Icon, Text} from '@gravity-ui/uikit';
import ArrowUpIcon from '@gravity-ui/icons/svgs/arrow-up.svg';
import ArrowDownIcon from '@gravity-ui/icons/svgs/arrow-down.svg';
import CheckIcon from '@gravity-ui/icons/svgs/check.svg';
import type {Column} from '../../../components';
import type {NavigationSchemaColumn, NavigationSchemaSortOrder} from '../../../types/navigation';
import type schemaI18n from '../i18n';

const SORT_ICONS: Record<NavigationSchemaSortOrder, typeof ArrowUpIcon> = {
    ascending: ArrowUpIcon,
    descending: ArrowDownIcon,
};

export function buildSchemaColumns<TColumn extends NavigationSchemaColumn>(
    i18n: typeof schemaI18n,
): Array<Column<TColumn>> {
    return [
        {
            name: 'name',
            header: i18n('title_column-name'),
            render: ({row}) => (
                <Flex inline gap={1} alignItems="center">
                    <Text>{row.name}</Text>
                    {row.sortOrder && <Icon data={SORT_ICONS[row.sortOrder]} size={14} />}
                </Flex>
            ),
        },
        {
            name: 'type',
            header: i18n('title_column-type'),
            render: ({row}) => row.type ?? i18n('value_empty'),
        },
        {
            name: 'sortOrder',
            header: i18n('title_column-sort-order'),
            render: ({row}) =>
                row.sortOrder
                    ? i18n(
                          row.sortOrder === 'ascending'
                              ? 'value_sort-ascending'
                              : 'value_sort-descending',
                      )
                    : i18n('value_empty'),
        },
        {
            name: 'required',
            header: i18n('title_column-required'),
            align: 'center',
            render: ({row}) =>
                row.required ? <Icon data={CheckIcon} size={16} /> : i18n('value_empty'),
        },
    ];
}
