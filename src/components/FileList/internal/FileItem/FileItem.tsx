import React, {useMemo, useState} from 'react';
import {Button, Flex, Icon, Text} from '@gravity-ui/uikit';
import {Pencil, TrashBin} from '@gravity-ui/icons';
import {getFileIcon} from '../../helpers/getIconByFilePath';
import cn from 'bem-cn-lite';
import './FileItem.scss';

export type FileItemProps = {
    file: {id: string; name: string};
    isEdit?: boolean;
    isAdded?: boolean;
    onEdit?: (file: FileItemProps['file']) => void;
    onDelete?: (file: FileItemProps['file']) => void;
};

const block = cn('file-item');

export const FileItem = ({file, isAdded, isEdit, onEdit, onDelete}: FileItemProps) => {
    const [isHovered, setIsHovered] = useState(false);

    const fileIcon = useMemo(() => getFileIcon(file.name), [file.name]);

    return (
        <Flex
            width="100%"
            height="32px"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            alignItems="center"
            justifyContent="space-between"
            spacing={{px: 4}}
            className={block({isAdded, isEdit})}
        >
            <Flex gap={2} alignItems="center">
                <Icon width={16} className={block('file-icon')} data={fileIcon} />
                <Text variant="body-1">{file.name}</Text>
            </Flex>

            {isHovered && (
                <Flex gap={1}>
                    <Button size="s" view="flat" onClick={() => onEdit?.(file)}>
                        <Icon data={Pencil} />
                    </Button>

                    <Button size="s" view="flat" onClick={() => onDelete?.(file)}>
                        <Icon data={TrashBin} />
                    </Button>
                </Flex>
            )}
        </Flex>
    );
};
