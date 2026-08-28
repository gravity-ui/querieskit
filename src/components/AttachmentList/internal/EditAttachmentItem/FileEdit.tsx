import React, {useState} from 'react';
import {Button, Flex, Icon, TextInput} from '@gravity-ui/uikit';
import {Check, Xmark} from '@gravity-ui/icons';

export type EditFileItemProps = {
    fileName?: string;
    fileLabel?: string;
    onChangeFileName?: (fileName: string) => void;
    onAccept?: (newFileName: string) => void;
    onCancel?: () => void;
};

export const FileEdit = ({
    fileLabel: customerFileLabel,
    fileName: customerFileName,
    onChangeFileName,
    onAccept,
    onCancel,
}: EditFileItemProps) => {
    const [innerFileName, setInnerFileName] = useState<string>(customerFileName ?? '');

    const label = customerFileLabel ?? 'Name:';

    const fileName = customerFileName ?? innerFileName;

    const handleChangeFileName = (patchFileName: string) => {
        setInnerFileName(patchFileName);
        onChangeFileName?.(patchFileName);
    };

    const handleAccept = () => {
        onAccept?.(fileName);
    };

    return (
        <Flex spacing={{px: 4}} width="100%" gap={2}>
            <TextInput autoFocus label={label} value={fileName} onUpdate={handleChangeFileName} />

            <Button view="flat" onClick={handleAccept}>
                <Icon data={Check} />
            </Button>

            <Button view="flat" onClick={onCancel}>
                <Icon data={Xmark} />
            </Button>
        </Flex>
    );
};
