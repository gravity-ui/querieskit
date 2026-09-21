import React from 'react';
import {Flex, Text} from '@gravity-ui/uikit';
import type {TutorialHistoryRow} from '../../types/tutorial';
import {MonacoLanguage} from '../../components/MonacoEditor';
import {SearchRowLayout} from '../../components/SearchRowLayout';
import './TutorialSearchRow.scss';
import cn from 'bem-cn-lite';

const block = cn('qp-tutorial-search-row');

export type TutorialSearchRowProps<T extends TutorialHistoryRow = TutorialHistoryRow> = {
    item: T;
};

export const TutorialSearchRow = <T extends TutorialHistoryRow>({
    item,
}: TutorialSearchRowProps<T>) => {
    const {href, id, title, query} = item;

    return (
        <SearchRowLayout
            query={query}
            language={MonacoLanguage.YQL}
            href={href}
            className={block()}
            header={
                <Flex gap={2} alignItems="center" className={block('header')}>
                    <Text color="secondary">{id}.</Text>
                    <Text ellipsis>{title}</Text>
                </Flex>
            }
        />
    );
};
