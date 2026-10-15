import {Flex, Text} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';
import React from 'react';
import {MonacoLanguage} from '../../components/MonacoEditor/monaco-yql-languages/constants';
import {SearchRowLayout} from '../../components/SearchRowLayout';
import type {TutorialHistoryRow} from '../../types/tutorial';
import type {TutorialSearchRowProps} from '../../types/tutorialSearchRowProps';
import './TutorialSearchRow.scss';
export type {TutorialSearchRowProps} from '../../types/tutorialSearchRowProps';

const block = cn('qp-tutorial-search-row');

export const TutorialSearchRow = <T extends TutorialHistoryRow>({
    item,
    renderLink,
}: TutorialSearchRowProps<T>) => {
    const {href, id, title, query} = item;

    return (
        <SearchRowLayout
            query={query}
            language={MonacoLanguage.YQL}
            href={href}
            renderLink={renderLink}
            className={block()}
            header={
                <Flex gap={2} alignItems="center" className={block('header')}>
                    <Text color="secondary">{String(item.number ?? id).padStart(2, '0')}.</Text>
                    <Text ellipsis>{title}</Text>
                </Flex>
            }
        />
    );
};
