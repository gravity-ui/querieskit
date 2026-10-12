import React, {useEffect, useRef, useState} from 'react';
import {Button, Flex, Icon, Text, TextInput} from '@gravity-ui/uikit';
import CheckIcon from '@gravity-ui/icons/svgs/check.svg';
import PencilIcon from '@gravity-ui/icons/svgs/pencil.svg';
import TrashBinIcon from '@gravity-ui/icons/svgs/trash-bin.svg';
import XmarkIcon from '@gravity-ui/icons/svgs/xmark.svg';
import cn from 'bem-cn-lite';
import type {QuerySettingsAttribute} from '../../../types/querySettings';
import i18n from '../i18n';
import './AttributeRow.scss';

const block = cn('qp-settings-attribute-row');

type Props = {
    attribute: QuerySettingsAttribute;
    index: number;
    isNew?: boolean;
    disabled: boolean;
    errors?: Partial<Record<'key' | 'value', string>>;
    onApply: (attribute: QuerySettingsAttribute) => void;
    onCancel: () => void;
    onRemove: () => void;
    onBlur: (field: 'key' | 'value') => void;
};

export function AttributeRow({
    attribute,
    index,
    isNew = false,
    disabled,
    errors,
    onApply,
    onCancel,
    onRemove,
    onBlur,
}: Props) {
    const [editing, setEditing] = useState(isNew);
    const [draft, setDraft] = useState(attribute);
    const editButton = useRef<HTMLButtonElement>(null);
    const restoreFocus = useRef(false);

    useEffect(() => {
        setDraft({id: attribute.id, key: attribute.key, value: attribute.value});
    }, [attribute.id, attribute.key, attribute.value]);

    useEffect(() => {
        if (!editing && restoreFocus.current) {
            editButton.current?.focus();
            restoreFocus.current = false;
        }
    }, [editing]);

    const finish = (apply: boolean) => {
        if (disabled || (apply && !draft.key.trim())) return;
        if (apply) onApply(draft);
        else onCancel();
        setDraft(attribute);
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
                                value={draft[field]}
                                autoFocus={field === 'key'}
                                onUpdate={(next) =>
                                    setDraft((current) => ({...current, [field]: next}))
                                }
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
                                disabled={disabled}
                                validationState={errors?.[field] ? 'invalid' : undefined}
                                errorMessage={errors?.[field]}
                            />
                        ))}
                        <Flex className={block('actions')}>
                            <Button
                                view="flat"
                                disabled={disabled || !draft.key.trim()}
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
                            <Text color="secondary">{attribute.key}: </Text>
                            <Text>{attribute.value}</Text>
                        </div>
                        <Flex className={block('actions')}>
                            <Button
                                view="flat"
                                disabled={disabled}
                                ref={editButton}
                                onClick={() => {
                                    setDraft(attribute);
                                    setEditing(true);
                                }}
                                aria-label={i18n('action_edit-attribute', {index})}
                                title={i18n('action_edit-attribute', {index})}
                            >
                                <Icon data={PencilIcon} size={16} />
                            </Button>
                            <Button
                                view="flat"
                                disabled={disabled}
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
