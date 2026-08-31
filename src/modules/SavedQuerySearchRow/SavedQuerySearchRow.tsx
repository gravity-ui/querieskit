import React from 'react';
import {Avatar, Flex, Text} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';
import {MonacoLanguage, SearchRowLayout} from '../../components';
import {formatDateCanonical} from '../../helpers/time';
import {QueryListRowRenderData} from '../../types/queryList';
import {SavedQuery} from '../../types/savedQueries';
import './SavedQuerySearchRow.scss';

const block = cn('qp-saved-query-search-row');

export type SavedQuerySearchRowProps<T extends SavedQuery = SavedQuery> = {
    item: T;
    renderAuthor?: (item: T) => React.ReactNode;
} & Omit<QueryListRowRenderData<T>, 'item' | 'variant'>;

export const SavedQuerySearchRow = <T extends SavedQuery>({
    item,
    comparison,
    editing,
    visibleFields,
    renderAuthor,
}: SavedQuerySearchRowProps<T>) => {
    const {author, engine, href, query, savedAt} = item;
    const authorContent =
        renderAuthor?.(item) ??
        (author ? <Avatar size="3xs" text={author} title={author} /> : null);
    const isFieldVisible = (field: string) =>
        visibleFields === undefined || (visibleFields.value as string[]).includes(field);

    return (
        <SearchRowLayout
            query={query}
            language={MonacoLanguage.YQL}
            href={href}
            disabled={Boolean(editing?.enabled) || Boolean(comparison?.enabled)}
            className={block()}
            header={
                <Flex gap={2} alignItems="center" className={block('header')}>
                    <Text variant="subheader-1" ellipsis className={block('title')}>
                        {item.title}
                    </Text>
                    {isFieldVisible('savedAt') && savedAt && (
                        <Text color="complementary" className={block('fixed-metadata')}>
                            {formatDateCanonical(savedAt)}
                        </Text>
                    )}
                    {isFieldVisible('engine') && engine && (
                        <Text color="complementary" className={block('fixed-metadata')}>
                            {engine}
                        </Text>
                    )}
                    {isFieldVisible('author') && authorContent}
                </Flex>
            }
        />
    );
};
