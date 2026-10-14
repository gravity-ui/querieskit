import React from 'react';
import {Button, Flex, Icon} from '@gravity-ui/uikit';
import ResetIcon from '@gravity-ui/icons/svgs/arrow-rotate-left.svg';
import RawIcon from './icons/RawIcon';
import i18n from '../i18n';
import cn from 'bem-cn-lite';
import './ValueActions.scss';

const block = cn('qp-parameter-value');

export function ValueActions({
    label,
    disabled,
    raw,
    rawDisabled,
    onRaw,
    onReset,
}: {
    label: string;
    disabled?: boolean;
    raw?: boolean;
    rawDisabled?: boolean;
    onRaw?: () => void;
    onReset: () => void;
}) {
    return (
        <Flex alignItems="center" className={block('actions')}>
            {onRaw && (
                <Button
                    view="flat-secondary"
                    size="m"
                    className={block('raw')}
                    selected={raw}
                    disabled={disabled || rawDisabled}
                    onClick={onRaw}
                    aria-label={`RAW: ${label}`}
                >
                    <Icon data={RawIcon} size={16} />
                </Button>
            )}
            <Button
                view="flat-secondary"
                size="m"
                disabled={disabled}
                onClick={onReset}
                aria-label={`${i18n('action_reset-value')}: ${label}`}
            >
                <Icon data={ResetIcon} size={12} />
            </Button>
        </Flex>
    );
}
