import React, {useMemo, useRef, useState} from 'react';
import {
    Box,
    Button,
    Flex,
    Icon,
    Tab,
    TabList,
    TabPanel,
    TabProvider,
    Text,
} from '@gravity-ui/uikit';
import {AttachmentList, EditAttachmentItem} from '../../components/AttachmentList';
import type {EditLinkValues} from '../../components/AttachmentList';
import {AttachmentListPlaceholder} from '../../components/AttachmentListPlaceholder';
import type {AttachItem, AttachmentsProps} from '../../types/attachments';
import {createUuid} from '../../helpers/createUuid';
import {isObjectEqual} from '../../helpers/isObjectEqual';
import {Plus} from '@gravity-ui/icons';
import cn from 'bem-cn-lite';

import i18n from './i18n';

import './Attachments.scss';

type TabVariants = 'Current' | 'Deleted';

export type {AttachmentsProps, AttachItem} from '../../types/attachments';

const block = cn('qp-attachments');

export const Attachments = ({
    tokens,
    placeholderProps,
    attachmentListProps,
    onChange,
    onItemClick,
    attachments: customerAttachments,
    deletedAttachments: customerDeletedAttachments,
}: AttachmentsProps) => {
    const [currentTab, setCurrentTab] = useState<'Current' | 'Deleted'>('Current');

    const [innerAttachList, setInnerAttachList] = useState<AttachItem[]>(customerAttachments ?? []);
    const [innerDeletedAttachList, setInnerDeletedAttachList] = useState<AttachItem[]>(
        customerDeletedAttachments ?? [],
    );

    const [editingIds, setEditingIds] = useState<string[]>([]);
    const [wasAddedIds, setWasAddedIds] = useState<string[]>([]);
    const [wasEdited, setWasEditedIds] = useState<string[]>([]);

    const attachList = customerAttachments ?? innerAttachList;
    const deletedAttachList = customerDeletedAttachments ?? innerDeletedAttachList;

    const attachCount = useMemo(() => attachList.filter((a) => !a.isNew).length, [attachList]);

    const defaultAttachList = useRef(attachList);

    const getDefaultValuesForLink = (linkId: string) => {
        const currentLink = attachList.find((a) => a.id === linkId);
        return {
            name: currentLink?.name ?? '',
            link: currentLink?.link ?? '',
            token: currentLink?.token ?? '',
        };
    };

    const runAfterAttachAdded = (attachId: string, newAttach: AttachItem) => {
        const editedAttach = defaultAttachList.current.find((a) => a.id === attachId);

        if (!editedAttach) return;

        if (isObjectEqual(editedAttach, newAttach)) {
            setWasEditedIds(wasEdited.filter((id) => id !== attachId));
            return;
        }

        setWasEditedIds([...wasEdited, attachId]);
    };

    const handleAddEmptyFile = () => {
        const id = createUuid();

        const patchAttachList = [
            ...attachList.filter((a) => !a.isNew),
            {id, name: '', isNew: true},
        ];

        setInnerAttachList(patchAttachList);
        setWasAddedIds([...wasAddedIds, id]);
        setEditingIds([...editingIds, id]);

        onChange?.({
            attachments: patchAttachList,
            deletedAttachments: deletedAttachList,
        });
    };

    const handleAddEmptyLink = () => {
        const id = createUuid();

        const patchAttachList = [
            ...attachList.filter((a) => !a.isNew),
            {id, name: '', token: '', link: '', isNew: true},
        ];

        setInnerAttachList(patchAttachList);
        setWasAddedIds([...wasAddedIds, id]);
        setEditingIds([...editingIds, id]);

        onChange?.({
            attachments: patchAttachList,
            deletedAttachments: deletedAttachList,
        });
    };

    const handleAcceptFile = (fileId: string, fileName: string) => {
        const patchedFile = attachList.find((a) => a.id === fileId);
        if (!patchedFile) return;

        const patchEditingIds = editingIds.filter((id) => id !== fileId);
        const patchAttachList = attachList.map((attach) => {
            if (attach.id === fileId) return {id: fileId, name: fileName};
            return attach;
        });

        setEditingIds(patchEditingIds);
        setInnerAttachList(patchAttachList);

        onChange?.({
            attachments: patchAttachList,
            deletedAttachments: deletedAttachList,
        });

        runAfterAttachAdded(fileId, {id: fileId, name: fileName});
    };

    const handleAcceptLink = (linkId: string, link: EditLinkValues) => {
        const patchedLink = attachList.find((a) => a.id === linkId);
        if (!patchedLink) return;

        const patchEditingIds = editingIds.filter((id) => id !== linkId);
        const patchAttachList = attachList.map((attach) => {
            if (attach.id === linkId) return {id: linkId, ...link};
            return attach;
        });

        setEditingIds(patchEditingIds);
        setInnerAttachList(patchAttachList);

        onChange?.({
            attachments: patchAttachList,
            deletedAttachments: deletedAttachList,
        });

        runAfterAttachAdded(linkId, {id: linkId, ...link});
    };

    const handleCancelEdit = (fileId: string) => {
        const patchEditingIds = editingIds.filter((id) => id !== fileId);
        const patchAttachList = attachList.filter((a) => !a.isNew);

        const wasItNewAttach = attachList.some((a) => a.isNew);
        if (wasItNewAttach) {
            setWasAddedIds(wasAddedIds.filter((id) => id !== fileId));
        }

        setInnerAttachList(patchAttachList);
        setEditingIds(patchEditingIds);

        onChange?.({
            attachments: patchAttachList,
            deletedAttachments: deletedAttachList,
        });
    };

    const handleEdit = (editAttachId: string) => {
        const patchEditingIds = [...editingIds, editAttachId];

        setEditingIds(patchEditingIds);
    };

    const handleDelete = (attachId: string) => {
        const deletedAttachmen = attachList.find((a) => a.id === attachId);

        if (!deletedAttachmen) return;

        const patchAttachList = attachList.filter((a) => a.id !== attachId);
        const patchDeletedAttachList = [...deletedAttachList, deletedAttachmen];

        setInnerAttachList(patchAttachList);
        setInnerDeletedAttachList(patchDeletedAttachList);

        onChange?.({
            attachments: patchAttachList,
            deletedAttachments: patchDeletedAttachList,
        });
    };

    const handleDeleteAll = () => {
        const patchAttachList: never[] = [];
        const patchDeletedAttachList = [
            ...deletedAttachList,
            ...attachList.filter((a) => !a.isNew),
        ];

        setInnerAttachList(patchAttachList);
        setInnerDeletedAttachList(patchDeletedAttachList);

        onChange?.({
            attachments: patchAttachList,
            deletedAttachments: patchDeletedAttachList,
        });
    };

    const handleRevertDelete = (attachId: string) => {
        const revertAttach = deletedAttachList.find((a) => a.id === attachId);

        if (!revertAttach) return;

        const patchAttachList = [...attachList, revertAttach];
        const patchDeletedAttachList = deletedAttachList.filter((a) => a.id !== attachId);

        setInnerAttachList(patchAttachList);
        setInnerDeletedAttachList(patchDeletedAttachList);

        onChange?.({
            attachments: patchAttachList,
            deletedAttachments: patchDeletedAttachList,
        });
    };

    return (
        <Box className={block()} height="100%" overflow="hidden">
            <TabProvider value={currentTab} onUpdate={(tab) => setCurrentTab(tab as TabVariants)}>
                <TabList className={block('tab-list')}>
                    <Tab value="Current">
                        <Flex gap={2}>
                            <Text variant="body-1">{i18n('title_current')}</Text>
                            <Text color="hint" variant="body-1">
                                {attachCount}
                            </Text>
                        </Flex>
                    </Tab>
                    <Tab value="Deleted">
                        <Flex gap={2}>
                            <Text variant="body-1">{i18n('title_deleted')}</Text>
                            <Text color="hint" variant="body-1">
                                {deletedAttachList.length}
                            </Text>
                        </Flex>
                    </Tab>
                </TabList>

                <TabPanel className={block('panel')} value="Current">
                    <Flex spacing={{py: 3}} direction="column" width="100%" height="100%" gap={3}>
                        {attachList.length ? (
                            <AttachmentList
                                {...attachmentListProps}
                                className={block('list', attachmentListProps?.className)}
                                attachments={attachList}
                                wasAddedIds={wasAddedIds}
                                wasEditedIds={wasEdited}
                                editingIds={editingIds}
                                onEdit={(attach) => handleEdit(attach.id)}
                                onDelete={(attach) => handleDelete(attach.id)}
                                onItemClick={onItemClick}
                                renderEditForm={(attach) => {
                                    const isLink = typeof attach.link === 'string';

                                    if (isLink) {
                                        const defaultLinkValues = getDefaultValuesForLink(
                                            attach.id,
                                        );

                                        return (
                                            <EditAttachmentItem
                                                type="link"
                                                onAccept={(link) =>
                                                    handleAcceptLink(attach.id, link)
                                                }
                                                defaultValues={defaultLinkValues}
                                                tokens={tokens}
                                                onCancel={() => handleCancelEdit(attach.id)}
                                            />
                                        );
                                    }

                                    return (
                                        <EditAttachmentItem
                                            type="file"
                                            defaultFileName={attach.name}
                                            onAccept={(pathName) =>
                                                handleAcceptFile(attach.id, pathName)
                                            }
                                            onCancel={() => handleCancelEdit(attach.id)}
                                        />
                                    );
                                }}
                            />
                        ) : (
                            <AttachmentListPlaceholder
                                onAddFile={handleAddEmptyFile}
                                onAddLink={handleAddEmptyLink}
                                {...placeholderProps}
                            />
                        )}
                        {Boolean(attachList.length) && (
                            <Flex spacing={{px: 4}} gap={2} wrap="wrap" shrink={0}>
                                <Button onClick={handleAddEmptyFile}>
                                    <Icon data={Plus} />
                                    {i18n('action_add-file')}
                                </Button>

                                <Button view="outlined" onClick={handleAddEmptyLink}>
                                    <Icon data={Plus} />
                                    {i18n('action_add-link')}
                                </Button>

                                <Button view="flat" onClick={handleDeleteAll}>
                                    {i18n('action_remove-all')}
                                </Button>
                            </Flex>
                        )}
                    </Flex>
                </TabPanel>

                <TabPanel className={block('panel')} value="Deleted">
                    <Flex spacing={{pt: 3}} width="100%" height="100%">
                        <AttachmentList
                            {...attachmentListProps}
                            className={block('list', attachmentListProps?.className)}
                            isDeleted
                            attachments={deletedAttachList}
                            onRevert={(attach) => handleRevertDelete(attach.id)}
                            onItemClick={onItemClick}
                        />
                    </Flex>
                </TabPanel>
            </TabProvider>
        </Box>
    );
};
