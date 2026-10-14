import React, {useRef} from 'react';
import cn from 'bem-cn-lite';
import './ResizeHandle.scss';

const block = cn('qp-page-resize-handle');

type Props = {
    orientation: 'horizontal' | 'vertical';
    value: number;
    min: number;
    max?: number;
    label: string;
    controls: string;
    onChange: (value: number) => void;
};

export function ResizeHandle({orientation, value, min, max, label, controls, onChange}: Props) {
    const drag = useRef<{id: number; position: number; value: number} | undefined>(undefined);
    const vertical = orientation === 'vertical';
    const update = (next: number) => {
        const clamped = Math.max(min, Math.min(max ?? Infinity, next));
        if (clamped !== value) onChange(clamped);
    };
    return (
        <div
            className={block({orientation})}
            role="separator"
            tabIndex={0}
            aria-label={label}
            aria-orientation={orientation}
            aria-controls={controls}
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuenow={value}
            onKeyDown={(event) => {
                const step = event.shiftKey ? 64 : 16;
                if (event.key === (vertical ? 'ArrowRight' : 'ArrowUp')) update(value + step);
                else if (event.key === (vertical ? 'ArrowLeft' : 'ArrowDown')) update(value - step);
                else if (event.key === 'Home') update(min);
                else if (event.key === 'End' && max !== undefined) update(max);
                else return;
                event.preventDefault();
            }}
            onPointerDown={(event) => {
                if (event.button !== 0) return;
                event.preventDefault();
                event.currentTarget.focus();
                drag.current = {
                    id: event.pointerId,
                    position: vertical ? event.clientX : event.clientY,
                    value,
                };
                event.currentTarget.setPointerCapture(event.pointerId);
            }}
            onPointerMove={(event) => {
                if (drag.current?.id !== event.pointerId) return;
                const delta = vertical
                    ? event.clientX - drag.current.position
                    : drag.current.position - event.clientY;
                update(drag.current.value + delta);
            }}
            onPointerUp={(event) => {
                if (drag.current?.id !== event.pointerId) return;
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
    );
}
