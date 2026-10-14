import {Avatar, Flex, Text} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';
import React from 'react';
import {EditableRowTitle} from '../../components/EditableRowTitle';
import {RowActionsMenu} from '../../components/RowActionsMenu';
import {RowLink} from '../../components/RowLink';
import {isFieldVisible} from '../../helpers/isFieldVisible';
import {formatDateCanonical} from '../../helpers/time';
import type {SavedQuery} from '../../types/savedQueries';
import type {SavedQueryRowProps} from '../../types/savedQueryRowProps';
import './SavedQueryRow.scss';
export type {SavedQueryRowProps} from '../../types/savedQueryRowProps';

const block = cn('qp-saved-query-row');

export const SavedQueryRow = <T extends SavedQuery>({
    item,
    actions,
    isActive,
    comparison,
    editing,
    visibleFields,
    renderAuthor,
    renderLink,
}: SavedQueryRowProps<T>) => {
    const {author, engine, href, savedAt} = item;
    const isEditing = Boolean(editing?.enabled);
    const isComparisonMode = Boolean(comparison?.enabled);
    const isChecked = Boolean(comparison?.checked);
    const showMenu = isActive && Boolean(actions?.length) && !isComparisonMode;
    const authorContent =
        renderAuthor?.(item) ??
        (author ? <Avatar size="3xs" text={author} title={author} /> : null);

    return (
        <RowLink
            href={href}
            renderLink={renderLink}
            disabled={isEditing || isComparisonMode}
            className={block({compared: isChecked})}
        >
            <Flex direction="column" gap={1} className={block('content')}>
                <Flex justifyContent="space-between" className={block('header')}>
                    <EditableRowTitle item={item} editing={editing} />
                    {showMenu && <RowActionsMenu item={item} actions={actions} />}
                </Flex>
                <Flex gap={2} alignItems="center" className={block('metadata')}>
                    {isFieldVisible<SavedQuery>(visibleFields, 'savedAt') &&
                        savedAt !== undefined && (
                            <Text color="complementary">{formatDateCanonical(savedAt)}</Text>
                        )}
                    {isFieldVisible<SavedQuery>(visibleFields, 'engine') && engine && (
                        <Text color="complementary">{engine}</Text>
                    )}
                    {isFieldVisible<SavedQuery>(visibleFields, 'author') && authorContent}
                </Flex>
            </Flex>
        </RowLink>
    );
};
