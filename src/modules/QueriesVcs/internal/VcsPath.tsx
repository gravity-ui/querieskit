import React, {useState} from 'react';
import {FolderTree, Pencil} from '@gravity-ui/icons';
import {Breadcrumbs, Button, Flex, Icon} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';
import {PathEditor} from '../../../components/PathEditor';
import type {QueriesVcsProps, VcsLocation} from '../../../types/queriesVcs';
import i18n from '../i18n';
import './VcsPath.scss';

const block = cn('qp-vcs-path');
export function VcsPath({
    location,
    onUpdate,
    onSubmit,
    onLoadSuggestions,
}: {
    location: VcsLocation;
    onUpdate: (location: VcsLocation) => void;
    onSubmit: (location: VcsLocation) => void;
    onLoadSuggestions: QueriesVcsProps['onLoadSuggestions'];
}) {
    const [editing, setEditing] = useState(false);
    const parts = location.path.split('/').filter(Boolean);
    const crumbs = [
        {path: '/', title: i18n('title_root')},
        ...parts.map((title, index) => ({title, path: `/${parts.slice(0, index + 1).join('/')}`})),
    ];
    return (
        <Flex alignItems="center" gap={1} className={block()}>
            {editing ? (
                <PathEditor
                    className={block('editor')}
                    defaultPath={location.path}
                    autoFocus
                    placeholder={i18n('field_path')}
                    onLoadSuggestions={
                        onLoadSuggestions
                            ? ({path}) => onLoadSuggestions({...location, path})
                            : undefined
                    }
                    onApply={(path) => {
                        setEditing(false);
                        onSubmit({
                            ...location,
                            path: `/${path.split('/').filter(Boolean).join('/')}`,
                        });
                    }}
                    onCancel={() => setEditing(false)}
                />
            ) : (
                <>
                    <Breadcrumbs
                        className={block('breadcrumbs')}
                        showRoot
                        onAction={(path) => onUpdate({...location, path: String(path)})}
                    >
                        {crumbs.map((crumb) => (
                            <Breadcrumbs.Item
                                key={crumb.path}
                                aria-label={crumb.path === '/' ? crumb.title : undefined}
                                title={crumb.path === '/' ? crumb.title : undefined}
                            >
                                <Flex alignItems="center" height="100%">
                                    {crumb.path === '/' ? (
                                        <Icon data={FolderTree} size={16} />
                                    ) : (
                                        crumb.title
                                    )}
                                </Flex>
                            </Breadcrumbs.Item>
                        ))}
                    </Breadcrumbs>
                    <Button
                        view="flat"
                        title={i18n('action_edit-path')}
                        aria-label={i18n('action_edit-path')}
                        onClick={() => setEditing(true)}
                    >
                        <Icon data={Pencil} size={16} />
                    </Button>
                </>
            )}
        </Flex>
    );
}
