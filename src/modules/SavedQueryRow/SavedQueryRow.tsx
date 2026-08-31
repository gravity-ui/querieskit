import React from 'react';
import {Avatar, Flex, Text} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';
import {EditableRowTitle, RowActionsMenu, RowLink} from '../../components';
import {formatDateCanonical} from '../../helpers/time';
import {QueryListRowRenderData} from '../../types/queryList';
import {SavedQuery} from '../../types/savedQueries';
import './SavedQueryRow.scss';

const block = cn('qp-saved-query-row');

export type SavedQueryRowProps<T extends SavedQuery = SavedQuery> = {
    item: T;
    renderAuthor?: (item: T) => React.ReactNode;
} & Omit<QueryListRowRenderData<T>, 'item' | 'variant'>;

export const SavedQueryRow = <T extends SavedQuery>({
    item,
    actions,
    isActive,
    comparison,
    editing,
    visibleFields,
    renderAuthor,
}: SavedQueryRowProps<T>) => {
    const {author, engine, href, savedAt} = item;
    const isEditing = Boolean(editing?.enabled);
    const isComparisonMode = Boolean(comparison?.enabled);
    const isChecked = Boolean(comparison?.checked);
    const showMenu = isActive && Boolean(actions?.length) && !isComparisonMode;
    const isFieldVisible = (field: string) =>
        visibleFields === undefined || (visibleFields.value as string[]).includes(field);
    const authorContent =
        renderAuthor?.(item) ??
        (author ? <Avatar size="3xs" text={author} title={author} /> : null);

    return (
        <RowLink
            href={href}
            disabled={isEditing || isComparisonMode}
            className={block({compared: isChecked})}
        >
            <Flex direction="column" gap={1} className={block('content')}>
                <Flex justifyContent="space-between" className={block('header')}>
                    <EditableRowTitle item={item} editing={editing} />
                    {showMenu && <RowActionsMenu item={item} actions={actions} />}
                </Flex>
                <Flex gap={2} alignItems="center" className={block('metadata')}>
                    {isFieldVisible('savedAt') && savedAt && (
                        <Text color="complementary">{formatDateCanonical(savedAt)}</Text>
                    )}
                    {isFieldVisible('engine') && engine && (
                        <Text color="complementary">{engine}</Text>
                    )}
                    {isFieldVisible('author') && authorContent}
                </Flex>
            </Flex>
        </RowLink>
    );
};
