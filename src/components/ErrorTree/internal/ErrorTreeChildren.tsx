import React from 'react';

import type {ErrorTreeItem, ErrorTreeProps} from '../../../types/errorTree';
import {IntermediateMessages} from './IntermediateMessages';

import './ErrorTreeChildren.scss';

type ErrorTreeChildrenProps = Pick<
    ErrorTreeProps,
    'defaultExpanded' | 'defaultInfoExpanded' | 'renderAttributes' | 'onPositionClick'
> & {
    className?: string;
    items: ErrorTreeItem[];
    level: number;
};

export function ErrorTreeChildren({className, items, ...props}: ErrorTreeChildrenProps) {
    return (
        <div className={className}>
            {items.map((item) => (
                <IntermediateMessages key={item.id} item={item} {...props} />
            ))}
        </div>
    );
}
