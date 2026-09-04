import React, {useRef, useState} from 'react';
import {Button, Flex, Icon, TextInput} from '@gravity-ui/uikit';
import {Check, Xmark} from '@gravity-ui/icons';
import {useKeyDownFormControl} from '../../hooks/useKeyDownFormControl';
import {Validator, stringRequiredValidator} from '../../helpers/stringRequiredValidator';

import i18n from '../../i18n';

export type EditFileItemProps = {
    fileName?: string;
    fileLabel?: string;
    defaultFileName?: string;
    onChangeFileName?: (fileName: string) => void;
    onAccept?: (newFileName: string) => void;
    onCancel?: () => void;
    validator?: Validator;
};

export const FileEdit = ({
    fileLabel: customerFileLabel,
    fileName: customerFileName,
    defaultFileName,
    onChangeFileName,
    onAccept,
    onCancel,
    validator = stringRequiredValidator,
}: EditFileItemProps) => {
    const [innerFileName, setInnerFileName] = useState<string>(
        defaultFileName ?? customerFileName ?? '',
    );

    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const wasSubmittedRef = useRef(false);

    const label = customerFileLabel ?? i18n('field_name');

    const fileName = customerFileName ?? innerFileName;

    const handleChangeFileName = (patchFileName: string) => {
        if (errorMsg || wasSubmittedRef.current) {
            setErrorMsg(validator(patchFileName));
        }

        setInnerFileName(patchFileName);
        onChangeFileName?.(patchFileName);
    };

    const handleAccept = () => {
        const error = validator(fileName);

        wasSubmittedRef.current = true;

        if (error) {
            setErrorMsg(error);
            return;
        }

        onAccept?.(fileName);
    };

    const handleCancel = () => {
        onCancel?.();
    };

    const {handleEditorKeyDown, handleInputKeyDown} = useKeyDownFormControl(
        handleAccept,
        handleCancel,
    );

    return (
        <Flex onKeyDown={handleEditorKeyDown} spacing={{px: 4, py: 1}} width="100%" gap={2}>
            <TextInput
                autoFocus
                label={label}
                value={fileName}
                error={Boolean(errorMsg)}
                errorMessage={errorMsg}
                onKeyDown={handleInputKeyDown}
                onUpdate={handleChangeFileName}
            />

            <Button view="flat" onClick={handleAccept}>
                <Icon data={Check} />
            </Button>

            <Button view="flat" onClick={onCancel}>
                <Icon data={Xmark} />
            </Button>
        </Flex>
    );
};
