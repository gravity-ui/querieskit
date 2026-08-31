import React, {useRef, useState} from 'react';
import {Button, Flex, Icon, Tab, TabList, TabPanel, TabProvider, Text} from '@gravity-ui/uikit';
import {AttachmentList, AttachmentListPlaceholder, EditAttachmentItem} from '../../components';
import {createUuid} from '../../helpers/createUuid';
import {isObjectEqual} from '../../helpers/isObjectEqual';
import {Plus} from '@gravity-ui/icons';
import type {
    AttachmentItemProps,
    AttachmentListPlaceholderProps,
    AttachmentListProps,
    EditLinkValues,
} from '../../components';
import cn from 'bem-cn-lite';

import i18n from './i18n';

import './Attachments.scss';

type TabVariants = 'Current' | 'Deleted';

export type AttachItem = AttachmentItemProps['attachment'] & {token?: string};

export type AttachmentsProps = {
    tokens?: {value: string; title: string}[];
    placeholderProps?: Omit<AttachmentListPlaceholderProps, 'onAddFile' | 'onAddLink'>;
    attachmentListProps?: Pick<AttachmentListProps, 'className'>;
    attachments?: AttachItem[];
    deletedAttachments?: AttachItem[];
    onChange?: (payload: {attachments: AttachItem[]; deletedAttachments: AttachItem[]}) => void;
};

const block = cn('qp-attachments');

export const Attachments = ({
    tokens,
    placeholderProps,
    attachmentListProps,
    onChange,
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

    const oldAttachList = useRef(attachList);

    const getDefaultValuesForLink = (linkId: string) => {
        const currentLink = attachList.find((a) => a.id === linkId);
        return {
            name: currentLink?.name ?? '',
            link: currentLink?.link ?? '',
            token: currentLink?.token ?? '',
        };
    };

    const handleUpdateEditedState = (attachId: string, newAttach: AttachItem) => {
        const patchAttach = oldAttachList.current.find((a) => a.id === attachId);
        if (!patchAttach) return;
        const isNewAttach = wasAddedIds.includes(attachId);
        if (isNewAttach) return;
        if (isObjectEqual(patchAttach, newAttach)) {
            setWasEditedIds(wasEdited.filter((id) => id !== attachId));
            return;
        }
        setWasEditedIds([...wasEdited, attachId]);
    };

    const handleAddEmptyFile = () => {
        const id = createUuid();

        const patchAttachList = [...innerAttachList, {id, name: ''}];

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

        const patchAttachList = [...innerAttachList, {id, name: '', token: '', link: ''}];

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
            if (attach.id === fileId) return {...attach, name: fileName};
            return attach;
        });

        setEditingIds(patchEditingIds);
        setInnerAttachList(patchAttachList);

        onChange?.({
            attachments: patchAttachList,
            deletedAttachments: deletedAttachList,
        });

        handleUpdateEditedState(fileId, {id: fileId, name: fileName});
    };

    const handleAcceptLink = (linkId: string, link: EditLinkValues) => {
        const patchedLink = attachList.find((a) => a.id === linkId);
        if (!patchedLink) return;

        const patchEditingIds = editingIds.filter((id) => id !== linkId);
        const patchAttachList = attachList.map((attach) => {
            if (attach.id === linkId) return {...attach, ...link};
            return attach;
        });

        setEditingIds(patchEditingIds);
        setInnerAttachList(patchAttachList);

        onChange?.({
            attachments: patchAttachList,
            deletedAttachments: deletedAttachList,
        });

        handleUpdateEditedState(linkId, {id: linkId, ...link});
    };

    const handleCancelEditFile = (fileId: string) => {
        const patchEditingIds = editingIds.filter((id) => id !== fileId);
        const patchAttachList = attachList.filter((attach) => Boolean(attach.name));

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
        const patchDeletedAttachList = [...attachList];

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
        <Flex className={block()} direction="column" width="100%" height="100%">
            <TabProvider value={currentTab} onUpdate={(tab) => setCurrentTab(tab as TabVariants)}>
                <TabList>
                    <Tab className={block('tab')} value="Current">
                        <Text variant="body-1">Current</Text>
                        <Text color="hint" variant="body-1">
                            {attachList.length}
                        </Text>
                    </Tab>
                    <Tab className={block('tab')} value="Deleted">
                        <Text variant="body-1">Deleted</Text>
                        <Text color="hint" variant="body-1">
                            {deletedAttachList.length}
                        </Text>
                    </Tab>
                </TabList>

                <TabPanel className={block('panel')} value="Current">
                    <Flex spacing={{pt: 3}} direction="column" width="100%" height="100%">
                        {innerAttachList.length ? (
                            <AttachmentList
                                {...attachmentListProps}
                                attachments={attachList}
                                wasAddedIds={wasAddedIds}
                                wasEditedIds={wasEdited}
                                editingIds={editingIds}
                                onEdit={(attach) => handleEdit(attach.id)}
                                onDelete={(attach) => handleDelete(attach.id)}
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
                                                onCancel={() => handleCancelEditFile(attach.id)}
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
                                            onCancel={() => handleCancelEditFile(attach.id)}
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
                        {Boolean(innerAttachList.length) && (
                            <Flex gap={2}>
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
                            isDeleted
                            attachments={deletedAttachList}
                            onRevert={(attach) => handleRevertDelete(attach.id)}
                        />
                    </Flex>
                </TabPanel>
            </TabProvider>
        </Flex>
    );
};
