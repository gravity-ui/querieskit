import React, {useState} from 'react';
import {Button, Flex, Icon, TextInput} from '@gravity-ui/uikit';
import {Check, Xmark} from '@gravity-ui/icons';

export type EditFileItemProps = {
    fileName?: string;
    fileLabel?: string;
    defaultFileName?: string;
    onChangeFileName?: (fileName: string) => void;
    onAccept?: (newFileName: string) => void;
    onCancel?: () => void;
};

export const FileEdit = ({
    fileLabel: customerFileLabel,
    fileName: customerFileName,
    defaultFileName,
    onChangeFileName,
    onAccept,
    onCancel,
}: EditFileItemProps) => {
    const [innerFileName, setInnerFileName] = useState<string>(
        defaultFileName ?? customerFileName ?? '',
    );

    const label = customerFileLabel ?? 'Name:';

    const fileName = customerFileName ?? innerFileName;

    const handleChangeFileName = (patchFileName: string) => {
        setInnerFileName(patchFileName);
        onChangeFileName?.(patchFileName);
    };

    const handleAccept = () => {
        onAccept?.(fileName);
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            handleAccept();
        }
    };

    return (
        <Flex spacing={{px: 4}} width="100%" gap={2}>
            <TextInput
                autoFocus
                label={label}
                value={fileName}
                onKeyDown={handleKeyDown}
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
