import React, {useState} from 'react';
import {CircleInfo} from '@gravity-ui/icons';
import {Flex, Icon, Popover} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';
import type {DataTypePopupProps} from '../../types/dataTypePopup';
import {formatType} from '../../helpers/dataTypes';
import {DataTypeTree} from './internal/DataTypeTree';
import './DataTypePopup.scss';

const block = cn('qp-data-type-popup');

export function DataTypePopup({children, type, hideIcon, className}: DataTypePopupProps) {
    const [open, setOpen] = useState(false);
    if (!type) {
        return <span className={block(null, className)}>{children}</span>;
    }
    const label = formatType(type);
    return (
        <Popover
            hasArrow={false}
            enableSafePolygon
            open={open}
            onOpenChange={setOpen}
            content={
                <div className={block('content')}>
                    <DataTypeTree key={label} type={type} />
                </div>
            }
        >
            <Flex
                as="span"
                inline
                alignItems="center"
                gap={1}
                className={block({interactive: true}, className)}
                role="button"
                tabIndex={0}
                aria-label={label}
                aria-haspopup="dialog"
                aria-expanded={open}
                onClick={() => setOpen(!open)}
            >
                {children}
                {!hideIcon && <Icon className={block('icon')} data={CircleInfo} size={12} />}
            </Flex>
        </Popover>
    );
}
