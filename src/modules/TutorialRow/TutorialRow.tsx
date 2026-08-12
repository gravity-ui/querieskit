import React from 'react';
import {Flex, Text} from '@gravity-ui/uikit';
import {TutorialHistoryRow} from '../../types/tutorial';
import {RowLink} from '../../components';
import cn from 'bem-cn-lite';
import './TutorialRow.scss';

const block = cn('qp-tutorial-row');

export type TutorialRowProps<T extends TutorialHistoryRow = TutorialHistoryRow> = {
    item: T;
};

export const TutorialRow = <T extends TutorialHistoryRow>({item}: TutorialRowProps<T>) => {
    const {href, id, title} = item;

    return (
        <RowLink href={href} className={block()}>
            <Flex gap={1} alignItems="center" className={block('content')}>
                <Text color="secondary">{id}.</Text>
                <Text ellipsis>{title}</Text>
            </Flex>
        </RowLink>
    );
};
