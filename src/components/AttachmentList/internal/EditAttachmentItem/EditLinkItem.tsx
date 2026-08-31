import React, {useRef, useState} from 'react';
import {Box, Button, Flex, Icon, Select, Text, TextArea, TextInput} from '@gravity-ui/uikit';
import {Check, Xmark} from '@gravity-ui/icons';
import cn from 'bem-cn-lite';

import i18n from '../../i18n';

import './EditLinkItem.scss';

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

const block = cn('edit-link-item');

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

    const labelRef = useRef<HTMLLabelElement>(null);

    const linkLabel = cutomerLinkLabel ?? i18n('field_link');
    const tokenLabel = customerTokenLabel ?? i18n('field_token');
    const nameLabel = customeNameLabel ?? i18n('field_name');

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
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            handleAccept();
        }
    };

    const handleLinkScroll = (event: React.UIEvent<HTMLTextAreaElement>) => {
        if (labelRef.current) {
            labelRef.current.style.transform = `translateY(-${event.currentTarget.scrollTop}px)`;
        }
    };

    return (
        <Flex className={block()} width="100%" spacing={{px: 4, py: 3}} direction="column" gap={2}>
            <Box overflow="hidden" className={block('link-field-container')} position="relative">
                <Text
                    ref={labelRef}
                    as="label"
                    htmlFor="attachment-link"
                    className={block('link-field-label')}
                >
                    {linkLabel}
                </Text>

                <TextArea
                    id="attachment-link"
                    value={values.link}
                    minRows={3}
                    maxRows={5}
                    hasClear
                    onKeyDown={handleKeyDown}
                    onUpdate={(v) => handleUpdate('link', v)}
                    controlProps={{
                        onScroll: handleLinkScroll,
                        style: {
                            textIndent: Number(labelRef.current?.clientWidth) + 2,
                        },
                    }}
                />
            </Box>

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
                    {i18n('action_save')}
                </Button>
                <Button view="flat" onClick={onCancel}>
                    <Icon data={Xmark} />
                    {i18n('action_cancel')}
                </Button>
            </Flex>
        </Flex>
    );
};
