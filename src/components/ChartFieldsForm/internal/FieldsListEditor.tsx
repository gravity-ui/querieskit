import React, {useId, useRef} from 'react';
import {ArrowDown, ArrowUp, Plus, Xmark} from '@gravity-ui/icons';
import {Button, Flex, Icon, Select, Text} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';

import type {ChartEditorOption, ChartFieldItem} from '../../../types/chartEditor';

import './FieldsListEditor.scss';

const block = cn('qp-fields-list-editor');

type FieldsListEditorProps = {
    items: ChartFieldItem[];
    options: readonly ChartEditorOption[];
    onChange: (items: ChartFieldItem[]) => void;
    disabled?: boolean;
    label: string;
    placeholder: string;
    addLabel: string;
    removeLabel: string;
    moveUpLabel: string;
    moveDownLabel: string;
};

export function FieldsListEditor({
    items,
    options,
    onChange,
    disabled,
    label,
    placeholder,
    addLabel,
    removeLabel,
    moveUpLabel,
    moveDownLabel,
}: FieldsListEditorProps) {
    const instanceId = useId();
    const nextId = useRef(0);
    const enabledOptionCount = new Set(
        options.filter((option) => !option.disabled).map((option) => option.value),
    ).size;

    const addItem = () => {
        const existingIds = new Set(items.map((item) => item.id));
        let id: string;
        do {
            id = `${instanceId}-${nextId.current++}`;
        } while (existingIds.has(id));
        onChange([...items, {id}]);
    };

    return (
        <Flex direction="column" gap={1} className={block()}>
            <Text variant="body-1" color="secondary">
                {label}
            </Text>
            <Flex direction="column" gap={3}>
                {items.map((item, index) => (
                    <Flex key={item.id} gap={2} alignItems="center">
                        <Select
                            className={block('select')}
                            aria-label={`${label} ${index + 1}`}
                            placeholder={placeholder}
                            options={options.map((option) => ({
                                ...option,
                                disabled:
                                    option.disabled ||
                                    items.some(
                                        (other) =>
                                            other.id !== item.id && other.fieldId === option.value,
                                    ),
                            }))}
                            value={item.fieldId === undefined ? [] : [item.fieldId]}
                            onUpdate={([fieldId]) =>
                                onChange(
                                    items.map((other) =>
                                        other.id === item.id ? {...other, fieldId} : other,
                                    ),
                                )
                            }
                            width="max"
                            disabled={disabled}
                        />
                        <Button
                            className={block('action')}
                            type="button"
                            view="flat-secondary"
                            aria-label={`${moveUpLabel} ${index + 1}`}
                            title={moveUpLabel}
                            disabled={disabled || index === 0}
                            onClick={() => {
                                const next = [...items];
                                [next[index - 1], next[index]] = [next[index], next[index - 1]];
                                onChange(next);
                            }}
                        >
                            <Icon data={ArrowUp} size={16} />
                        </Button>
                        <Button
                            className={block('action')}
                            type="button"
                            view="flat-secondary"
                            aria-label={`${moveDownLabel} ${index + 1}`}
                            title={moveDownLabel}
                            disabled={disabled || index === items.length - 1}
                            onClick={() => {
                                const next = [...items];
                                [next[index], next[index + 1]] = [next[index + 1], next[index]];
                                onChange(next);
                            }}
                        >
                            <Icon data={ArrowDown} size={16} />
                        </Button>
                        <Button
                            className={block('action')}
                            type="button"
                            view="flat-secondary"
                            aria-label={`${removeLabel} ${index + 1}`}
                            title={`${removeLabel} ${index + 1}`}
                            onClick={() => onChange(items.filter((other) => other.id !== item.id))}
                            disabled={disabled}
                        >
                            <Icon data={Xmark} size={16} />
                        </Button>
                    </Flex>
                ))}
                <Button
                    className={block('add')}
                    type="button"
                    view="normal"
                    onClick={addItem}
                    disabled={disabled || items.length >= enabledOptionCount}
                >
                    <Icon data={Plus} size={16} />
                    {addLabel}
                </Button>
            </Flex>
        </Flex>
    );
}
