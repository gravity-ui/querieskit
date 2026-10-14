import React from 'react';
import {Button, Flex, Icon, Text} from '@gravity-ui/uikit';
import XmarkIcon from '@gravity-ui/icons/svgs/xmark.svg';
import cn from 'bem-cn-lite';
import './PanelHeader.scss';

const block = cn('qp-query-editor-panel-header');

export function PanelHeader({
    onClose,
    title,
    closeLabel,
}: {
    onClose: () => void;
    title: string;
    closeLabel: string;
}) {
    return (
        <Flex alignItems="center" justifyContent="space-between" className={block()}>
            <Text variant="subheader-1">{title}</Text>
            <Button view="flat" aria-label={closeLabel} title={closeLabel} onClick={onClose}>
                <Icon data={XmarkIcon} size={16} />
            </Button>
        </Flex>
    );
}
