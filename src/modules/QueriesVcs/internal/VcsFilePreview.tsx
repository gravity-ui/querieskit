import React, {Suspense, lazy} from 'react';
import {ArrowLeft} from '@gravity-ui/icons';
import {Button, Flex, Icon, Loader, Text} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';
import {NavigationActionButtons} from '../../../components/NavigationActionButtons';
import {NavigationItemRow} from '../../../components/NavigationItemRow';
import type {VcsDetailRenderContext, VcsItem} from '../../../types/queriesVcs';
import i18n from '../i18n';
import './VcsFilePreview.scss';

const MonacoEditor = lazy(() =>
    import('../../../components/MonacoEditor').then((module) => ({default: module.MonacoEditor})),
);
const block = cn('qp-vcs-file-preview');
export function VcsFilePreview<T extends VcsItem>({
    item,
    location,
    content,
    language,
    loading,
    error,
    actions,
    onClose,
    icon,
}: VcsDetailRenderContext<T> & {icon: React.ReactNode}) {
    let body: React.ReactNode;
    if (loading) {
        body = <Loader />;
    } else if (error) {
        body = <Text color="danger">{error === true ? i18n('alert_load-error') : error}</Text>;
    } else {
        body = (
            <Suspense fallback={<Loader />}>
                <MonacoEditor
                    className={block('editor')}
                    value={content ?? ''}
                    language={language ?? 'plaintext'}
                    readOnly
                    showStatusBar={false}
                />
            </Suspense>
        );
    }
    return (
        <Flex direction="column" gap={2} className={block()}>
            <Flex alignItems="center" gap={1} className={block('header')}>
                <Button
                    view="flat"
                    title={i18n('action_close')}
                    aria-label={i18n('action_close')}
                    onClick={onClose}
                >
                    <Icon data={ArrowLeft} size={16} />
                </Button>
                <div className={block('title')}>
                    <NavigationItemRow item={{...item, icon}} />
                </div>
            </Flex>
            <NavigationActionButtons
                actions={actions}
                arg={{item, location}}
                className={block('actions')}
            />
            {body}
        </Flex>
    );
}
