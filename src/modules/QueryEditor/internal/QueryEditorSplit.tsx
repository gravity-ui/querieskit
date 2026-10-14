import React, {useEffect, useRef, useState} from 'react';
import {Flex} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';
import i18n from '../i18n';
import {PanelHeader} from './PanelHeader';
import type {QueryEditorPanel} from '../../../types/queryEditor';
import './QueryEditorSplit.scss';

const block = cn('qp-query-editor-split');
const MIN_PANEL = 240;
const MIN_EDITOR = 320;
const DIVIDER = 6;

type Props = {
    className?: string;
    children: React.ReactNode;
    settings?: React.ReactNode;
    attachments?: React.ReactNode;
    parameters?: React.ReactNode;
    parametersId: string;
    attachmentsId: string;
    activePanel: QueryEditorPanel;
    settingsId: string;
    width: number;
    onWidthChange: (width: number) => void;
    onClose: () => void;
};

export function QueryEditorSplit({
    className,
    children,
    settings,
    attachments,
    attachmentsId,
    parameters,
    parametersId,
    activePanel,
    settingsId,
    width,
    onWidthChange,
    onClose,
}: Props) {
    const panels = {
        settings: {
            id: settingsId,
            content: settings,
            title: i18n('title_settings'),
            closeLabel: i18n('action_close-settings'),
        },
        attachments: {
            id: attachmentsId,
            content: attachments,
            title: i18n('title_attachments'),
            closeLabel: i18n('action_close-attachments'),
        },
        parameters: {
            id: parametersId,
            content: parameters,
            title: i18n('title_parameters'),
            closeLabel: i18n('action_close-parameters'),
        },
    };
    const open = activePanel !== null;
    const rootRef = useRef<HTMLDivElement>(null);
    const drag = useRef<{pointerId: number; x: number; width: number} | undefined>(undefined);
    const [availableWidth, setAvailableWidth] = useState<number>();
    useEffect(() => {
        const element = rootRef.current;
        if (!element) return undefined;
        const measure = () => setAvailableWidth(element.clientWidth || undefined);
        measure();
        if (typeof ResizeObserver === 'undefined') return undefined;
        const observer = new ResizeObserver(measure);
        observer.observe(element);
        return () => observer.disconnect();
    }, []);
    const maxWidth =
        availableWidth === undefined
            ? undefined
            : Math.max(MIN_PANEL, availableWidth - MIN_EDITOR - DIVIDER);
    const clamp = (value: number) =>
        Math.min(maxWidth ?? Infinity, Math.max(MIN_PANEL, Number.isFinite(value) ? value : 320));
    const renderedWidth = clamp(width);
    const update = (value: number) => {
        const next = clamp(value);
        if (next !== renderedWidth) onWidthChange(next);
    };
    return (
        <div ref={rootRef} className={block(null, className)}>
            <Flex className={block('panels', {open})}>
                <Flex direction="column" grow={1} className={block('editor')}>
                    {children}
                </Flex>
                {open && (
                    <div
                        role="separator"
                        tabIndex={0}
                        aria-orientation="vertical"
                        aria-label={i18n('action_resize-panel')}
                        aria-controls={activePanel ? panels[activePanel].id : undefined}
                        aria-valuemin={MIN_PANEL}
                        aria-valuemax={maxWidth}
                        aria-valuenow={renderedWidth}
                        className={block('divider')}
                        onKeyDown={(event) => {
                            let next: number;
                            if (event.key === 'ArrowLeft')
                                next = renderedWidth + (event.shiftKey ? 64 : 16);
                            else if (event.key === 'ArrowRight')
                                next = renderedWidth - (event.shiftKey ? 64 : 16);
                            else if (event.key === 'Home') next = MIN_PANEL;
                            else if (event.key === 'End' && maxWidth !== undefined) next = maxWidth;
                            else return;
                            event.preventDefault();
                            update(next);
                        }}
                        onPointerDown={(event) => {
                            if (event.button !== 0) return;
                            event.preventDefault();
                            event.currentTarget.focus();
                            drag.current = {
                                pointerId: event.pointerId,
                                x: event.clientX,
                                width: renderedWidth,
                            };
                            event.currentTarget.setPointerCapture(event.pointerId);
                        }}
                        onPointerMove={(event) => {
                            if (drag.current?.pointerId === event.pointerId)
                                update(drag.current.width + drag.current.x - event.clientX);
                        }}
                        onPointerUp={(event) => {
                            if (drag.current?.pointerId !== event.pointerId) return;
                            drag.current = undefined;
                            event.currentTarget.releasePointerCapture(event.pointerId);
                        }}
                        onPointerCancel={() => {
                            drag.current = undefined;
                        }}
                        onLostPointerCapture={() => {
                            drag.current = undefined;
                        }}
                    />
                )}
                {(['settings', 'attachments', 'parameters'] as const).map((panel) => (
                    <div
                        key={panel}
                        id={panels[panel].id}
                        role="region"
                        aria-label={panels[panel].title}
                        hidden={activePanel !== panel}
                        className={block('panel')}
                        style={{width: renderedWidth}}
                    >
                        <Flex direction="column" className={block('panel-layout')}>
                            <PanelHeader
                                title={panels[panel].title}
                                closeLabel={panels[panel].closeLabel}
                                onClose={onClose}
                            />
                            <div className={block('content')}>{panels[panel].content}</div>
                        </Flex>
                    </div>
                ))}
            </Flex>
        </div>
    );
}
