import React, {useState} from 'react';
import {Button, Flex, Icon, Popup} from '@gravity-ui/uikit';
import FunnelIcon from '@gravity-ui/icons/svgs/funnel.svg';
import ArrowRotateLeftIcon from '@gravity-ui/icons/svgs/arrow-rotate-left.svg';
import {useToggle} from '../../helpers/useToggle';
import type {
    CustomHistoryFilterOptions,
    CustomHistoryFilterProps,
    HistoryFilterProps,
} from '../../types/historyFilter';
import cn from 'bem-cn-lite';
import {SimpleForm} from '../SimpleForm';
import {getInitialValues} from '../SimpleForm/helpers/getInitialValues';
import {equalFilterValues} from './helpers/equalFilterValues';
import i18n from './i18n';
import './HistoryFilter.scss';

const block = cn('qp-history-filter');

/**
 * Shared lifecycle for the default and typed custom field adapters.
 * @internal
 */
export function HistoryFilterForm<T extends object>({
    values,
    initialValues,
    renderFields,
    isChanged,
    onApply,
    onReset,
    buttonView = 'normal',
}: CustomHistoryFilterOptions<T> & {buttonView?: 'normal' | 'flat'}) {
    const [buttonElement, setButtonElement] = useState<HTMLButtonElement | null>(null);
    const [open, toggleOpen] = useToggle(false);
    const [draft, setDraft] = useState(() => ({...initialValues, ...values}));
    const [previousValues, setPreviousValues] = useState(values);

    // Sync external changes during render, before the form receives stale draft values.
    // Equivalent objects from a parent rerender must preserve unsubmitted edits.
    if (!equalFilterValues(previousValues, values)) {
        setPreviousValues(values);
        setDraft({...initialValues, ...values});
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
                    {renderFields({value: draft, onChange: setDraft})}
                </div>
                <Flex gap={3} className={block('container')}>
                    <Button view="action" onClick={() => onApply?.(draft)}>
                        {i18n('action_apply')}
                    </Button>
                    <Button
                        onClick={() => {
                            setDraft(initialValues);
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
}

export function HistoryFilter(props: HistoryFilterProps | CustomHistoryFilterProps) {
    if (props.customFilter) {
        return props.customFilter.render({
            buttonView: props.buttonView,
            isChanged: props.isChanged,
        });
    }
    const {fields = [], initialValues, ...rest} = props;
    return (
        <HistoryFilterForm
            key="simple-form"
            {...rest}
            initialValues={getInitialValues(fields, initialValues)}
            renderFields={({value, onChange}) => (
                <SimpleForm fields={fields} values={value} onValuesChange={onChange} />
            )}
        />
    );
}
