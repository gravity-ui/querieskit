import React, {useEffect, useRef, useState} from 'react';
import {Button, Flex, Icon, Text, TextInput} from '@gravity-ui/uikit';
import CheckIcon from '@gravity-ui/icons/svgs/check.svg';
import PencilIcon from '@gravity-ui/icons/svgs/pencil.svg';
import TrashBinIcon from '@gravity-ui/icons/svgs/trash-bin.svg';
import XmarkIcon from '@gravity-ui/icons/svgs/xmark.svg';
import cn from 'bem-cn-lite';
import type {
    QuerySettingsAttribute,
    QuerySettingsAttributeCodec,
    QuerySettingsAttributeErrors,
    QuerySettingsAttributePermissions,
} from '../../../types/querySettings';
import i18n from '../i18n';
import './AttributeRow.scss';

const block = cn('qp-settings-attribute-row');

type Props<TValue> = {
    id: string;
    attribute?: QuerySettingsAttribute<TValue>;
    codec?: QuerySettingsAttributeCodec<TValue>;
    index: number;
    isNew?: boolean;
    disabled: boolean;
    errors?: Partial<Record<'key' | 'value', string>>;
    permissions?: QuerySettingsAttributePermissions;
    validate: (draft: QuerySettingsAttribute<TValue>) => QuerySettingsAttributeErrors | undefined;
    onApply: (attribute: QuerySettingsAttribute<TValue>, valueChanged: boolean) => void;
    onCancel: () => void;
    onRemove: () => void;
    onBlur: (field: 'key' | 'value') => void;
};

function formatAttributeValue<TValue>(
    attribute: QuerySettingsAttribute<TValue> | undefined,
    codec: QuerySettingsAttributeCodec<TValue> | undefined,
) {
    return attribute ? (codec?.format ?? String)(attribute.value) : '';
}

export function AttributeRow<TValue>({
    id,
    attribute,
    codec,
    index,
    isNew = false,
    disabled,
    errors,
    permissions,
    validate,
    onApply,
    onCancel,
    onRemove,
    onBlur,
}: Props<TValue>) {
    const [editing, setEditing] = useState(isNew);
    const key = attribute?.key ?? '';
    const rawValue = attribute?.value;
    const text = formatAttributeValue(attribute, codec);
    const [draft, setDraft] = useState({key, value: text});
    const [validationErrors, setValidationErrors] = useState<QuerySettingsAttributeErrors>();
    const canEditKey = permissions?.canEditKey !== false;
    const canEditValue = permissions?.canEditValue !== false;
    const effectiveDraft = {
        ...draft,
        key: canEditKey ? draft.key : key,
        value: canEditValue ? draft.value : text,
    };
    const rowErrors = {...errors, ...validationErrors};
    const editButton = useRef<HTMLButtonElement>(null);
    const restoreFocus = useRef(false);

    useEffect(() => {
        setValidationErrors(undefined);
        setDraft({key, value: text});
    }, [id, key, rawValue, text]);

    useEffect(() => {
        if (!editing && restoreFocus.current) {
            editButton.current?.focus();
            restoreFocus.current = false;
        }
    }, [editing]);

    const finish = (apply: boolean) => {
        if (disabled || (apply && !effectiveDraft.key.trim())) return;
        if (apply) {
            if (!canEditKey && !canEditValue) return;
            const valueChanged = isNew || effectiveDraft.value !== text;
            let nextValue: TValue;
            if (!valueChanged && attribute) {
                nextValue = attribute.value;
            } else {
                const parsed = codec
                    ? codec.parse(effectiveDraft.value)
                    : {value: effectiveDraft.value as TValue};
                if ('error' in parsed) {
                    setValidationErrors({value: parsed.error});
                    return;
                }
                nextValue = parsed.value;
            }
            const next = {id, key: effectiveDraft.key, value: nextValue};
            const nextErrors = validate(next);
            if (nextErrors?.key || nextErrors?.value) {
                setValidationErrors(nextErrors);
                return;
            }
            onApply(next, valueChanged);
        } else onCancel();
        setValidationErrors(undefined);
        setDraft({key, value: text});
        restoreFocus.current = true;
        setEditing(false);
    };

    return (
        <Flex direction="column" className={block({editing})}>
            <Flex gap={1} alignItems={editing ? 'start' : 'center'}>
                {editing ? (
                    <>
                        {(['key', 'value'] as const).map((field) => (
                            <TextInput
                                key={field}
                                className={block('input')}
                                controlProps={{
                                    'aria-label': i18n(`field_attribute-${field}`, {index}),
                                }}
                                placeholder={i18n(`field_${field}`)}
                                value={effectiveDraft[field]}
                                autoFocus={field === (canEditKey ? 'key' : 'value')}
                                onUpdate={(next) => {
                                    setValidationErrors(undefined);
                                    setDraft((current) => ({...current, [field]: next}));
                                }}
                                onBlur={() => onBlur(field)}
                                onKeyDown={(event) => {
                                    if (event.key === 'Escape') {
                                        event.preventDefault();
                                        event.stopPropagation();
                                        finish(false);
                                    } else if (
                                        event.key === 'Enter' &&
                                        !event.nativeEvent.isComposing
                                    ) {
                                        event.preventDefault();
                                        finish(true);
                                    }
                                }}
                                disabled={
                                    disabled || !(field === 'key' ? canEditKey : canEditValue)
                                }
                                validationState={rowErrors[field] ? 'invalid' : undefined}
                                errorMessage={rowErrors[field]}
                            />
                        ))}
                        <Flex className={block('actions')}>
                            <Button
                                view="flat"
                                disabled={
                                    disabled ||
                                    (!canEditKey && !canEditValue) ||
                                    !effectiveDraft.key.trim()
                                }
                                onClick={() => finish(true)}
                                aria-label={i18n('action_apply-attribute', {index})}
                                title={i18n('action_apply-attribute', {index})}
                            >
                                <Icon data={CheckIcon} size={16} />
                            </Button>
                            <Button
                                view="flat"
                                disabled={disabled}
                                onClick={() => finish(false)}
                                aria-label={i18n('action_cancel-attribute', {index})}
                                title={i18n('action_cancel-attribute', {index})}
                            >
                                <Icon data={XmarkIcon} size={16} />
                            </Button>
                        </Flex>
                    </>
                ) : (
                    <>
                        <div className={block('text')}>
                            <Text color="secondary">{key}: </Text>
                            <Text>{text}</Text>
                        </div>
                        <Flex className={block('actions')}>
                            <Button
                                view="flat"
                                disabled={disabled || (!canEditKey && !canEditValue)}
                                ref={editButton}
                                onClick={() => {
                                    setValidationErrors(undefined);
                                    setDraft({key, value: text});
                                    setEditing(true);
                                }}
                                aria-label={i18n('action_edit-attribute', {index})}
                                title={i18n('action_edit-attribute', {index})}
                            >
                                <Icon data={PencilIcon} size={16} />
                            </Button>
                            <Button
                                view="flat"
                                disabled={disabled || permissions?.canRemove === false}
                                onClick={onRemove}
                                aria-label={i18n('action_remove-attribute', {index})}
                                title={i18n('action_remove-attribute', {index})}
                            >
                                <Icon data={TrashBinIcon} size={16} />
                            </Button>
                        </Flex>
                    </>
                )}
            </Flex>
            {!editing &&
                (['key', 'value'] as const).map(
                    (field) =>
                        errors?.[field] && (
                            <Text key={field} color="danger">
                                {errors[field]}
                            </Text>
                        ),
                )}
        </Flex>
    );
}
