import React, {useEffect, useRef, useState} from 'react';
import {Flex} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';
import i18n from '../i18n';
import {SettingsPlaceholder} from './SettingsPlaceholder';
import './QueryEditorSplit.scss';

const block = cn('qp-query-editor-split');
const MIN_SETTINGS = 240;
const MIN_EDITOR = 320;
const DIVIDER = 6;

type Props = {
    className?: string;
    children: React.ReactNode;
    open: boolean;
    settingsId: string;
    width: number;
    onWidthChange: (width: number) => void;
    onClose: () => void;
};

export function QueryEditorSplit({
    className,
    children,
    open,
    settingsId,
    width,
    onWidthChange,
    onClose,
}: Props) {
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
            : Math.max(MIN_SETTINGS, availableWidth - MIN_EDITOR - DIVIDER);
    const clamp = (value: number) =>
        Math.min(
            maxWidth ?? Infinity,
            Math.max(MIN_SETTINGS, Number.isFinite(value) ? value : 320),
        );
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
                        aria-label={i18n('action_resize-settings')}
                        aria-controls={settingsId}
                        aria-valuemin={MIN_SETTINGS}
                        aria-valuemax={maxWidth}
                        aria-valuenow={renderedWidth}
                        className={block('divider')}
                        onKeyDown={(event) => {
                            let next: number;
                            if (event.key === 'ArrowLeft')
                                next = renderedWidth + (event.shiftKey ? 64 : 16);
                            else if (event.key === 'ArrowRight')
                                next = renderedWidth - (event.shiftKey ? 64 : 16);
                            else if (event.key === 'Home') next = MIN_SETTINGS;
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
                <div
                    id={settingsId}
                    role="region"
                    aria-label={i18n('title_settings')}
                    hidden={!open}
                    className={block('settings')}
                    style={{width: renderedWidth}}
                >
                    <SettingsPlaceholder onClose={onClose} />
                </div>
            </Flex>
        </div>
    );
}
