import React, {useState} from 'react';
import {Button, Flex, Icon, Select, TextArea, TextInput} from '@gravity-ui/uikit';
import {Check, Xmark} from '@gravity-ui/icons';

export type EditLinkValues = {
    link: string;
    token: string;
    name: string;
};

export type EditLinkItemProps = {
    linkLabel?: string;
    tokenLabel?: string;
    nameLabel?: string;
    onAccept?: (values: EditLinkValues) => void;
    onCancel?: () => void;
    onChange?: (pathedValues: EditLinkValues) => void;
    tokens?: {value: string; title: string}[];
    values?: EditLinkValues;
    defaultValues?: EditLinkValues;
};

export const EditLinkItem = ({
    linkLabel: cutomerLinkLabel,
    tokenLabel: customerTokenLabel,
    nameLabel: customeNameLabel,
    onAccept,
    onCancel,
    onChange,
    tokens,
    values: customerValues,
    defaultValues,
}: EditLinkItemProps) => {
    const [innerValues, setInnerValues] = useState<EditLinkValues>({
        link: '',
        token: '',
        name: '',
        ...customerValues,
        ...(defaultValues ?? {}),
    });

    const linkLabel = cutomerLinkLabel ?? 'Link:';
    const tokenLabel = customerTokenLabel ?? 'Token:';
    const nameLabel = customeNameLabel ?? 'Name:';

    const values = customerValues ?? innerValues;

    const handleUpdate = (key: string, patcValue: string) => {
        const newValues: EditLinkValues = {...values, [key]: patcValue};

        setInnerValues(newValues);
        onChange?.(newValues);
    };

    const handleAccept = () => {
        onAccept?.(values);
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            handleAccept();
        }
    };

    return (
        <Flex width="100%" spacing={{px: 4, py: 3}} direction="column" gap={2}>
            <TextArea
                value={values.link}
                minRows={3}
                maxRows={5}
                hasClear
                placeholder={linkLabel}
                onKeyDown={handleKeyDown}
                onUpdate={(v) => handleUpdate('link', v)}
            />

            {tokens && (
                <Select
                    filterable
                    value={[values.token]}
                    label={tokenLabel}
                    onUpdate={(v) => handleUpdate('token', v[0])}
                >
                    {tokens.map((token) => (
                        <Select.Option
                            key={token.value}
                            value={token.value}
                            content={token.title}
                        />
                    ))}
                </Select>
            )}

            <TextInput
                value={values.name}
                label={nameLabel}
                hasClear
                onKeyDown={handleKeyDown}
                onUpdate={(v) => handleUpdate('name', v)}
            />

            <Flex gap={2}>
                <Button view="flat" onClick={handleAccept}>
                    <Icon data={Check} />
                    Save
                </Button>
                <Button view="flat" onClick={onCancel}>
                    <Icon data={Xmark} />
                    Cancel
                </Button>
            </Flex>
        </Flex>
    );
};
