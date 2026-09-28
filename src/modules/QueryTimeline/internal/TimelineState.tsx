import React from 'react';
import {Loader, Text} from '@gravity-ui/uikit';
import type {QueryTimelineProps} from '../../../types/queryTimeline';
import i18n from '../i18n';

export function TimelineState({
    loading,
    errorContent,
    emptyContent,
    invalid,
    empty,
}: Pick<QueryTimelineProps, 'loading' | 'errorContent' | 'emptyContent'> & {
    invalid: boolean;
    empty: boolean;
}) {
    if (loading) return <Loader size="m" />;
    if (errorContent) return <React.Fragment>{errorContent}</React.Fragment>;
    if (invalid) return <Text color="danger">{i18n('alert_invalid-data')}</Text>;
    if (empty) return <React.Fragment>{emptyContent ?? i18n('context_empty')}</React.Fragment>;
    return <Text color="secondary">{i18n('context_no-results')}</Text>;
}
