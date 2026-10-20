import React, {useEffect, useMemo, useRef, useState} from 'react';
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
    useFileInput,
} from '@gravity-ui/uikit';
import {AttachmentList, EditAttachmentItem} from '../../components/AttachmentList';
import type {EditLinkValues} from '../../types/attachmentsEditor';
import {AttachmentListPlaceholder} from '../../components/AttachmentListPlaceholder';
import type {AttachItem, AttachmentsProps} from '../../types/attachments';
import {createUuid} from '../../helpers/createUuid';
import {isObjectEqual} from '../../helpers/isObjectEqual';
import {stringRequiredValidator} from '../../components/AttachmentList/helpers/stringRequiredValidator';
import {objectLinkValidator} from '../../components/AttachmentList/helpers/objectLinkValidator';
import {Plus} from '@gravity-ui/icons';
import cn from 'bem-cn-lite';

import i18n from './i18n';

import './Attachments.scss';

type TabVariants = 'Current' | 'Deleted';

export type {AttachmentsProps, AttachItem} from '../../types/attachments';

const block = cn('qp-attachments');

const AttachmentsImpl = <T extends AttachItem>({
    tokens,
    tokenRequired,
    createAttachment,
    onSelectFile,
    nameValidator = stringRequiredValidator,
    linkValidator = objectLinkValidator,
    validateDuplicates = false,
    placeholderProps,
    attachmentListProps,
    onChange,
    onItemClick,
    attachments: customerAttachments,
    deletedAttachments: customerDeletedAttachments,
}: AttachmentsProps<T> & {createAttachment: (draft: AttachItem) => T}) => {
    const [currentTab, setCurrentTab] = useState<'Current' | 'Deleted'>('Current');

    const [innerAttachList, setInnerAttachList] = useState<T[]>(customerAttachments ?? []);
    const [innerDeletedAttachList, setInnerDeletedAttachList] = useState<T[]>(
        customerDeletedAttachments ?? [],
    );

    const [editingIds, setEditingIds] = useState<string[]>([]);
    const [wasAddedIds, setWasAddedIds] = useState<string[]>([]);
    const [wasEdited, setWasEditedIds] = useState<string[]>([]);

    const attachList = customerAttachments ?? innerAttachList;
    const deletedAttachList = customerDeletedAttachments ?? innerDeletedAttachList;

    const attachCount = useMemo(() => attachList.filter((a) => !a.isNew).length, [attachList]);

    const defaultAttachList = useRef(attachList);
    const latest = useRef({
        attachList,
        deletedAttachList,
        onChange,
        onSelectFile,
        nameValidator,
        validateDuplicates,
    });
    latest.current = {
        attachList,
        deletedAttachList,
        onChange,
        onSelectFile,
        nameValidator,
        validateDuplicates,
    };
    const mounted = useRef(true);
    const pending = useRef(false);
    const [fileState, setFileState] = useState<{
        file: File;
        status: 'pending' | 'success' | 'error';
        error?: string;
    }>();
    useEffect(() => {
        mounted.current = true;
        return () => {
            mounted.current = false;
        };
    }, []);

    const validateName = (name: unknown, id?: string) => {
        const error = nameValidator(name);
        if (error) return error;
        return validateDuplicates &&
            attachList.some((item) => item.id !== id && !item.isNew && item.name === name)
            ? i18n('alert_duplicate-name')
            : null;
    };

    const processFile = async (file: File) => {
        if (pending.current || !latest.current.onSelectFile) return;
        pending.current = true;
        setFileState({file, status: 'pending'});
        try {
            const item = await latest.current.onSelectFile(file);
            if (!mounted.current) return;
            const current = latest.current;
            if (
                [...current.attachList, ...current.deletedAttachList].some(
                    (existing) => existing.id === item.id,
                )
            ) {
                throw new Error(i18n('alert_invalid-id'));
            }
            const nameError =
                current.nameValidator(item.name) ||
                (current.validateDuplicates &&
                current.attachList.some(
                    (existing) => !existing.isNew && existing.name === item.name,
                )
                    ? i18n('alert_duplicate-name')
                    : null);
            if (nameError) throw new Error(nameError);
            const savedItem = {...item};
            delete savedItem.isNew;
            const next = [...current.attachList, savedItem];
            setInnerAttachList(next);
            current.onChange?.({attachments: next, deletedAttachments: current.deletedAttachList});
            setWasAddedIds((ids) => [...ids, item.id]);
            setFileState({file, status: 'success'});
        } catch (error) {
            if (mounted.current)
                setFileState({
                    file,
                    status: 'error',
                    error: error instanceof Error ? error.message : i18n('alert_file-error'),
                });
        } finally {
            pending.current = false;
        }
    };
    const {controlProps, triggerProps} = useFileInput({
        onUpdate: (files) => {
            if (files[0]) processFile(files[0]);
        },
    });

    const getDefaultValuesForLink = (linkId: string) => {
        const currentLink = attachList.find((a) => a.id === linkId);
        return {
            name: currentLink?.name ?? '',
            link: currentLink?.link ?? '',
            token: currentLink?.token ?? '',
        };
    };

    const runAfterAttachAdded = (attachId: string, newAttach: T) => {
        const editedAttach = defaultAttachList.current.find((a) => a.id === attachId);

        if (!editedAttach) return;

        if (isObjectEqual(editedAttach, newAttach)) {
            setWasEditedIds(wasEdited.filter((id) => id !== attachId));
            return;
        }

        setWasEditedIds([...wasEdited, attachId]);
    };

    const addEmptyAttachment = (values: Omit<AttachItem, 'id'>) => {
        const id = createUuid();
        const patchAttachList = [
            ...attachList.filter((a) => !a.isNew),
            {...createAttachment({id, ...values}), id, ...values},
        ];
        setInnerAttachList(patchAttachList);
        setWasAddedIds([...wasAddedIds, id]);
        setEditingIds([...editingIds, id]);
        onChange?.({attachments: patchAttachList, deletedAttachments: deletedAttachList});
    };

    const handleAddEmptyFile = () => addEmptyAttachment({name: '', isNew: true});
    const handleAddEmptyLink = () =>
        addEmptyAttachment({name: '', token: '', link: '', isNew: true});

    const acceptAttachment = (nextAttachment: AttachItem) => {
        if (!attachList.some((attach) => attach.id === nextAttachment.id)) return;
        const patchAttachList = attachList.map((attach) =>
            attach.id === nextAttachment.id
                ? {...attach, ...nextAttachment, isNew: undefined}
                : attach,
        );
        for (const item of patchAttachList) {
            if (item.id === nextAttachment.id) delete item.isNew;
        }
        setEditingIds(editingIds.filter((id) => id !== nextAttachment.id));
        setInnerAttachList(patchAttachList);
        onChange?.({attachments: patchAttachList, deletedAttachments: deletedAttachList});
        const saved = patchAttachList.find((item) => item.id === nextAttachment.id);
        if (saved) runAfterAttachAdded(nextAttachment.id, saved);
    };

    const handleAcceptFile = (id: string, name: string) => acceptAttachment({id, name});
    const handleAcceptLink = (id: string, link: EditLinkValues) => acceptAttachment({id, ...link});

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
                        {onSelectFile && (
                            <Flex direction="column" gap={2} spacing={{px: 4}}>
                                <input
                                    {...controlProps}
                                    hidden
                                    disabled={fileState?.status === 'pending'}
                                />
                                <Button
                                    {...triggerProps}
                                    disabled={fileState?.status === 'pending'}
                                >
                                    {i18n('action_select-file')}
                                </Button>
                                {fileState && (
                                    <Text role={fileState.status === 'error' ? 'alert' : 'status'}>
                                        {fileState.status === 'error'
                                            ? fileState.error
                                            : i18n(
                                                  fileState.status === 'pending'
                                                      ? 'value_pending'
                                                      : 'value_success',
                                              )}
                                    </Text>
                                )}
                                {fileState?.status === 'error' && (
                                    <Button onClick={() => processFile(fileState.file)}>
                                        {i18n('action_retry')}
                                    </Button>
                                )}
                            </Flex>
                        )}
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
                                                tokenRequired={tokenRequired}
                                                validator={(values, required) => {
                                                    const errors = linkValidator(values, required);
                                                    const nameError = validateName(
                                                        values.name,
                                                        attach.id,
                                                    );
                                                    return nameError
                                                        ? {...errors, name: nameError}
                                                        : errors;
                                                }}
                                                onCancel={() => handleCancelEdit(attach.id)}
                                            />
                                        );
                                    }

                                    return (
                                        <EditAttachmentItem
                                            type="file"
                                            defaultFileName={attach.name}
                                            validator={(name) => validateName(name, attach.id)}
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
                                addFileText={onSelectFile ? i18n('action_create-file') : undefined}
                                onAddFile={handleAddEmptyFile}
                                onAddLink={handleAddEmptyLink}
                                {...placeholderProps}
                            />
                        )}
                        {Boolean(attachList.length) && (
                            <Flex spacing={{px: 4}} gap={2} wrap="wrap" shrink={0}>
                                <Button onClick={handleAddEmptyFile}>
                                    <Icon data={Plus} />
                                    {i18n(onSelectFile ? 'action_create-file' : 'action_add-file')}
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

export function Attachments<T extends AttachItem = AttachItem>(
    props: AttachmentsProps<T>,
): React.JSX.Element;
/** Preserve legacy calls that pass structurally extended data using base callbacks. */
export function Attachments(props: AttachmentsProps): React.JSX.Element;
export function Attachments(props: AttachmentsProps) {
    return (
        <AttachmentsImpl
            {...props}
            createAttachment={props.createAttachment ?? ((draft) => draft)}
        />
    );
}
