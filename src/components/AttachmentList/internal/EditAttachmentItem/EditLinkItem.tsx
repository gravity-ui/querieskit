import React, {useId, useRef, useState} from 'react';
import {Box, Button, Flex, Icon, Select, Text, TextArea, TextInput} from '@gravity-ui/uikit';
import {Check, Xmark} from '@gravity-ui/icons';
import {useLabelRef} from '../../hooks/useLabelRef';
import {useKeyDownFormControl} from '../../hooks/useKeyDownFormControl';
import {ObjectLinkValidator, objectLinkValidator} from '../../helpers/objectLinkValidator';
import cn from 'bem-cn-lite';

import i18n from '../../i18n';

import './EditLinkItem.scss';

export type EditLinkValues = {
    link: string;
    token: string;
    name: string;
};

type EditLinkErrors = {
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
    validator?: ObjectLinkValidator;
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
    validator = objectLinkValidator,
    defaultValues,
}: EditLinkItemProps) => {
    const [innerValues, setInnerValues] = useState<EditLinkValues>({
        link: '',
        token: '',
        name: '',
        ...customerValues,
        ...(defaultValues ?? {}),
    });

    const [errors, setErrors] = useState<Partial<EditLinkErrors> | null>(null);

    const linkInputId = useId();

    const linkLabel = cutomerLinkLabel ?? i18n('field_link');
    const tokenLabel = customerTokenLabel ?? i18n('field_token');
    const nameLabel = customeNameLabel ?? i18n('field_name');

    const values = customerValues ?? innerValues;

    const {labelRef, labelWidth} = useLabelRef(linkLabel);

    const wasSubmittedRef = useRef(false);

    const isTokenRequired = tokens && tokens?.length > 0;

    const handleUpdate = (key: string, patcValue: string) => {
        const newValues: EditLinkValues = {...values, [key]: patcValue};

        if (errors || wasSubmittedRef.current) {
            setErrors(validator(newValues, isTokenRequired));
        }

        setInnerValues(newValues);
        onChange?.(newValues);
    };

    const handleAccept = () => {
        const validResult = validator(values, isTokenRequired);

        wasSubmittedRef.current = true;

        if (validResult) {
            setErrors(validResult);
            return;
        }

        onAccept?.(values);
    };

    const handleCancel = () => {
        onCancel?.();
    };

    const handleLinkScroll = (event: React.UIEvent<HTMLTextAreaElement>) => {
        if (labelRef.current) {
            labelRef.current.style.transform = `translateY(-${event.currentTarget.scrollTop}px)`;
        }
    };

    const {handleEditorKeyDown, handleInputKeyDown} = useKeyDownFormControl(
        handleAccept,
        handleCancel,
    );

    return (
        <Flex
            onKeyDown={handleEditorKeyDown}
            className={block()}
            width="100%"
            spacing={{px: 4, py: 3}}
            direction="column"
            gap={2}
        >
            <Box overflow="hidden" className={block('link-field-container')} position="relative">
                <Text
                    ref={labelRef}
                    as="label"
                    htmlFor={linkInputId}
                    className={block('link-field-label')}
                >
                    {linkLabel}
                </Text>

                <TextArea
                    id={linkInputId}
                    value={values.link}
                    minRows={3}
                    maxRows={5}
                    hasClear
                    autoFocus
                    error={errors?.link}
                    errorMessage={errors?.link}
                    onKeyDown={handleInputKeyDown}
                    onUpdate={(v) => handleUpdate('link', v)}
                    controlProps={{
                        onScroll: handleLinkScroll,
                        style: {
                            textIndent: labelWidth ? labelWidth + 2 : undefined,
                        },
                    }}
                />
            </Box>

            {tokens && (
                <Select
                    filterable
                    value={[values.token]}
                    label={tokenLabel}
                    errorMessage={errors?.token}
                    validationState={errors?.token ? 'invalid' : undefined}
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
                error={errors?.name}
                onKeyDown={handleInputKeyDown}
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
