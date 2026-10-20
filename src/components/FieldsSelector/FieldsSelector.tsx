import CheckIcon from '@gravity-ui/icons/svgs/check.svg';
import GearIcon from '@gravity-ui/icons/svgs/gear.svg';
import {Button, Flex, Icon, Popup, Text, TextInput} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';
import React, {useEffect, useRef, useState} from 'react';
import type {FieldsSelectorProps} from '../../types/fieldsSelectorProps';
import './FieldsSelector.scss';
import i18n from './i18n';
export type {FieldsSelectorOption, FieldsSelectorProps} from '../../types/fieldsSelectorProps';

const block = cn('qp-fields-selector');

export const FieldsSelector = <K extends string = string>({
    fields,
    value,
    onChange,
    buttonLabel = i18n('action_configure-visible-fields'),
    buttonView = 'normal',
    buttonContent,
    applyMode = 'immediate',
    searchable = false,
    showSelectedCount = false,
}: FieldsSelectorProps<K>) => {
    const [buttonElement, setButtonElement] = useState<HTMLButtonElement | null>(null);
    const [open, setOpen] = useState(false);
    const [draft, setDraft] = useState(value);
    const [search, setSearch] = useState('');
    const previousValue = useRef([...value]);

    useEffect(() => {
        const previous = previousValue.current;
        if (previous.length !== value.length || previous.some((id, index) => id !== value[index])) {
            previousValue.current = [...value];
            setDraft(value);
        }
    }, [value]);

    const changeOpen = (nextOpen: boolean) => {
        setDraft(value);
        setSearch('');
        setOpen(nextOpen);
    };
    const selected = applyMode === 'explicit' ? draft : value;
    const availableIds = new Set(fields.map((field) => field.id));
    const selectedCount = selected.filter((id) => availableIds.has(id)).length;
    const query = search.toLocaleLowerCase();
    const visibleFields = fields.filter(
        (field) =>
            !searchable ||
            (field.searchText ?? (typeof field.title === 'string' ? field.title : field.id))
                .toLocaleLowerCase()
                .includes(query),
    );

    const handleOnChange = (field: K, isChecked: boolean) => {
        const update = (current: K[]) =>
            isChecked ? [...current, field] : current.filter((key) => key !== field);
        if (applyMode === 'explicit') setDraft(update);
        else onChange(update(value));
    };

    return (
        <>
            <Button
                view={buttonView}
                size="m"
                ref={setButtonElement}
                onClick={() => changeOpen(!open)}
                aria-label={buttonLabel}
                aria-expanded={open}
            >
                {buttonContent ?? <Icon data={GearIcon} size={16} />}
                {showSelectedCount && ` (${value.filter((id) => availableIds.has(id)).length})`}
            </Button>
            <Popup
                anchorElement={buttonElement}
                placement="right-start"
                open={open}
                onOpenChange={changeOpen}
                className={block()}
                aria-label={buttonLabel}
            >
                <Flex direction="column" gap={2}>
                    {searchable && (
                        <TextInput
                            value={search}
                            onUpdate={setSearch}
                            placeholder={i18n('field_search')}
                            controlProps={{'aria-label': i18n('field_search')}}
                            hasClear
                        />
                    )}
                    {showSelectedCount && (
                        <Text aria-live="polite">
                            {i18n('context_selected')} {selectedCount}
                        </Text>
                    )}
                    <Flex
                        direction="column"
                        alignItems="flex-start"
                        gap={1}
                        className={block('list')}
                    >
                        {visibleFields.map((field) => {
                            const isChecked = selected.includes(field.id);
                            const checkboxLabel =
                                field.searchText ??
                                (typeof field.title === 'string' ? field.title : field.id);

                            return (
                                <Flex
                                    key={field.id}
                                    gap={3}
                                    alignItems="center"
                                    role="checkbox"
                                    aria-checked={isChecked}
                                    aria-label={checkboxLabel}
                                    tabIndex={0}
                                    className={block('checkbox', {checked: isChecked})}
                                    onClick={() => {
                                        handleOnChange(field.id, !isChecked);
                                    }}
                                    onKeyDown={(event) => {
                                        if (event.key === 'Enter' || event.key === ' ') {
                                            event.preventDefault();
                                            handleOnChange(field.id, !isChecked);
                                        }
                                    }}
                                >
                                    <Icon
                                        data={CheckIcon}
                                        size={16}
                                        className={block('checkbox-icon')}
                                    />

                                    <Text variant="body-1" color="primary">
                                        {field.title}
                                    </Text>
                                </Flex>
                            );
                        })}
                        {visibleFields.length === 0 && <Text>{i18n('context_no-fields')}</Text>}
                    </Flex>
                    {applyMode === 'explicit' && (
                        <Flex gap={2}>
                            <Button
                                view="action"
                                onClick={() => {
                                    onChange(draft.filter((id) => availableIds.has(id)));
                                    changeOpen(false);
                                }}
                            >
                                {i18n('action_apply')}
                            </Button>
                            <Button onClick={() => changeOpen(false)}>
                                {i18n('action_cancel')}
                            </Button>
                        </Flex>
                    )}
                </Flex>
            </Popup>
        </>
    );
};
