import React, {useId} from 'react';
import {Dialog, Text} from '@gravity-ui/uikit';
import type {QueryHistoryRow} from '../../../types/history';
import i18n from '../i18n';
import './DeleteQueryDialog.scss';

export function DeleteQueryDialog({
    item,
    onConfirm,
    onCancel,
}: {
    item?: QueryHistoryRow;
    onConfirm: () => void;
    onCancel: () => void;
}) {
    const titleId = useId();

    return (
        <Dialog
            open={Boolean(item)}
            onClose={onCancel}
            aria-labelledby={titleId}
            className="qp-delete-query-dialog"
        >
            <Dialog.Header id={titleId} caption={i18n('title_delete-query')} />
            <Dialog.Body>
                <Text variant="body-2" color="complementary">
                    {i18n('confirm_delete-query', {name: item?.title || (item?.id ?? '')})}
                </Text>
            </Dialog.Body>
            <Dialog.Footer
                preset="danger"
                textButtonCancel={i18n('action_cancel')}
                textButtonApply={i18n('action_delete')}
                onClickButtonCancel={onCancel}
                onClickButtonApply={onConfirm}
            />
        </Dialog>
    );
}
