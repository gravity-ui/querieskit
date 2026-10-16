import React, {useEffect, useRef} from 'react';
import {Button, Flex, Icon} from '@gravity-ui/uikit';
import TrashBinIcon from '@gravity-ui/icons/svgs/trash-bin.svg';
import PlusIcon from '@gravity-ui/icons/svgs/plus.svg';
import type {
    QueryParameterEntry,
    QueryParameterItem,
    QueryParameterType,
    QueryParameterValue,
} from '../../../types/queryParameters';
import {createId, defaultValue} from '../helpers/parameters';
import i18n from '../i18n';
import type {RecursiveValueProps} from './parameterValueTypes';
import cn from 'bem-cn-lite';
import './CollectionValue.scss';
import {childProps} from './parameterValueHelpers';
import {DictEntry} from './DictEntry';

const block = cn('qp-parameter-value');

export function CollectionValue(props: RecursiveValueProps) {
    const {ValueComponent, type, value, initialValue, editing, disabled, label, onChange} = props;
    const root = useRef<HTMLDivElement>(null);
    const addButton = useRef<HTMLButtonElement>(null);
    const focusNew = useRef(false);
    useEffect(() => {
        if (focusNew.current) {
            const inputs = root.current?.querySelectorAll<HTMLInputElement>('input, textarea');
            inputs?.[inputs.length - 1]?.focus();
            focusNew.current = false;
        }
    }, [value]);
    if (type.kind !== 'List' && type.kind !== 'Tuple' && type.kind !== 'Dict') return null;
    const items = value as QueryParameterItem[];
    const baseline = Array.isArray(initialValue) ? initialValue : [];
    const remove = (id: string) => {
        onChange(items.filter((item) => item.id !== id));
        addButton.current?.focus();
    };
    return (
        <Flex ref={root} direction="column" gap={2} className={block('collection')}>
            {items.map((item, index) => {
                const initial = baseline.find(({id}) => id === item.id);
                const update = (next: QueryParameterValue) =>
                    onChange(
                        items.map((entry) =>
                            entry.id === item.id ? {...entry, value: next} : entry,
                        ),
                    );
                let itemType: QueryParameterType | undefined;
                if (type.kind === 'List') itemType = type.item;
                if (type.kind === 'Tuple') itemType = type.items[index];
                return (
                    <Flex key={item.id} gap={1} alignItems="flex-start">
                        <div className={block('cell')}>
                            {type.kind === 'Dict' ? (
                                <DictEntry
                                    {...props}
                                    type={type}
                                    entry={item as QueryParameterEntry}
                                    initial={initial as QueryParameterEntry | undefined}
                                    index={index}
                                />
                            ) : (
                                itemType && (
                                    <ValueComponent
                                        {...childProps(
                                            props,
                                            itemType,
                                            item.value,
                                            initial?.value,
                                            item.id,
                                            String(index + 1),
                                            update,
                                        )}
                                    />
                                )
                            )}
                        </div>
                        {editing && type.kind !== 'Tuple' && (
                            <Button
                                view="flat-secondary"
                                size="m"
                                disabled={disabled}
                                onClick={() => remove(item.id)}
                                aria-label={`${i18n('action_remove-item')}: ${label} ${index + 1}`}
                            >
                                <Icon data={TrashBinIcon} size={16} />
                            </Button>
                        )}
                    </Flex>
                );
            })}
            {editing && type.kind !== 'Tuple' && (
                <Button
                    ref={addButton}
                    size="m"
                    className={block('add')}
                    disabled={disabled}
                    onClick={() => {
                        focusNew.current = true;
                        const next =
                            type.kind === 'Dict'
                                ? {
                                      id: createId(),
                                      key: defaultValue(type.key),
                                      value: defaultValue(type.value),
                                  }
                                : {id: createId(), value: defaultValue(type.item)};
                        onChange([...items, next]);
                    }}
                >
                    <Icon data={PlusIcon} size={12} />
                    {i18n('action_add')}
                </Button>
            )}
        </Flex>
    );
}
