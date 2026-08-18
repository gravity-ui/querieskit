import React, {FC, useState} from 'react';
import {Button, Flex, Breadcrumbs as GravityBreadcrumbs, Icon, Text} from '@gravity-ui/uikit';
import FolderTreeIcon from '@gravity-ui/icons/svgs/folder-tree.svg';
import PencilIcon from '@gravity-ui/icons/svgs/pencil.svg';
import cn from 'bem-cn-lite';
import {parsePathSegments} from './helpers/parsePathSegments';
import {NavigationLocation} from '../../types/navigation';
import type {LoadPathSuggestions} from '../../types/pathEditor';
import {PathEditor} from '../PathEditor';
import i18n from './i18n';
import './Breadcrumbs.scss';

export type BreadcrumbsProps = {
    location: NavigationLocation;
    hideResetButton?: boolean;
    className?: string;
    onUpdate: (location: NavigationLocation) => void;
    onLoadSuggestions?: LoadPathSuggestions;
};

const block = cn('qp-breadcrumbs');

export const Breadcrumbs: FC<BreadcrumbsProps> = ({
    location,
    hideResetButton,
    onUpdate,
    onLoadSuggestions,
    className,
}) => {
    const [edit, setEdit] = useState(false);

    const {cluster, path} = location;
    // `undefined` is the canonical representation of the cluster root path
    // across the whole navigation API (see `handleReset`/`handleOnSubmit`
    // below and `QueriesNavigation.handleClusterClick`), so the synthetic
    // root breadcrumb item resolves to `undefined` rather than `'/'`.
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
                <Flex alignItems="center" minWidth={0} overflow="hidden">
                    <Text color="secondary">/</Text>
                    <GravityBreadcrumbs showRoot className={block('list')}>
                        {items.map((item, index) => {
                            const isLast = index === items.length - 1;

                            return (
                                <GravityBreadcrumbs.Item
                                    key={item.path ?? 'root'}
                                    disabled={isLast}
                                    onClick={
                                        isLast
                                            ? undefined
                                            : () => onUpdate({cluster, path: item.path})
                                    }
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
