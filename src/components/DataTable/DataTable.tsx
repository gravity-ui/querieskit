import React from 'react';
import BaseDataTable, {
    DataTableProps as BaseDataTableProps,
    Column,
} from '@gravity-ui/react-data-table';
import {Skeleton} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';

import {EmptyContent, EmptyContentVariant} from '../EmptyContent';

import './DataTable.scss';

export type {Column};

const block = cn('qp-data-table');

const SKELETON_ROWS_COUNT = 4;

export type DataTableProps<T> = {
    loading?: boolean;
    loaded?: boolean;
    className?: string;
    emptyVariant?: EmptyContentVariant;
} & Omit<BaseDataTableProps<T>, 'theme'>;

function getSkeletonWidth(rowIndex: number, columnIndex: number) {
    const widths = [72, 120, 180, 96];

    return widths[(rowIndex + columnIndex) % widths.length];
}

function renderEmptyCell(
    key: string,
    rowIndex: number,
    columnIndex: number,
    align?: Column<unknown>['align'],
) {
    return (
        <td key={key} className={block('td', {empty: true})}>
            <div className={block('content', {empty: true, align})}>
                <Skeleton variant="text" width={getSkeletonWidth(rowIndex, columnIndex)} />
            </div>
        </td>
    );
}

function renderLoadingSkeleton<T>(columns: Array<Column<T>>, displayIndices: boolean) {
    return Array.from({length: SKELETON_ROWS_COUNT}, (_, index) => (
        <tr key={index} className={block('tr', {empty: true})}>
            {displayIndices && renderEmptyCell('__index', index, 0)}
            {columns.map((column, columnIndex) =>
                renderEmptyCell(
                    column.name,
                    index,
                    columnIndex + Number(displayIndices),
                    column.align,
                ),
            )}
        </tr>
    ));
}

export function DataTable<T>(props: DataTableProps<T>) {
    const {
        loading,
        loaded,
        className,
        emptyVariant = 'no-data',
        columns,
        data,
        settings,
        ...rest
    } = props;

    const isEmpty = loaded && data.length === 0;
    const displayIndices = settings?.displayIndices !== false;

    const renderEmptyRow = () => {
        if (loading && !loaded) {
            return renderLoadingSkeleton(columns, displayIndices);
        }

        return null;
    };

    return (
        <div className={block(null, className)}>
            <BaseDataTable
                {...rest}
                columns={columns}
                data={data}
                settings={settings}
                theme="yandex-cloud"
                emptyDataMessage=""
                renderEmptyRow={renderEmptyRow}
            />
            {isEmpty && <EmptyContent variant={emptyVariant} className={block('empty')} />}
        </div>
    );
}
