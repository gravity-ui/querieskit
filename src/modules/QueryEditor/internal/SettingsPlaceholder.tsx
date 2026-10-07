import React from 'react';
import {Button, Flex, Icon, Text} from '@gravity-ui/uikit';
import XmarkIcon from '@gravity-ui/icons/svgs/xmark.svg';
import cn from 'bem-cn-lite';
import i18n from '../i18n';
import './SettingsPlaceholder.scss';

const block = cn('qp-query-editor-settings-placeholder');

export function SettingsPlaceholder({onClose}: {onClose: () => void}) {
    return (
        <Flex alignItems="center" justifyContent="space-between" className={block()}>
            <Text variant="subheader-1">{i18n('title_settings')}</Text>
            <Button
                view="flat"
                aria-label={i18n('action_close-settings')}
                title={i18n('action_close-settings')}
                onClick={onClose}
            >
                <Icon data={XmarkIcon} size={16} />
            </Button>
        </Flex>
    );
}
