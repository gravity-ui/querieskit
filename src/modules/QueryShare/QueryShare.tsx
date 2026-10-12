import React, {useEffect, useId, useRef, useState} from 'react';
import {ArrowRotateRight, Check, Pencil, Xmark} from '@gravity-ui/icons';
import {
    Button,
    ClipboardButton,
    Dialog,
    Flex,
    Icon,
    Text,
    TextInput,
    Tooltip,
} from '@gravity-ui/uikit';
import {DatePicker} from '@gravity-ui/date-components';
import {dateTimeParse} from '@gravity-ui/date-utils';
import type {DateTime} from '@gravity-ui/date-utils';
import cn from 'bem-cn-lite';
import type {QueryShareProps} from '../../types/queryShare';
import i18n from './i18n';

import './QueryShare.scss';

const block = cn('qp-query-share');

function formatExpiration(timestamp: number) {
    const date = new Date(timestamp);
    const pad = (value: number) => String(value).padStart(2, '0');
    return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function QueryShare({
    open,
    onClose,
    link,
    onGenerate,
    onRegenerate,
    onMakePermanent,
    onExpirationChange,
    pendingAction,
    error,
    className,
}: QueryShareProps) {
    const titleId = useId();
    const [copyFailed, setCopyFailed] = useState(false);
    const [editingExpiration, setEditingExpiration] = useState(false);
    const [expirationDraft, setExpirationDraft] = useState<DateTime | null>(null);
    const editButtonRef = useRef<HTMLButtonElement>(null);
    const wasEditingExpiration = useRef(false);
    const pending = pendingAction !== undefined;

    useEffect(() => {
        setEditingExpiration(false);
    }, [open, link?.url, link?.expiresAt]);

    useEffect(() => {
        if (!editingExpiration && wasEditingExpiration.current && open) {
            editButtonRef.current?.focus();
        }
        wasEditingExpiration.current = editingExpiration;
    }, [editingExpiration, open]);

    useEffect(() => {
        setCopyFailed(false);
    }, [open, link?.url]);

    return (
        <Dialog
            open={open}
            onClose={onClose}
            className={block(null, className)}
            aria-labelledby={titleId}
        >
            <Flex direction="column" gap={6} className={block('content')}>
                <Flex direction="column" gap={2}>
                    <Text as="h2" id={titleId} variant="subheader-1" className={block('title')}>
                        {i18n('title_public-link')}
                    </Text>
                    {link && (
                        <React.Fragment>
                            <Flex gap={2} alignItems="center">
                                <TextInput
                                    className={block('url')}
                                    value={link.url}
                                    readOnly
                                    controlProps={{'aria-label': i18n('title_public-link')}}
                                    endContent={
                                        <ClipboardButton
                                            text={link.url}
                                            view="flat"
                                            aria-label={i18n('action_copy-link')}
                                            tooltipInitialText={i18n('action_copy-link')}
                                            tooltipSuccessText={i18n('value_copied')}
                                            onCopy={(_text, success) => setCopyFailed(!success)}
                                        />
                                    }
                                />
                                <Tooltip content={i18n('action_regenerate-link')}>
                                    <Button
                                        className={block('icon-button')}
                                        view="flat-secondary"
                                        aria-label={i18n('action_regenerate-link')}
                                        onClick={onRegenerate}
                                        disabled={pending}
                                        loading={pendingAction === 'regenerate'}
                                    >
                                        <Icon data={ArrowRotateRight} size={16} />
                                    </Button>
                                </Tooltip>
                            </Flex>
                            <Flex gap={1} alignItems="center" wrap>
                                {editingExpiration && link.expiresAt !== null ? (
                                    <React.Fragment>
                                        <Text color="secondary">{i18n('field_expiration')}</Text>
                                        <Flex
                                            gap={1}
                                            alignItems="center"
                                            className={block('expiration-controls')}
                                        >
                                            <DatePicker
                                                className={block('expiration-input')}
                                                aria-label={i18n('field_expiration-date-time')}
                                                value={expirationDraft}
                                                onUpdate={setExpirationDraft}
                                                format="DD.MM.YYYY HH:mm"
                                                timeZone="system"
                                                autoFocus
                                                disabled={pending}
                                            />
                                            <Button
                                                view="flat-secondary"
                                                className={block('icon-button')}
                                                aria-label={i18n('action_save-expiration')}
                                                title={i18n('action_save-expiration')}
                                                disabled={pending || !expirationDraft?.isValid()}
                                                onClick={() => {
                                                    if (!pending && expirationDraft?.isValid()) {
                                                        onExpirationChange(
                                                            expirationDraft.valueOf(),
                                                        );
                                                        setEditingExpiration(false);
                                                    }
                                                }}
                                            >
                                                <Icon data={Check} size={16} />
                                            </Button>
                                            <Button
                                                view="flat-secondary"
                                                className={block('icon-button')}
                                                aria-label={i18n('action_cancel-expiration')}
                                                title={i18n('action_cancel-expiration')}
                                                onClick={() => setEditingExpiration(false)}
                                            >
                                                <Icon data={Xmark} size={16} />
                                            </Button>
                                        </Flex>
                                    </React.Fragment>
                                ) : (
                                    <React.Fragment>
                                        <Text color="secondary">
                                            {link.expiresAt === null
                                                ? i18n('value_no-expiration')
                                                : i18n('value_expiration', {
                                                      date: formatExpiration(link.expiresAt),
                                                  })}
                                        </Text>
                                        {link.expiresAt !== null && (
                                            <Tooltip content={i18n('action_edit-expiration')}>
                                                <Button
                                                    ref={editButtonRef}
                                                    className={block('icon-button')}
                                                    view="flat-secondary"
                                                    size="s"
                                                    aria-label={i18n('action_edit-expiration')}
                                                    onClick={() => {
                                                        setExpirationDraft(
                                                            dateTimeParse(link.expiresAt, {
                                                                timeZone: 'system',
                                                            }) ?? null,
                                                        );
                                                        setEditingExpiration(true);
                                                    }}
                                                    disabled={pending}
                                                    loading={pendingAction === 'updateExpiration'}
                                                >
                                                    <Icon data={Pencil} size={14} />
                                                </Button>
                                            </Tooltip>
                                        )}
                                    </React.Fragment>
                                )}
                            </Flex>
                        </React.Fragment>
                    )}
                </Flex>
                {link ? (
                    link.expiresAt !== null && (
                        <Button
                            className={block('action')}
                            size="l"
                            onClick={onMakePermanent}
                            disabled={pending}
                            loading={pendingAction === 'makePermanent'}
                        >
                            {i18n('action_create-permanent-link')}
                        </Button>
                    )
                ) : (
                    <Button
                        className={block('action')}
                        size="l"
                        onClick={onGenerate}
                        disabled={pending}
                        loading={pendingAction === 'generate'}
                    >
                        {i18n('action_generate-link')}
                    </Button>
                )}
                {error && (
                    <div role="alert" className={block('error')}>
                        {error}
                    </div>
                )}
                {copyFailed && (
                    <div role="alert" className={block('error')}>
                        {i18n('alert_copy-failed')}
                    </div>
                )}
            </Flex>
        </Dialog>
    );
}
