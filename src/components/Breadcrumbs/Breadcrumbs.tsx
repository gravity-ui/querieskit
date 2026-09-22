import React, {FC, useState} from 'react';
import {Button, Flex, Breadcrumbs as GravityBreadcrumbs, Icon, Text} from '@gravity-ui/uikit';
import FolderTreeIcon from '@gravity-ui/icons/svgs/folder-tree.svg';
import PencilIcon from '@gravity-ui/icons/svgs/pencil.svg';
import cn from 'bem-cn-lite';
import {parsePathSegments} from './helpers/parsePathSegments';
import type {GetNavigationBreadcrumbHref, NavigationLocation} from '../../types/navigation';
import type {LoadPathSuggestions} from '../../types/pathEditor';
import {PathEditor} from '../PathEditor';
import i18n from './i18n';
import './Breadcrumbs.scss';

export type BreadcrumbsProps = {
    location: NavigationLocation;
    hideResetButton?: boolean;
    className?: string;
    onUpdate: (location: NavigationLocation) => void;
    getBreadcrumbHref?: GetNavigationBreadcrumbHref;
    onLoadSuggestions?: LoadPathSuggestions;
};

const block = cn('qp-breadcrumbs');

export const Breadcrumbs: FC<BreadcrumbsProps> = ({
    location,
    hideResetButton,
    onUpdate,
    getBreadcrumbHref,
    onLoadSuggestions,
    className,
}) => {
    const [edit, setEdit] = useState(false);

    const {cluster, path} = location;
    const ROOT_PATH = undefined;
    const items = cluster ? [{path: ROOT_PATH, title: cluster}, ...parsePathSegments(path)] : [];

    const handleReset = () => {
        onUpdate({cluster: undefined, path: undefined});
    };

    const handleCancelEdit = () => {
        setEdit(false);
    };

    const handleOnSubmit = (nextPath: string) => {
        const normalizedPath = nextPath.endsWith('/') ? nextPath.slice(0, -1) : nextPath;
        onUpdate({cluster, path: normalizedPath || undefined});
        setEdit(false);
    };

    if (edit) {
        return (
            <Flex grow minWidth={0} className={block(null, className)}>
                <PathEditor
                    className={block('path-editor')}
                    defaultPath={path ?? ''}
                    autoFocus
                    cluster={cluster}
                    onLoadSuggestions={onLoadSuggestions}
                    onApply={handleOnSubmit}
                    onCancel={handleCancelEdit}
                    onBlur={handleCancelEdit}
                    onFocus={(event) => event.currentTarget.select()}
                />
            </Flex>
        );
    }

    return (
        <Flex gap={1} alignItems="center" grow minWidth={0} className={block(null, className)}>
            {!hideResetButton && (
                <Button view="flat" onClick={handleReset} aria-label={i18n('action_reset')}>
                    <Icon data={FolderTreeIcon} size={16} />
                </Button>
            )}
            {items.length > 0 ? (
                <Flex
                    alignItems="center"
                    minWidth={0}
                    overflow="hidden"
                    gap={items.length > 1 ? undefined : 1}
                >
                    <Text color="secondary">/</Text>
                    <GravityBreadcrumbs showRoot className={block('list')} maxItems={3}>
                        {items.map((item, index) => {
                            const isLast = index === items.length - 1;
                            const itemLocation = {cluster, path: item.path};
                            const href = getBreadcrumbHref?.(itemLocation);

                            return (
                                <GravityBreadcrumbs.Item
                                    key={item.path ?? 'root'}
                                    href={href}
                                    disabled={isLast && !href}
                                    onClick={(event) => {
                                        const isPlainLeftClick =
                                            event.button === 0 &&
                                            !event.altKey &&
                                            !event.ctrlKey &&
                                            !event.metaKey &&
                                            !event.shiftKey;

                                        if (href && !isPlainLeftClick) {
                                            return;
                                        }

                                        if (href) {
                                            event.preventDefault();
                                        }

                                        if (!isLast) {
                                            onUpdate(itemLocation);
                                        }
                                    }}
                                >
                                    {item.title}
                                </GravityBreadcrumbs.Item>
                            );
                        })}
                    </GravityBreadcrumbs>
                    <Button
                        view="flat"
                        className={block('edit-button')}
                        onClick={() => setEdit(true)}
                        aria-label={i18n('action_edit-path')}
                    >
                        <Icon data={PencilIcon} size={16} />
                    </Button>
                </Flex>
            ) : null}
        </Flex>
    );
};
