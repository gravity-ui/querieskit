import React, {useId, useRef, useState} from 'react';
import {Button, Flex, Icon} from '@gravity-ui/uikit';
import PlusIcon from '@gravity-ui/icons/svgs/plus.svg';
import type {
    QueryAttributesChangeOperation,
    QueryAttributesEditorProps,
} from '../../types/queryAttributesEditor';
import {AttributeRow} from './internal/AttributeRow';
import i18n from './i18n';

/** Controlled committed rows; unfinished edits remain local until Apply. */
export function QueryAttributesEditor<TValue = string>({
    items,
    onChange,
    errors,
    onFieldBlur,
    getAttributePermissions,
    validateAttribute,
    attributeCodec,
    checkDuplicateAttributeKeys = false,
    disabled = false,
    className,
}: QueryAttributesEditorProps<TValue>) {
    const id = useId();
    const nextAttribute = useRef(0);
    const [newAttributes, setNewAttributes] = useState<Array<{id: string}>>([]);
    const addButton = useRef<HTMLButtonElement>(null);
    const addAttribute = () => {
        if (disabled) return;
        const existingIds = new Set([...items, ...newAttributes].map((attribute) => attribute.id));
        let attributeId: string;
        do {
            attributeId = `${id}-attribute-${++nextAttribute.current}`;
        } while (existingIds.has(attributeId));
        setNewAttributes((current) => [...current, {id: attributeId}]);
    };
    const discardNewAttribute = (attributeId: string) => {
        setNewAttributes((current) => current.filter((row) => row.id !== attributeId));
        addButton.current?.focus();
    };
    return (
        <Flex direction="column" gap={3} className={className}>
            <Flex direction="column" gap={1}>
                {[...items, ...newAttributes].map((attributeRow, index) => {
                    const attribute = items[index];
                    const isNew = attribute === undefined;
                    const rowId = attributeRow.id;
                    // Legacy string drafts exposed their empty value to permissions.
                    // Typed drafts have no raw value until the codec successfully parses.
                    const permissionAttribute =
                        attribute ??
                        (attributeCodec ? undefined : {id: rowId, key: '', value: '' as TValue});
                    return (
                        <AttributeRow
                            key={rowId}
                            id={rowId}
                            attribute={attribute}
                            codec={attributeCodec}
                            index={index + 1}
                            isNew={isNew}
                            disabled={disabled}
                            errors={errors?.[rowId]}
                            permissions={
                                permissionAttribute
                                    ? getAttributePermissions?.(permissionAttribute)
                                    : undefined
                            }
                            validate={(draft) => {
                                const validation = {
                                    ...validateAttribute?.(draft, items),
                                };
                                if (isNew && attributeCodec) {
                                    const permissions = getAttributePermissions?.(draft);
                                    if (permissions?.canEditKey === false)
                                        validation.key = i18n('alert_attribute-edit-not-allowed');
                                    if (permissions?.canEditValue === false)
                                        validation.value = i18n('alert_attribute-edit-not-allowed');
                                }
                                if (
                                    checkDuplicateAttributeKeys &&
                                    items.some(
                                        (row) => row.id !== draft.id && row.key === draft.key,
                                    )
                                )
                                    validation.key = i18n('alert_duplicate-key');
                                return validation;
                            }}
                            onApply={(next, valueChanged) => {
                                const changes: QueryAttributesChangeOperation[] = [];
                                const operation = (kind: 'add' | 'rename' | 'update-value') =>
                                    changes.push({
                                        operation: kind,
                                        id: rowId,
                                    });
                                if (isNew) operation('add');
                                else {
                                    if (next.key !== attribute.key) operation('rename');
                                    if (valueChanged) operation('update-value');
                                }
                                onChange(
                                    isNew
                                        ? [...items, next]
                                        : items.map((row) => (row.id === next.id ? next : row)),
                                    changes,
                                );
                                if (isNew) discardNewAttribute(rowId);
                            }}
                            onCancel={() => {
                                if (isNew) discardNewAttribute(rowId);
                            }}
                            onRemove={() =>
                                onChange(
                                    items.filter((row) => row.id !== rowId),
                                    [{operation: 'remove', id: rowId}],
                                )
                            }
                            onBlur={(field) =>
                                onFieldBlur?.({
                                    id: rowId,
                                    field,
                                })
                            }
                        />
                    );
                })}
            </Flex>
            <Flex>
                <Button ref={addButton} onClick={addAttribute} disabled={disabled}>
                    <Icon data={PlusIcon} size={16} />
                    {i18n('action_add-attribute')}
                </Button>
            </Flex>
        </Flex>
    );
}
