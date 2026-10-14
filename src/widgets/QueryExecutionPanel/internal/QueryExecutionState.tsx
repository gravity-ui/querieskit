import React from 'react';
import {Button, Flex, Loader, Text} from '@gravity-ui/uikit';
import {UnableToDisplay} from '@gravity-ui/illustrations';
import cn from 'bem-cn-lite';
import i18n from '../i18n';
import './QueryExecutionState.scss';

const block = cn('qp-query-execution-state');

export function QueryExecutionState({loading, onRetry}: {loading: boolean; onRetry?: () => void}) {
    return (
        <Flex
            direction="column"
            alignItems="center"
            justifyContent="center"
            gap={6}
            className={block()}
            role={loading ? 'status' : 'alert'}
            aria-label={loading ? i18n('context_loading') : undefined}
        >
            {loading ? (
                <Loader size="m" />
            ) : (
                <>
                    <UnableToDisplay height={100} aria-hidden />
                    <Flex direction="column" alignItems="center" gap={1}>
                        <Text>{i18n('title_loading-error')}</Text>
                        <Text>{i18n('context_try-refreshing')}</Text>
                    </Flex>
                    {onRetry && <Button onClick={onRetry}>{i18n('action_refresh')}</Button>}
                </>
            )}
        </Flex>
    );
}
