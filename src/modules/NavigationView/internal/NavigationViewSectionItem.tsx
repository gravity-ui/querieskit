import React, {useMemo} from 'react';
import {Disclosure, Flex, Text} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';
import {type Column, DataTable, NavigationActionButtons} from '../../../components';
import type {NavigationViewRow, NavigationViewSection} from '../../../types/navigation';
import {buildViewColumns} from '../helpers/buildViewColumns';
import i18n from '../i18n';

const block = cn('qp-navigation-view');

export type NavigationViewSectionItemProps<TRow extends NavigationViewRow = NavigationViewRow> = {
    section: NavigationViewSection<TRow>;
    tableColumns?: Array<Column<TRow>>;
    extraColumns?: Array<Column<TRow>>;
};

export function NavigationViewSectionItem<TRow extends NavigationViewRow = NavigationViewRow>({
    section,
    tableColumns,
    extraColumns,
}: NavigationViewSectionItemProps<TRow>) {
    const resolvedColumns = useMemo(() => {
        if (tableColumns) {
            return tableColumns;
        }
        return [...buildViewColumns<TRow>(section.columns, i18n), ...(extraColumns ?? [])];
    }, [tableColumns, extraColumns, section.columns]);

    return (
        <Disclosure
            summary={section.title}
            expanded={section.expanded}
            defaultExpanded={section.defaultExpanded}
            onUpdate={section.onExpandedChange}
            className={block('section')}
        >
            <Disclosure.Summary>
                {(_props, defaultButton) => (
                    <Flex
                        gap={2}
                        justifyContent="flex-start"
                        alignItems="center"
                        className={block('summary')}
                    >
                        <Flex minWidth={0}>{defaultButton}</Flex>
                        <NavigationActionButtons
                            actions={section.actions}
                            arg={section}
                            buttonClassName={block('action')}
                        />
                    </Flex>
                )}
            </Disclosure.Summary>
            <Disclosure.Details>
                {section.errorContent ? (
                    <Text color="danger">{section.errorContent}</Text>
                ) : (
                    <DataTable<TRow>
                        columns={resolvedColumns}
                        data={section.rows}
                        loading={section.loading}
                        loaded={section.loaded}
                        settings={{displayIndices: false}}
                        className={block('table')}
                    />
                )}
            </Disclosure.Details>
        </Disclosure>
    );
}
