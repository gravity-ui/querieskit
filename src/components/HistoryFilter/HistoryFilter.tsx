import React, {FC, useRef, useState} from 'react';
import {Button, Flex, Icon, Popup} from '@gravity-ui/uikit';
import FunnelIcon from '@gravity-ui/icons/svgs/funnel.svg';
import ArrowRotateLeftIcon from '@gravity-ui/icons/svgs/arrow-rotate-left.svg';
import {useToggle} from '../../helpers/useToggle';
import cn from 'bem-cn-lite';
import {FormField, SimpleForm} from '../SimpleForm';
import './HistoryFilter.scss';

const block = cn('qp-history-filter');

type Props = {
    fields?: FormField[];
    /** Значения формы в controlled-режиме. Если переданы — компонент не хранит собственный стейт. */
    values?: Record<string, any>;
    /** Начальные значения для uncontrolled-режима (используются один раз при монтировании). */
    initialValues?: Record<string, any>;
    /** Признак того, что фильтр изменён относительно исходного состояния. Влияет на view кнопки раскрытия попапа. */
    isChanged?: boolean;
    onApply?: (values: Record<string, any>) => void;
    onReset?: () => void;
};

export const HistoryFilter: FC<Props> = ({
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
                        Apply
                    </Button>
                    <Button onClick={onReset}>
                        <Icon data={ArrowRotateLeftIcon} size={16} />
                        Reset
                    </Button>
                </Flex>
            </Popup>
        </>
    );
};
