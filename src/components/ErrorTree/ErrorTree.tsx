import React from 'react';
import cn from 'bem-cn-lite';

import type {ErrorTreeProps} from '../../types/errorTree';
import {ErrorTreeNode} from './internal/ErrorTreeNode';

const block = cn('qp-error-tree');

export function ErrorTree({
    root,
    className,
    defaultExpanded = true,
    defaultInfoExpanded = false,
    renderAttributes,
    onPositionClick,
}: ErrorTreeProps) {
    return (
        <div className={block(null, className)}>
            <ErrorTreeNode
                item={root}
                level={0}
                defaultNodeExpanded={defaultExpanded}
                defaultExpanded={defaultExpanded}
                defaultInfoExpanded={defaultInfoExpanded}
                renderAttributes={renderAttributes}
                onPositionClick={onPositionClick}
            />
        </div>
    );
}
