import React, {FC, useRef, useState} from 'react';
import {Button, Flex, Icon, Popup} from '@gravity-ui/uikit';
import FunnelIcon from '@gravity-ui/icons/svgs/funnel.svg';
import ArrowRotateLeftIcon from '@gravity-ui/icons/svgs/arrow-rotate-left.svg';
import {useToggle} from '../../helpers/useToggle';
import {QueryHistoryFilterConfig} from '../../types/history';
import cn from 'bem-cn-lite';
import {SimpleForm} from '../SimpleForm';
import i18n from './i18n';
import './HistoryFilter.scss';

const block = cn('qp-history-filter');

export const HistoryFilter: FC<QueryHistoryFilterConfig> = ({
    fields = [],
    values,
    initialValues,
    isChanged,
    onApply,
    onReset,
}) => {
    const [buttonElement, setButtonElement] = useState<HTMLButtonElement | null>(null);
    const [open, toggleOpen] = useToggle(false);
    const valuesRef = useRef<Record<string, any>>(values ?? initialValues ?? {});

    return (
        <>
            <Button
                ref={setButtonElement}
                onClick={toggleOpen}
                view={isChanged ? 'action' : 'normal'}
            >
                <Icon data={FunnelIcon} size={16} />
            </Button>
            <Popup
                anchorElement={buttonElement}
                open={open}
                onOpenChange={toggleOpen}
                className={block()}
                placement="bottom-start"
            >
                <div className={block('container')}>
                    <SimpleForm
                        fields={fields}
                        values={values}
                        initialValues={initialValues}
                        onValuesChange={(nextValues) => {
                            valuesRef.current = nextValues;
                        }}
                    />
                </div>
                <Flex gap={3} className={block('container')}>
                    <Button view="action" onClick={() => onApply?.(valuesRef.current)}>
                        {i18n('action_apply')}
                    </Button>
                    <Button onClick={onReset}>
                        <Icon data={ArrowRotateLeftIcon} size={16} />
                        {i18n('action_reset')}
                    </Button>
                </Flex>
            </Popup>
        </>
    );
};
