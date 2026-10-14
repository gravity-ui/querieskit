import {Avatar, Flex, Text} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';
import React from 'react';
import {MonacoLanguage} from '../../components/MonacoEditor/monaco-yql-languages/constants';
import {SearchRowLayout} from '../../components/SearchRowLayout';
import {isFieldVisible} from '../../helpers/isFieldVisible';
import {formatDateCanonical} from '../../helpers/time';
import type {SavedQuery} from '../../types/savedQueries';
import type {SavedQuerySearchRowProps} from '../../types/savedQuerySearchRowProps';
import './SavedQuerySearchRow.scss';
export type {SavedQuerySearchRowProps} from '../../types/savedQuerySearchRowProps';

const block = cn('qp-saved-query-search-row');

export const SavedQuerySearchRow = <T extends SavedQuery>({
    item,
    comparison,
    editing,
    visibleFields,
    renderAuthor,
    renderLink,
}: SavedQuerySearchRowProps<T>) => {
    const {author, engine, href, query, savedAt} = item;
    const authorContent =
        renderAuthor?.(item) ??
        (author ? <Avatar size="3xs" text={author} title={author} /> : null);

    return (
        <SearchRowLayout
            query={query}
            language={MonacoLanguage.YQL}
            href={href}
            renderLink={renderLink}
            disabled={Boolean(editing?.enabled) || Boolean(comparison?.enabled)}
            className={block()}
            header={
                <Flex gap={2} alignItems="center" className={block('header')}>
                    <Text variant="subheader-1" ellipsis className={block('title')}>
                        {item.title}
                    </Text>
                    {isFieldVisible<SavedQuery>(visibleFields, 'savedAt') &&
                        savedAt !== undefined && (
                            <Text color="complementary" className={block('fixed-metadata')}>
                                {formatDateCanonical(savedAt)}
                            </Text>
                        )}
                    {isFieldVisible<SavedQuery>(visibleFields, 'engine') && engine && (
                        <Text color="complementary" className={block('fixed-metadata')}>
                            {engine}
                        </Text>
                    )}
                    {isFieldVisible<SavedQuery>(visibleFields, 'author') && authorContent}
                </Flex>
            }
        />
    );
};
