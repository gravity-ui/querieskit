import React, {ReactNode, useState} from 'react';
import {Button, Flex, Icon, Popup, Text} from '@gravity-ui/uikit';
import GearIcon from '@gravity-ui/icons/svgs/gear.svg';
import CheckIcon from '@gravity-ui/icons/svgs/check.svg';
import {useToggle} from '../../helpers/useToggle';
import './FieldsSelector.scss';
import cn from 'bem-cn-lite';

export type FieldsSelectorOption<K extends string = string> = {
    id: K;
    title: ReactNode;
};

export type FieldsSelectorProps<K extends string = string> = {
    fields: FieldsSelectorOption<K>[];
    value: K[];
    onChange: (value: K[]) => void;
    buttonLabel?: string;
};

const block = cn('qp-fields-selector');

export const FieldsSelector = <K extends string = string>({
    fields,
    value,
    onChange,
    buttonLabel = 'Configure visible fields',
}: FieldsSelectorProps<K>) => {
    const [buttonElement, setButtonElement] = useState<HTMLButtonElement | null>(null);
    const [open, toggleOpen] = useToggle(false);

    const handleOnChange = (field: K, isChecked: boolean) => {
        const newValue = isChecked ? [...value, field] : value.filter((key) => key !== field);
        onChange(newValue);
    };

    return (
        <>
            <Button ref={setButtonElement} onClick={toggleOpen} aria-label={buttonLabel}>
                <Icon data={GearIcon} size={16} />
            </Button>
            <Popup
                anchorElement={buttonElement}
                placement="right-start"
                open={open}
                onOpenChange={toggleOpen}
                className={block()}
            >
                <Flex direction="column" alignItems="flex-start" gap={1}>
                    {fields.map((field) => {
                        const isChecked = value.includes(field.id);
                        const checkboxLabel =
                            typeof field.title === 'string' ? field.title : undefined;

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
                </Flex>
            </Popup>
        </>
    );
};
