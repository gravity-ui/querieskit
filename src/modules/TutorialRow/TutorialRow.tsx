import React from 'react';
import {Flex, Text} from '@gravity-ui/uikit';
import type {QueryListLinkRenderer} from '../../types/queryList';
import type {TutorialHistoryRow} from '../../types/tutorial';
import {RowLink} from '../../components/RowLink';
import cn from 'bem-cn-lite';
import './TutorialRow.scss';

const block = cn('qp-tutorial-row');

export type TutorialRowProps<T extends TutorialHistoryRow = TutorialHistoryRow> = {
    item: T;
    renderLink?: QueryListLinkRenderer;
};

export const TutorialRow = <T extends TutorialHistoryRow>({
    item,
    renderLink,
}: TutorialRowProps<T>) => {
    const {href, id, title} = item;
    const number = item.number ?? id;

    return (
        <RowLink href={href} renderLink={renderLink} className={block()}>
            <Flex gap={0.5} alignItems="center" className={block('content')}>
                <Text className={block('number')} color="secondary" title={String(number)}>
                    {String(number).padStart(2, '0')}.
                </Text>
                <Text ellipsis>{title}</Text>
            </Flex>
        </RowLink>
    );
};
