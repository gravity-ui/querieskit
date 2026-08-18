import React, {FC} from 'react';
import {Avatar, Flex, Text} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';
import {NavigationCluster} from '../../types/navigation';

const block = cn('qp-cluster-row');

export type ClusterRowProps = {
    cluster: NavigationCluster;
};

export const ClusterRow: FC<ClusterRowProps> = ({
    cluster: {icon, title, color, backgroundColor, description},
}) => {
    return (
        <Flex gap={2} alignItems="center" className={block()}>
            {icon ?? (
                <Avatar
                    text={title}
                    shape="square"
                    size="2xs"
                    backgroundColor={backgroundColor}
                    color={color}
                />
            )}
            <Text className={block('title')} ellipsis>
                {title}
            </Text>
            <Text color="secondary" ellipsis>
                {description}
            </Text>
        </Flex>
    );
};
