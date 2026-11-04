import React, {useEffect, useRef, useState} from 'react';
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
import type {
    AttachItem,
    AttachmentDraft,
    AttachmentsChange,
    AttachmentsProps,
    AttachmentsValue,
} from '../../types/attachments';
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
    defaultAttachments = [],
    defaultDeletedAttachments = [],
    drafts: customerDrafts,
    defaultDrafts = [],
    onDraftsChange,
}: AttachmentsProps<T> & {createAttachment: (draft: AttachItem) => T}) => {
    const [currentTab, setCurrentTab] = useState<'Current' | 'Deleted'>('Current');

    const [innerAttachList, setInnerAttachList] = useState<T[]>(defaultAttachments);
    const [innerDeletedAttachList, setInnerDeletedAttachList] =
        useState<T[]>(defaultDeletedAttachments);

    const [innerDrafts, setInnerDrafts] = useState<AttachmentDraft[]>(defaultDrafts);
    const drafts = customerDrafts ?? innerDrafts;
    const setDrafts = (next: AttachmentDraft[]) => {
        if (customerDrafts === undefined) setInnerDrafts(next);
        onDraftsChange?.(next);
    };

    const [wasAddedIds, setWasAddedIds] = useState<string[]>([]);
    const [wasEdited, setWasEditedIds] = useState<string[]>([]);
    const [restoreErrorId, setRestoreErrorId] = useState<string>();
    const [draftError, setDraftError] = useState<{id: string; message: string}>();

    const attachList = customerAttachments ?? innerAttachList;
    const deletedAttachList = customerDeletedAttachments ?? innerDeletedAttachList;

    const attachCount = attachList.length;
    const draftIds = new Set<string>();
    let invalidDraftIdentity = false;
    const editableDrafts = drafts.filter(({mode, value}) => {
        const duplicate = draftIds.has(value.id);
        draftIds.add(value.id);
        const collision =
            mode === 'create' &&
            [...attachList, ...deletedAttachList].some((item) => item.id === value.id);
        if (duplicate || collision) {
            invalidDraftIdentity = true;
            return false;
        }
        return mode === 'create' || attachList.some((item) => item.id === value.id);
    });
    const editingIds = editableDrafts.map(({value}) => value.id);
    const displayedAttachments: AttachItem[] = [
        ...attachList,
        ...editableDrafts.filter(({mode}) => mode === 'create').map(({value}) => value),
    ];
    const emit = (next: AttachmentsValue<T>, change: AttachmentsChange<T>) => {
        if (customerAttachments === undefined) setInnerAttachList(next.attachments);
        if (customerDeletedAttachments === undefined)
            setInnerDeletedAttachList(next.deletedAttachments);
        onChange?.(next, change);
    };

    const defaultAttachList = useRef(attachList);
    const latest = useRef({
        attachList,
        deletedAttachList,
        onChange,
        onSelectFile,
        nameValidator,
        validateDuplicates,
        emit,
        drafts,
    });
    latest.current = {
        attachList,
        deletedAttachList,
        onChange,
        onSelectFile,
        nameValidator,
        validateDuplicates,
        emit,
        drafts,
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

    const hasDuplicateName = (name: unknown, id?: string) =>
        validateDuplicates && attachList.some((item) => item.id !== id && item.name === name);

    const restoreError = deletedAttachList.some(
        (item) => item.id === restoreErrorId && hasDuplicateName(item.name, item.id),
    );

    const validateName = (name: unknown, id?: string) => {
        const error = nameValidator(name);
        if (error) return error;
        return hasDuplicateName(name, id) ? i18n('alert_duplicate-name') : null;
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
                [
                    ...current.attachList,
                    ...current.deletedAttachList,
                    ...current.drafts.map(({value}) => value),
                ].some((existing) => existing.id === item.id)
            ) {
                throw new Error(i18n('alert_invalid-id'));
            }
            const nameError =
                current.nameValidator(item.name) ||
                (current.validateDuplicates &&
                current.attachList.some((existing) => existing.name === item.name)
                    ? i18n('alert_duplicate-name')
                    : null);
            if (nameError) throw new Error(nameError);
            const savedItem = {...item};
            const next = [...current.attachList, savedItem];
            current.emit(
                {attachments: next, deletedAttachments: current.deletedAttachList},
                {type: 'create', item: savedItem},
            );
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
        const value = {id: createUuid(), ...values};
        setDrafts([...drafts, {mode: 'create', value}]);
    };
    const handleAddEmptyFile = () => addEmptyAttachment({name: ''});
    const handleAddEmptyLink = () => addEmptyAttachment({name: '', token: '', link: ''});
    const updateDraft = (id: string, patch: Partial<AttachItem>) => {
        setDraftError(undefined);
        setDrafts(
            drafts.map((draft) =>
                draft.value.id === id ? {...draft, value: {...draft.value, ...patch, id}} : draft,
            ),
        );
    };
    const discardDraft = (id: string) => {
        setDraftError(undefined);
        setDrafts(drafts.filter(({value}) => value.id !== id));
    };
    const acceptAttachment = (value: AttachItem) => {
        const draft = editableDrafts.find((item) => item.value.id === value.id);
        if (!draft) return;
        const previous = attachList.find((item) => item.id === value.id);
        if (draft.mode === 'update' && !previous) return;
        if (
            draft.mode === 'create' &&
            [...attachList, ...deletedAttachList].some((item) => item.id === value.id)
        )
            return;
        let item: T;
        if (draft.mode === 'create') {
            try {
                item = {...createAttachment({...value}), ...value};
            } catch (error) {
                setDraftError({
                    id: value.id,
                    message: error instanceof Error ? error.message : i18n('alert_create-error'),
                });
                return;
            }
        } else {
            if (!previous) return;
            item = {...previous, ...value};
        }
        const attachments =
            draft.mode === 'create'
                ? [...attachList, item]
                : attachList.map((existing) => (existing.id === item.id ? item : existing));
        emit(
            {attachments, deletedAttachments: deletedAttachList},
            previous ? {type: 'update', item, previous} : {type: 'create', item},
        );
        discardDraft(value.id);
        if (draft.mode === 'create') setWasAddedIds([...wasAddedIds, item.id]);
        else runAfterAttachAdded(item.id, item);
    };
    const handleAcceptFile = (id: string, name: string) => acceptAttachment({id, name});
    const handleAcceptLink = (id: string, link: EditLinkValues) => acceptAttachment({id, ...link});
    const handleCancelEdit = discardDraft;
    const handleEdit = (id: string) => {
        const item = attachList.find((value) => value.id === id);
        if (!item || drafts.some(({value}) => value.id === id)) return;
        const value: AttachItem = {id, name: item.name};
        if (item.link !== undefined) value.link = item.link;
        if (item.token !== undefined) value.token = item.token;
        setDrafts([...drafts, {mode: 'update', value}]);
    };

    const handleDelete = (attachId: string) => {
        const deletedAttachmen = attachList.find((a) => a.id === attachId);

        if (!deletedAttachmen) return;

        const patchAttachList = attachList.filter((a) => a.id !== attachId);
        const patchDeletedAttachList = [...deletedAttachList, deletedAttachmen];

        emit(
            {attachments: patchAttachList, deletedAttachments: patchDeletedAttachList},
            {type: 'delete', item: deletedAttachmen},
        );
        discardDraft(attachId);
    };

    const handleDeleteAll = () => {
        const patchAttachList: never[] = [];
        const patchDeletedAttachList = [...deletedAttachList, ...attachList];

        emit(
            {attachments: patchAttachList, deletedAttachments: patchDeletedAttachList},
            {type: 'delete-all', items: attachList},
        );
        setDrafts([]);
    };

    const handleRevertDelete = (attachId: string) => {
        const revertAttach = deletedAttachList.find((a) => a.id === attachId);

        if (!revertAttach) return;

        if (hasDuplicateName(revertAttach.name, revertAttach.id)) {
            setRestoreErrorId(attachId);
            return;
        }

        setRestoreErrorId(undefined);
        const patchAttachList = [...attachList, revertAttach];
        const patchDeletedAttachList = deletedAttachList.filter((a) => a.id !== attachId);

        emit(
            {attachments: patchAttachList, deletedAttachments: patchDeletedAttachList},
            {type: 'restore', item: revertAttach},
        );
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
                        {(invalidDraftIdentity ||
                            (draftError &&
                                drafts.some(({value}) => value.id === draftError.id))) && (
                            <Box spacing={{px: 4}}>
                                <Text role="alert" color="danger">
                                    {invalidDraftIdentity
                                        ? i18n('alert_invalid-id')
                                        : draftError?.message}
                                </Text>
                            </Box>
                        )}
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
                        {displayedAttachments.length ? (
                            <AttachmentList
                                {...attachmentListProps}
                                className={block('list', attachmentListProps?.className)}
                                attachments={displayedAttachments}
                                wasAddedIds={wasAddedIds}
                                wasEditedIds={wasEdited}
                                editingIds={editingIds}
                                onEdit={(attach) => handleEdit(attach.id)}
                                onDelete={(attach) => handleDelete(attach.id)}
                                onItemClick={(item, index, fromKeyboard, event) => {
                                    const original = attachList.find(
                                        (value) => value.id === item.id,
                                    );
                                    if (original)
                                        onItemClick?.(original, index, fromKeyboard, event);
                                }}
                                renderEditForm={(attach) => {
                                    const draft = editableDrafts.find(
                                        ({value}) => value.id === attach.id,
                                    );
                                    if (!draft) return null;
                                    const isLink = typeof draft.value.link === 'string';

                                    if (isLink) {
                                        const linkValues = {
                                            name: draft.value.name,
                                            link: draft.value.link ?? '',
                                            token: draft.value.token ?? '',
                                        };

                                        return (
                                            <EditAttachmentItem
                                                type="link"
                                                onAccept={(link) =>
                                                    handleAcceptLink(attach.id, link)
                                                }
                                                values={linkValues}
                                                onChange={(values) =>
                                                    updateDraft(attach.id, values)
                                                }
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
                                            fileName={draft.value.name}
                                            onChangeFileName={(name) =>
                                                updateDraft(attach.id, {name})
                                            }
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
                        {Boolean(displayedAttachments.length) && (
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
                    <Flex spacing={{pt: 3}} direction="column" gap={3} width="100%" height="100%">
                        {restoreError && (
                            <Box spacing={{px: 4}}>
                                <Text role="alert" color="danger">
                                    {i18n('alert_duplicate-name')}
                                </Text>
                            </Box>
                        )}
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
