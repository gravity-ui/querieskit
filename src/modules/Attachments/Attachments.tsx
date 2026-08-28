import React, {useState} from 'react';
import {Button, Flex, Icon, Tab, TabList, TabPanel, TabProvider} from '@gravity-ui/uikit';
import {AttachmentList, AttachmentListPlaceholder, EditAttachmentItem} from '../../components';
import {createUuid} from '../../helpers/createUuid';
import {Plus} from '@gravity-ui/icons';
import type {AttachmentListPlaceholderProps} from '../../components';
import type {AttachmentItemProps, EditLinkValues} from '../../components/AttachmentList';
import cn from 'bem-cn-lite';
import './Attachments.scss';

type TabVariants = 'Current' | 'Deleted';

type AttachItem = AttachmentItemProps['attachment'] & {token?: string};

type AttachmentsProps = {
    tokens?: {value: string; title: string}[];
    placeholderProps?: Omit<AttachmentListPlaceholderProps, 'onAddFile' | 'onAddLink'>;
};

const block = cn('qp-attachments');

export const Attachments = ({tokens, placeholderProps}: AttachmentsProps) => {
    const [currentTab, setCurrentTab] = useState<'Current' | 'Deleted'>('Current');

    const [innerAttachList, setInnerAttachList] = useState<AttachItem[]>([]);
    const [innerDeletedAttachList, setInnerDeletedAttachList] = useState<AttachItem[]>([]);

    const [editingIds, setEditingIds] = useState<string[]>([]);
    const [wasAddedIds, setWasAddedIds] = useState<string[]>([]);
    const [wasEdited, setWasEditedIds] = useState<string[]>([]);

    const attachList = innerAttachList;
    const deletedAttachList = innerDeletedAttachList;

    const handleAddEmptyFile = () => {
        const id = createUuid();

        setWasAddedIds([...wasAddedIds, id]);
        setInnerAttachList([...innerAttachList, {id, name: ''}]);
        setEditingIds([...editingIds, id]);
    };

    const handleAddEmptyLink = () => {
        const id = createUuid();

        setWasAddedIds([...wasAddedIds, id]);
        setInnerAttachList([...innerAttachList, {id, name: '', token: '', link: ''}]);
        setEditingIds([...editingIds, id]);
    };

    const handleAcceptFile = (fileId: string, fileName: string) => {
        const patchAttachList = attachList.map((attach) => {
            if (attach.id === fileId) return {...attach, name: fileName};
            return attach;
        });
        const patchEditingIds = editingIds.filter((id) => id !== fileId);

        setInnerAttachList(patchAttachList);
        setEditingIds(patchEditingIds);
    };

    const handleCancelEditFile = (fileId: string) => {
        const patchEditingIds = editingIds.filter((id) => id !== fileId);
        const pathAttachList = attachList.filter((attach) => Boolean(attach.name));

        setInnerAttachList(pathAttachList);
        setEditingIds(patchEditingIds);
    };

    const handleAcceptLink = (linkId: string, link: EditLinkValues) => {
        const patchAttachList = attachList.map((attach) => {
            if (attach.id === linkId) {
                return {...attach, ...link};
            }
            return attach;
        });
        const patchEditingIds = editingIds.filter((id) => id !== linkId);

        setInnerAttachList(patchAttachList);
        setEditingIds(patchEditingIds);
    };

    const handleEdit = (editAttachId: string) => {
        const patchEditingIds = [...editingIds, editAttachId];
        const patchWasEditedIds = wasAddedIds.includes(editAttachId)
            ? wasEdited
            : [...wasEdited, editAttachId];

        setEditingIds(patchEditingIds);
        setWasEditedIds(patchWasEditedIds);
    };

    const handleDelete = (attachId: string) => {
        const deletedAttachmen = attachList.find((a) => a.id === attachId);

        if (!deletedAttachmen) return;

        const patchAttachList = attachList.filter((a) => a.id !== attachId);
        const patchDeletedAttachList = [...deletedAttachList, deletedAttachmen];

        setInnerAttachList(patchAttachList);
        setInnerDeletedAttachList(patchDeletedAttachList);
    };

    const handleDeleteAll = () => {
        setInnerDeletedAttachList([...attachList]);
        setInnerAttachList([]);
    };

    const handleRevertDelete = (attachId: string) => {
        const revertAttach = deletedAttachList.find((a) => a.id === attachId);

        if (!revertAttach) return;

        const patchAttachList = [...attachList, revertAttach];
        const patchDeletedAttachList = deletedAttachList.filter((a) => a.id !== attachId);

        setInnerAttachList(patchAttachList);
        setInnerDeletedAttachList(patchDeletedAttachList);
    };

    const getDefaultValuesForLink = (linkId: string) => {
        const currentLink = attachList.find((a) => a.id === linkId);
        return {
            name: currentLink?.name ?? '',
            link: currentLink?.link ?? '',
            token: currentLink?.token ?? '',
        };
    };

    return (
        <Flex className={block()} direction="column" width="100%" height="100%">
            <TabProvider value={currentTab} onUpdate={(tab) => setCurrentTab(tab as TabVariants)}>
                <TabList>
                    <Tab value="Current" content="Current 0"></Tab>
                    <Tab value="Deleted" content="Deleted 0"></Tab>
                </TabList>

                <TabPanel className={block('panel')} value="Current">
                    <Flex spacing={{pt: 3}} direction="column" width="100%" height="100%">
                        {innerAttachList.length ? (
                            <AttachmentList
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
                                    File
                                </Button>

                                <Button view="outlined" onClick={handleAddEmptyLink}>
                                    <Icon data={Plus} />
                                    Link
                                </Button>

                                <Button view="flat" onClick={handleDeleteAll}>
                                    Remove all
                                </Button>
                            </Flex>
                        )}
                    </Flex>
                </TabPanel>

                <TabPanel className={block('panel')} value="Deleted">
                    <Flex spacing={{pt: 3}} width="100%" height="100%">
                        <AttachmentList
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
