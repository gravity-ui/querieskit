import React from 'react';
import {FileEdit} from './FileEdit';
import {EditLinkItem} from './EditLinkItem';
import type {EditFileItemProps} from './FileEdit';
import type {EditLinkItemProps} from './EditLinkItem';

export type EditAttachmentItemProps =
    | (EditFileItemProps & {
          type: 'file';
      })
    | (EditLinkItemProps & {
          type: 'link';
      });

export const EditAttachmentItem = ({...props}: EditAttachmentItemProps) => {
    if (props.type === 'file') {
        return <FileEdit {...props} />;
    }

    return <EditLinkItem {...props} />;
};
