import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
    Alert,
    Button,
    Dialog,
    DropdownMenu,
    Flex,
    Icon,
    Tab,
    TabList,
    TabPanel,
    TabProvider,
    Text,
    TextInput,
} from '@gravity-ui/uikit';
import PlusIcon from '@gravity-ui/icons/svgs/plus.svg';
import PencilIcon from '@gravity-ui/icons/svgs/pencil.svg';
import SaveIcon from '@gravity-ui/icons/svgs/floppy-disk.svg';
import UpdateIcon from '@gravity-ui/icons/svgs/arrows-rotate-right.svg';
import TrashBinIcon from '@gravity-ui/icons/svgs/trash-bin.svg';
import FullscreenIcon from '@gravity-ui/icons/svgs/square-dashed.svg';
import CloseIcon from '@gravity-ui/icons/svgs/xmark.svg';
import cn from 'bem-cn-lite';
import {EmptyContent} from '../../components/EmptyContent';
import type {QueryParameter, QueryParametersProps} from '../../types/queryParameters';
import {createId, formatType, validateParameters} from './helpers/parameters';
import i18n from './i18n';
import {ParameterRow} from './internal/ParameterRow';
import './QueryParameters.scss';

const block = cn('qp-query-parameters');
type Session = {baseline: string; original: QueryParameter[]; draft: QueryParameter[]};
const clone = (value: QueryParameter[]): QueryParameter[] => JSON.parse(JSON.stringify(value));

