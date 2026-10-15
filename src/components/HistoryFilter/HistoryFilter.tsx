import React, {FC, useState} from 'react';
import {Button, Flex, Icon, Popup} from '@gravity-ui/uikit';
import FunnelIcon from '@gravity-ui/icons/svgs/funnel.svg';
import ArrowRotateLeftIcon from '@gravity-ui/icons/svgs/arrow-rotate-left.svg';
import {useToggle} from '../../helpers/useToggle';
import type {HistoryFilterProps} from '../../types/historyFilter';
import cn from 'bem-cn-lite';
import {SimpleForm} from '../SimpleForm';
import {getInitialValues} from '../SimpleForm/helpers/getInitialValues';
import {equalFilterValues} from './helpers/equalFilterValues';
import i18n from './i18n';
import './HistoryFilter.scss';

const block = cn('qp-history-filter');

export const HistoryFilter: FC<HistoryFilterProps> = ({
    fields = [],
    values,
    initialValues,
    isChanged,
    onApply,
    onReset,
    buttonView = 'normal',
}) => {
    const [buttonElement, setButtonElement] = useState<HTMLButtonElement | null>(null);
    const [open, toggleOpen] = useToggle(false);
    const defaults = getInitialValues(fields, initialValues);
    const [draft, setDraft] = useState(() => ({...defaults, ...values}));
    const [previousValues, setPreviousValues] = useState(values);

    // Sync external changes during render, before the form receives stale draft values.
    // Equivalent objects from a parent rerender must preserve unsubmitted edits.
    if (!equalFilterValues(previousValues, values)) {
        setPreviousValues(values);
        setDraft({...defaults, ...values});
    }
    const normalView = isChanged ? 'action' : 'normal';
    const flatView = isChanged ? 'flat-info' : 'flat';

    return (
        <>
            <Button
                ref={setButtonElement}
                onClick={toggleOpen}
                view={buttonView === 'flat' ? flatView : normalView}
                selected={buttonView === 'flat' && Boolean(isChanged)}
                className={block('button')}
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
                    <SimpleForm fields={fields} values={draft} onValuesChange={setDraft} />
                </div>
                <Flex gap={3} className={block('container')}>
                    <Button view="action" onClick={() => onApply?.(draft)}>
                        {i18n('action_apply')}
                    </Button>
                    <Button
                        onClick={() => {
                            setDraft(defaults);
                            onReset?.();
                        }}
                    >
                        <Icon data={ArrowRotateLeftIcon} size={16} />
                        {i18n('action_reset')}
                    </Button>
                </Flex>
            </Popup>
        </>
    );
};
