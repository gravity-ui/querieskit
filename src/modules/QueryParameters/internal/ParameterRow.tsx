import React, {useMemo, useState} from 'react';
import {Dialog, DropdownMenu, Flex, Text, TextInput} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';
import {DataTypePopup} from '../../../components/DataTypePopup';
import type {
    QueryParameter,
    QueryParameterErrors,
    QueryParameterType,
} from '../../../types/queryParameters';
import {defaultValue, formatType, validType} from '../helpers/parameters';
import {toParameterType} from '../helpers/dataTypes';
import i18n from '../i18n';
import {ParameterTypeEditor} from './ParameterTypeEditor';
import {ParameterValue} from './ParameterValue';
import './ParameterRow.scss';

const block = cn('qp-parameter-row');
type Props = {
    parameter: QueryParameter;
    initialParameter?: QueryParameter;
    isNew?: boolean;
    index: number;
    editing: boolean;
    expanded?: boolean;
    disabled: boolean;
    errors?: QueryParameterErrors;
    onChange: (parameter: QueryParameter) => void;
    onRemove: () => void;
    onValidityChange: (path: string, invalid: boolean) => void;
};

export function ParameterRow({
    parameter,
    initialParameter,
    isNew = false,
    index,
    editing,
    disabled,
    errors,
    onChange,
    onRemove,
    onValidityChange,
}: Props) {
    const [details, setDetails] = useState<{name: string; type: QueryParameterType} | null>(
        editing && isNew ? {name: parameter.name, type: parameter.type} : null,
    );
    const [created, setCreated] = useState(!isNew);
    const [attempted, setAttempted] = useState(false);
    const [revision, setRevision] = useState(0);
    const label = `$${parameter.name || index}`;
    const initialValue = useMemo(() => {
        if (
            initialParameter &&
            JSON.stringify(initialParameter.type) === JSON.stringify(parameter.type)
        )
            return initialParameter.value;
        return validType(parameter.type) ? defaultValue(parameter.type) : undefined;
    }, [initialParameter, parameter.type]);
    const closeDetails = () => {
        setDetails(null);
        if (!created) onRemove();
    };
    const applyDetails = () => {
        if (!details || disabled) return;
        setAttempted(true);
        if (!details.name.trim() || !validType(details.type)) return;
        const changedType = JSON.stringify(details.type) !== JSON.stringify(parameter.type);
        onChange({
            ...parameter,
            ...details,
            value: changedType ? defaultValue(details.type) : parameter.value,
        });
        if (changedType) setRevision((current) => current + 1);
        setCreated(true);
        setDetails(null);
    };
    const header = (
        <Flex alignItems="center" gap={2} className={block('header')}>
            <Text className={block('title')}>
                <Text variant="subheader-1">{label}</Text>{' '}
                <DataTypePopup type={toParameterType(parameter.type)}>
                    <Text color="secondary">
                        [
                        {parameter.type.kind === 'Optional'
                            ? `${formatType(parameter.type.item)}?`
                            : parameter.type.kind === 'Pg'
                              ? `pg${parameter.type.name}`
                              : parameter.type.kind === 'Decimal' ||
                                  parameter.type.kind === 'Unknown'
                                ? formatType(parameter.type)
                                : parameter.type.kind}
                        ]:
                    </Text>
                </DataTypePopup>
            </Text>
            {editing && (
                <DropdownMenu
                    size="s"
                    disabled={disabled}
                    switcherWrapperClassName={block('menu')}
                    defaultSwitcherProps={{
                        'aria-label': i18n('action_parameter-actions', {name: label}),
                        view: 'flat-secondary',
                    }}
                    items={[
                        {
                            text: i18n('action_edit-details'),
                            action: () => {
                                setDetails({name: parameter.name, type: parameter.type});
                                setAttempted(false);
                            },
                        },
                        {
                            text: i18n('action_remove-parameter', {name: label}),
                            action: onRemove,
                            theme: 'danger',
                        },
                    ]}
                />
            )}
        </Flex>
    );
    return (
        <Flex direction="column" gap={1} className={block()}>
            <ParameterValue
                key={revision}
                type={parameter.type}
                value={parameter.value}
                initialValue={initialValue}
                header={header}
                horizontal
                label={label}
                editing={editing}
                disabled={disabled}
                errors={errors?.value}
                onChange={(value) => onChange({...parameter, value})}
                onValidityChange={onValidityChange}
            />
            {errors?.name && (
                <Text color="danger" role="alert">
                    {errors.name}
                </Text>
            )}
            {errors?.type && (
                <Text color="danger" role="alert">
                    {errors.type}
                </Text>
            )}
            <Dialog
                open={details !== null}
                onClose={closeDetails}
                aria-label={i18n('title_parameter-details')}
                maxWidth="s"
                contentOverflow="auto"
                fullWidth
            >
                <Dialog.Header caption={i18n('title_parameter-details')} />
                <Dialog.Body>
                    <Flex direction="column" gap={4}>
                        {details && (
                            <>
                                <Flex direction="column" gap={2}>
                                    <Text color="secondary">{i18n('field_name', {index})}</Text>
                                    <TextInput
                                        value={details.name}
                                        autoFocus
                                        onUpdate={(name) => setDetails({...details, name})}
                                        controlProps={{'aria-label': i18n('field_name', {index})}}
                                        disabled={disabled}
                                        validationState={
                                            attempted && !details.name.trim()
                                                ? 'invalid'
                                                : undefined
                                        }
                                        errorMessage={i18n('alert_invalid-name')}
                                    />
                                </Flex>
                                <ParameterTypeEditor
                                    value={details.type}
                                    onChange={(type) => setDetails({...details, type})}
                                    label={i18n('field_type')}
                                    disabled={disabled}
                                />
                                {created && (
                                    <Text color="secondary">{i18n('context_type-reset')}</Text>
                                )}
                                {attempted && !validType(details.type) && (
                                    <Text color="danger">{i18n('alert_invalid-type')}</Text>
                                )}
                            </>
                        )}
                    </Flex>
                </Dialog.Body>
                <Dialog.Footer
                    propsButtonApply={{disabled}}
                    textButtonApply={i18n('action_apply')}
                    textButtonCancel={i18n('action_cancel')}
                    onClickButtonApply={applyDetails}
                    onClickButtonCancel={closeDetails}
                />
            </Dialog>
        </Flex>
    );
}
