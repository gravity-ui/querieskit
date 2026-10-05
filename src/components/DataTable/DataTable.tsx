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
    const containerRef = React.useRef<HTMLDivElement>(null);
    const tableRef = React.useRef<BaseDataTable<T>>(null);

    React.useEffect(() => {
        if (!settings?.stickyHead || !settings.syncHeadOnResize || !globalThis.ResizeObserver) {
            return undefined;
        }

        // Observe the data table, not the separately rendered sticky header: updating
        // header widths must not schedule another resize of its own.
        const table = containerRef.current?.querySelector('.data-table__box table');
        if (!table) {
            return undefined;
        }

        let frame: number | undefined;
        let previousWidth: number | undefined;
        let previousHeight: number | undefined;
        const observer = new ResizeObserver(([entry]) => {
            if (!entry) {
                return;
            }
            const {width, height} = entry.contentRect;
            if (width === previousWidth && height === previousHeight) {
                return;
            }
            previousWidth = width;
            previousHeight = height;
            if (frame === undefined) {
                frame = requestAnimationFrame(() => {
                    frame = undefined;
                    tableRef.current?.resize();
                });
            }
        });
        observer.observe(table);

        return () => {
            observer.disconnect();
            if (frame !== undefined) {
                cancelAnimationFrame(frame);
            }
        };
    }, [
        settings?.stickyHead,
        settings?.syncHeadOnResize,
        settings?.dynamicRender,
        settings?.dynamicRenderType,
    ]);

    const renderEmptyRow = () => {
        if (loading && !loaded) {
            return renderLoadingSkeleton(columns, displayIndices);
        }

        return null;
    };

    return (
        <div ref={containerRef} className={block(null, className)}>
            <BaseDataTable
                {...rest}
                ref={tableRef}
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
