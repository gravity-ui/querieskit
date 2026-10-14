import type {EditAttachmentItemProps} from '../../../../types/attachmentsEditor';
import React from 'react';
import {FileEdit} from './FileEdit';
import {EditLinkItem} from './EditLinkItem';

export const EditAttachmentItem = ({...props}: EditAttachmentItemProps) => {
    if (props.type === 'file') {
        return <FileEdit {...props} />;
    }

    return <EditLinkItem {...props} />;
};
