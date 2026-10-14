import React, {FC} from 'react';
import {Flex, Text} from '@gravity-ui/uikit';
import {Folder, NoSearchResults} from '@gravity-ui/illustrations';
import cn from 'bem-cn-lite';
import i18n from './i18n';
import './EmptyContent.scss';
import type {EmptyContentTextOverrides} from '../../types/listPanel';

const block = cn('qp-empty-content');

export type EmptyContentVariant = 'no-files' | 'no-clusters' | 'nothing-found' | 'no-data';

export type EmptyContentProps = EmptyContentTextOverrides & {
    variant: EmptyContentVariant;
    className?: string;
};

type EmptyContentConfig = {
    icon: FC<{height?: number}>;
    title: string;
    description?: string;
};

const CONTENT_BY_VARIANT: Record<EmptyContentVariant, EmptyContentConfig> = {
    'no-files': {
        icon: Folder,
        title: i18n('title_no-files'),
    },
    'no-clusters': {
        icon: Folder,
        title: i18n('title_no-clusters'),
    },
    'nothing-found': {
        icon: NoSearchResults,
        title: i18n('title_nothing-found'),
        description: i18n('context_try-change-filters'),
    },
    'no-data': {
        icon: Folder,
        title: i18n('title_no-data'),
    },
};

export const EmptyContent: FC<EmptyContentProps> = ({
    variant,
    className,
    title: titleOverride,
    description: descriptionOverride,
}) => {
    const {
        icon: Icon,
        title: defaultTitle,
        description: defaultDescription,
    } = CONTENT_BY_VARIANT[variant];
    const title = titleOverride === undefined ? defaultTitle : titleOverride;
    const description =
        descriptionOverride === undefined ? defaultDescription : descriptionOverride;

    return (
        <Flex alignItems="center" justifyContent="center" className={block(null, className)}>
            <Flex direction="column" gap={5}>
                <Icon height={100} />
                <Flex direction="column" alignItems="center" gap={1}>
                    <Text variant="subheader-1">{title}</Text>
                    {description && <Text>{description}</Text>}
                </Flex>
            </Flex>
        </Flex>
    );
};
