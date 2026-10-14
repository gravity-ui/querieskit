import React from 'react';
import cn from 'bem-cn-lite';
import './QueryGraphState.scss';
const block = cn('qp-query-graph');

export function QueryGraphState({
    className,
    children,
}: {
    className?: string;
    children: React.ReactNode;
}) {
    return (
        <div className={block(null, className)}>
            <div className={block('state')}>{children}</div>
        </div>
    );
}