export function QueryParameters({
    value,
    onChange,
    onUpdate,
    expanded = false,
    onExpandedChange,
    onClose,
    errors,
    disabled = false,
    loading = false,
    className,
}: QueryParametersProps) {
    const [session, setSession] = useState<Session | null>(null);
    const [tab, setTab] = useState('current');
    const [search, setSearch] = useState('');
    const [attempted, setAttempted] = useState(false);
    const [pending, setPending] = useState<'save' | 'update' | null>(null);
    const [failure, setFailure] = useState<'save' | 'update' | null>(null);
    const [confirmUpdate, setConfirmUpdate] = useState(false);
    const [pendingValues, setPendingValues] = useState<Set<string>>(() => new Set());
    const [focusTarget, setFocusTarget] = useState<string | null>(null);
    const root = useRef<HTMLDivElement>(null);
    const addButton = useRef<HTMLButtonElement>(null);
    const editButton = useRef<HTMLButtonElement>(null);
    const mounted = useRef(true);
    const operation = useRef(false);
    const editing = session !== null;
    const locked = disabled || loading || pending !== null;
    const serialized = JSON.stringify(value);
    const conflict = session !== null && session.baseline !== serialized;
    const parameters = session?.draft ?? value;
    const current = parameters.filter((parameter) => !parameter.deleted);
    const deleted = parameters.filter((parameter) => parameter.deleted);
    const validation = attempted ? validateParameters(parameters) : {};
    const query = search.trim().toLocaleLowerCase();
    const matches = (parameter: QueryParameter) =>
        `${parameter.name} ${formatType(parameter.type)}`.toLocaleLowerCase().includes(query);

    useEffect(() => {
        mounted.current = true;
        return () => {
            mounted.current = false;
        };
    }, []);
    useEffect(() => {
        if (!focusTarget) return;
        if (focusTarget === 'add') addButton.current?.focus();
        else if (focusTarget === 'edit') (editButton.current ?? addButton.current)?.focus();
        else {
            const row = [
                ...(root.current?.querySelectorAll<HTMLElement>('[data-parameter-id]') ?? []),
            ].find((element) => element.dataset.parameterId === focusTarget);
            row?.querySelector<HTMLInputElement>('input')?.focus();
        }
        setFocusTarget(null);
    }, [focusTarget, session]);

    const reportValidity = useCallback((id: string, path: string, invalid: boolean) => {
        const key = JSON.stringify([id, path]);
        setPendingValues((previous) => {
            if (previous.has(key) === invalid) return previous;
            const next = new Set(previous);
            if (invalid) next.add(key);
            else next.delete(key);
            return next;
        });
    }, []);
    const begin = () => {
        if (locked) return;
        setSession({baseline: serialized, original: clone(value), draft: clone(value)});
        setAttempted(false);
        setFailure(null);
        setSearch('');
        setTab('current');
        setFocusTarget(current[0]?.id ?? 'add');
    };
    const cancel = () => {
        if (locked) return;
        setSession(null);
        setAttempted(false);
        setFailure(null);
        setPendingValues(new Set());
        setFocusTarget('edit');
    };
    const add = () => {
        if (locked || conflict) return;
        const ids = new Set(parameters.map((parameter) => parameter.id));
        let id = createId();
        while (ids.has(id)) id = createId();
        const parameter: QueryParameter = {id, name: '', type: {kind: 'String'}, value: ''};
        setSession((previous) => ({
            baseline: previous?.baseline ?? serialized,
            original: previous?.original ?? clone(value),
            draft: [...(previous?.draft ?? clone(value)), parameter],
        }));
        setSearch('');
        setTab('current');
        setFailure(null);
        setFocusTarget(id);
    };
    const change = (parameter: QueryParameter) => {
        if (locked) return;
        setSession(
            (previous) =>
                previous && {
                    ...previous,
                    draft: previous.draft.map((item) =>
                        item.id === parameter.id ? parameter : item,
                    ),
                },
        );
        setFailure(null);
    };
    const remove = (id: string) => {
        if (locked) return;
        setSession((previous) => {
            if (!previous) return previous;
            const existed = previous.original.some((parameter) => parameter.id === id);
            return {
                ...previous,
                draft: existed
                    ? previous.draft.map((parameter) =>
                          parameter.id === id ? {...parameter, deleted: true} : parameter,
                      )
                    : previous.draft.filter((parameter) => parameter.id !== id),
            };
        });
        setFocusTarget('add');
    };
    const commit = async (next: QueryParameter[]) => {
        if (locked || operation.current || conflict) return;
        operation.current = true;
        setPending('save');
        setFailure(null);
        try {
            await onChange(clone(next));
            if (mounted.current) {
                setSession(null);
                setAttempted(false);
                setPendingValues(new Set());
                setFocusTarget('edit');
            }
        } catch {
            if (mounted.current) setFailure('save');
        } finally {
            operation.current = false;
            if (mounted.current) setPending(null);
        }
    };
    const save = () => {
        if (!session || locked || conflict) return;
        setAttempted(true);
        const nextErrors = validateParameters(session.draft);
        if (Object.keys(nextErrors).length || pendingValues.size) {
            setTab('current');
            setSearch('');
            return;
        }
        commit(session.draft);
    };
    const update = async () => {
        if (!onUpdate || locked || operation.current) return;
        setConfirmUpdate(false);
        operation.current = true;
        setPending('update');
        setFailure(null);
        try {
            await onUpdate();
            if (mounted.current) {
                setSession(null);
                setAttempted(false);
                setPendingValues(new Set());
                setFocusTarget('edit');
            }
        } catch {
            if (mounted.current) setFailure('update');
        } finally {
            operation.current = false;
            if (mounted.current) setPending(null);
        }
    };

    return (
        <TabProvider value={tab} onUpdate={setTab}>
            <Flex
                ref={root}
                direction="column"
                className={block({expanded}, className)}
                aria-busy={loading || pending !== null}
            >
                {(onExpandedChange || onClose) && (
                    <Flex alignItems="center" className={block('header')}>
                        <Text variant="subheader-1" className={block('title')}>
                            {i18n('title_parameters')}
                        </Text>
                        {onExpandedChange && (
                            <Button
                                view="flat-secondary"
                                selected={expanded}
                                aria-pressed={expanded}
                                aria-label={i18n(
                                    expanded ? 'action_collapse-panel' : 'action_expand-panel',
                                )}
                                title={i18n(
                                    expanded ? 'action_collapse-panel' : 'action_expand-panel',
                                )}
                                onClick={() => onExpandedChange(!expanded)}
                            >
                                <Icon data={FullscreenIcon} size={16} />
                            </Button>
                        )}
                        {onClose && (
                            <Button
                                view="flat-secondary"
                                aria-label={i18n('action_close-panel')}
                                title={i18n('action_close-panel')}
                                onClick={() => {
                                    if (expanded) onExpandedChange?.(false);
                                    onClose();
                                }}
                            >
                                <Icon data={CloseIcon} size={16} />
                            </Button>
                        )}
                    </Flex>
                )}
                <TabList
                    value={tab}
                    onUpdate={setTab}
                    className={block('tabs')}
                    aria-label={i18n('title_parameters')}
                >
                    <Tab value="current" counter={current.length}>
                        {i18n('title_current')}
                    </Tab>
                    <Tab value="deleted" counter={deleted.length}>
                        {i18n('title_deleted')}
                    </Tab>
                </TabList>
                <Flex direction="column" gap={3} className={block('body')}>
                    {parameters.length > 0 && (
                        <TextInput
                            className={block('search')}
                            value={search}
                            onUpdate={setSearch}
                            hasClear
                            placeholder={i18n('context_search')}
                            controlProps={{'aria-label': i18n('context_search')}}
                        />
                    )}
                    {conflict && (
                        <Alert
                            theme="warning"
                            message={i18n('alert_conflict')}
                            actions={
                                <Button onClick={cancel} disabled={locked}>
                                    {i18n('action_reload')}
                                </Button>
                            }
                        />
                    )}
                    {failure && (
                        <div role="alert">
                            <Alert
                                theme="danger"
                                message={i18n(
                                    failure === 'save'
                                        ? 'alert_save-failed'
                                        : 'alert_update-failed',
                                )}
                            />
                        </div>
                    )}
                    {attempted && Object.keys(validation).length > 0 && (
                        <div role="alert">
                            <Alert theme="danger" message={i18n('alert_invalid-form')} />
                        </div>
                    )}
                    {pendingValues.size > 0 && (
                        <Alert theme="info" message={i18n('alert_pending-raw')} />
                    )}
                    <TabPanel value="current" hidden={tab !== 'current'} className={block('panel')}>
                        {current.length === 0 ? (
                            <EmptyContent
                                variant="no-data"
                                title={i18n('title_no-parameters')}
                                description={i18n('context_add-first')}
                                className={block('empty')}
                            />
                        ) : (
                            <>
                                {!current.some(matches) && (
                                    <EmptyContent
                                        variant="nothing-found"
                                        title={i18n('title_nothing-found')}
                                        description={i18n('context_change-search')}
                                        className={block('empty')}
                                    />
                                )}
                                <Flex direction="column" gap={5}>
                                    {current.map((parameter, index) => {
                                        const original = session?.original.find(
                                            (item) => item.id === parameter.id,
                                        );
                                        const localErrors = validation[parameter.id];
                                        const externalErrors = errors?.[parameter.id];
                                        return (
                                            <div
                                                key={`${editing}-${parameter.id}`}
                                                hidden={!matches(parameter)}
                                                data-parameter-id={parameter.id}
                                            >
                                                <ParameterRow
                                                    expanded={expanded}
                                                    parameter={parameter}
                                                    index={index + 1}
                                                    editing={editing}
                                                    disabled={locked}
                                                    errors={{
                                                        ...externalErrors,
                                                        ...localErrors,
                                                        value: {
                                                            ...externalErrors?.value,
                                                            ...localErrors?.value,
                                                        },
                                                    }}
                                                    onChange={change}
                                                    onRemove={() => remove(parameter.id)}
                                                    initialParameter={original}
                                                    isNew={!original}
                                                    onValidityChange={(path, invalid) =>
                                                        reportValidity(parameter.id, path, invalid)
                                                    }
                                                />
                                            </div>
                                        );
                                    })}
                                </Flex>
                            </>
                        )}
                        <Button
                            ref={addButton}
                            className={block('add')}
                            onClick={add}
                            disabled={locked || conflict}
                        >
                            <Icon data={PlusIcon} size={16} />
                            {i18n('action_add-parameter')}
                        </Button>
                    </TabPanel>
                    <TabPanel value="deleted" hidden={tab !== 'deleted'} className={block('panel')}>
                        {deleted.length === 0 ? (
                            <EmptyContent
                                variant="no-data"
                                title={i18n('title_no-deleted')}
                                description={i18n('context_deleted')}
                                className={block('empty')}
                            />
                        ) : (
                            <>
                                {!deleted.some(matches) && (
                                    <EmptyContent
                                        variant="nothing-found"
                                        title={i18n('title_nothing-found')}
                                        description={i18n('context_change-search')}
                                        className={block('empty')}
                                    />
                                )}
                                <Flex direction="column" gap={5}>
                                    {deleted.map((parameter, index) => (
                                        <div key={parameter.id} hidden={!matches(parameter)}>
                                            <ParameterRow
                                                parameter={parameter}
                                                index={index + 1}
                                                editing={false}
                                                disabled={locked}
                                                onChange={() => undefined}
                                                onRemove={() => undefined}
                                                onValidityChange={() => undefined}
                                            />
                                        </div>
                                    ))}
                                </Flex>
                            </>
                        )}
                    </TabPanel>
                </Flex>
                <Flex gap={2} wrap className={block('footer')}>
                    {editing ? (
                        <>
                            <Button
                                onClick={save}
                                disabled={locked || conflict || pendingValues.size > 0}
                                loading={pending === 'save'}
                            >
                                <Icon data={SaveIcon} size={16} />
                                {i18n('action_save')}
                            </Button>
                        </>
                    ) : tab === 'current' && current.length > 0 ? (
                        <Button ref={editButton} onClick={begin} disabled={locked}>
                            <Icon data={PencilIcon} size={16} />
                            {i18n('action_edit')}
                        </Button>
                    ) : tab === 'deleted' && deleted.length > 0 ? (
                        <Button
                            view="flat-secondary"
                            onClick={() => commit(value.filter((parameter) => !parameter.deleted))}
                            disabled={locked}
                            loading={pending === 'save'}
                        >
                            <Icon data={TrashBinIcon} size={16} />
                            {i18n('action_remove-all')}
                        </Button>
                    ) : null}
                    {onUpdate && tab === 'current' && (
                        <Button
                            view="outlined"
                            onClick={() => (editing ? setConfirmUpdate(true) : update())}
                            disabled={locked}
                            loading={pending === 'update'}
                        >
                            <Icon data={UpdateIcon} size={16} />
                            {i18n('action_update')}
                        </Button>
                    )}
                    {editing && (
                        <DropdownMenu
                            disabled={locked}
                            switcherWrapperClassName={block('editing-actions')}
                            defaultSwitcherProps={{
                                'aria-label': i18n('action_editing-actions'),
                                view: 'flat-secondary',
                            }}
                            items={[{text: i18n('action_cancel'), action: cancel}]}
                        />
                    )}
                </Flex>
                <Dialog
                    open={confirmUpdate}
                    onClose={() => setConfirmUpdate(false)}
                    aria-label={i18n('title_confirm-update')}
                    maxWidth="s"
                    fullWidth
                >
                    <Dialog.Header caption={i18n('title_confirm-update')} />
                    <Dialog.Body>{i18n('context_confirm-update')}</Dialog.Body>
                    <Dialog.Footer
                        textButtonApply={i18n('action_update')}
                        textButtonCancel={i18n('action_cancel')}
                        onClickButtonApply={update}
                        onClickButtonCancel={() => setConfirmUpdate(false)}
                        propsButtonApply={{disabled: locked}}
                    />
                </Dialog>
            </Flex>
        </TabProvider>
    );
}
