import React, {useId} from 'react';
import {LayoutColumns} from '@gravity-ui/icons';
import {Button, Flex, Icon} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';
import {ResizeHandle} from '../../components/ResizeHandle';
import {useElementSize, useLayoutState} from '../../helpers/useLayoutState';
import type {QueryPageLayoutProps} from '../../types/queryPageLayout';
import i18n from './i18n';
import './QueryPageLayout.scss';

const block = cn('qp-query-page-layout');
const MIN_SIDEBAR = 240;
const MIN_WORKSPACE = 320;
const DIVIDER = 6;

export function QueryPageLayout({
    sidebar,
    header,
    children,
    sidebarWidth,
    defaultSidebarWidth = 300,
    onSidebarWidthChange,
    sidebarCollapsed,
    defaultSidebarCollapsed = false,
    onSidebarCollapsedChange,
    className,
    classNames,
}: QueryPageLayoutProps) {
    const sidebarId = useId();
    const [rootRef, rootSize] = useElementSize();
    const [preferredWidth, changeWidth] = useLayoutState(
        sidebarWidth,
        defaultSidebarWidth,
        onSidebarWidthChange,
    );
    const [sidebarHidden, changeSidebarHidden] = useLayoutState(
        sidebarCollapsed,
        defaultSidebarCollapsed,
        onSidebarCollapsedChange,
    );
    const maxWidth = rootSize.width
        ? Math.max(MIN_SIDEBAR, rootSize.width - MIN_WORKSPACE - DIVIDER)
        : undefined;
    const width = Math.max(
        MIN_SIDEBAR,
        Math.min(maxWidth ?? Infinity, Number.isFinite(preferredWidth) ? preferredWidth : 300),
    );
    const sidebarLabel = i18n(sidebarHidden ? 'action_show-sidebar' : 'action_hide-sidebar');
    const sidebarToggle = (
        <Button
            view="flat-secondary"
            size="s"
            aria-label={sidebarLabel}
            title={sidebarLabel}
            aria-expanded={!sidebarHidden}
            aria-controls={sidebarId}
            onClick={() => changeSidebarHidden(!sidebarHidden)}
        >
            <Icon data={LayoutColumns} size={16} />
        </Button>
    );

    return (
        <div ref={rootRef} className={block(null, className)}>
            <div
                className={block('layout', classNames?.layout)}
                style={{
                    gridTemplateColumns: `${sidebarHidden ? 0 : width}px ${sidebarHidden ? 0 : DIVIDER}px minmax(${MIN_WORKSPACE}px, 1fr)`,
                }}
            >
                <div
                    id={sidebarId}
                    hidden={sidebarHidden}
                    className={block('sidebar', classNames?.sidebar)}
                >
                    {sidebar}
                </div>
                <div
                    className={block('sidebar-divider', classNames?.sidebarDivider)}
                    hidden={sidebarHidden}
                >
                    <ResizeHandle
                        orientation="vertical"
                        value={width}
                        min={MIN_SIDEBAR}
                        max={maxWidth}
                        label={i18n('action_resize-sidebar')}
                        controls={sidebarId}
                        onChange={changeWidth}
                    />
                </div>
                <div className={block('workspace', classNames?.workspace)}>
                    {typeof header === 'function' ? (
                        header({sidebarToggle, sidebarCollapsed: sidebarHidden})
                    ) : (
                        <Flex alignItems="center" gap={2} className={block('header')}>
                            {sidebarToggle}
                            {header}
                        </Flex>
                    )}
                    <div className={block('content', classNames?.content)}>{children}</div>
                </div>
            </div>
        </div>
    );
}
