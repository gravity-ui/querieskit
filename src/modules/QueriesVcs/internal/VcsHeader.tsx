import React from 'react';
import {Flex, Select, Text} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';
import {NavigationActionButtons} from '../../../components/NavigationActionButtons';
import type {VcsHeaderContext} from '../../../types/queriesVcs';
import i18n from '../i18n';
import './VcsHeader.scss';

const block = cn('qp-vcs-header');
export function VcsHeader({location, onUpdate, providers, branches, actions}: VcsHeaderContext) {
    const selectors = [
        {
            id: 'provider',
            config: providers,
            value: location.providerId,
            disabled: false,
            title: i18n('field_provider'),
            update: (providerId?: string) => onUpdate({providerId, path: '/'}),
        },
        {
            id: 'branch',
            config: branches,
            value: location.branch,
            disabled: !location.providerId || providers.loading || Boolean(providers.error),
            title: i18n('field_branch'),
            update: (branch?: string) => onUpdate({...location, branch, path: '/'}),
        },
    ];
    return (
        <Flex direction="column" gap={2} className={block()}>
            {selectors.map(({id, config, value, disabled, title, update}) => (
                <Flex key={id} direction="column" gap={1}>
                    <Select
                        aria-label={title}
                        placeholder={title}
                        value={value === undefined ? [] : [value]}
                        width="max"
                        filterable
                        loading={config.loading}
                        disabled={disabled || config.loading || Boolean(config.error)}
                        options={config.items.map((item) => ({
                            value: item.id,
                            content: item.title,
                            disabled: item.disabled,
                        }))}
                        onUpdate={([next]) => {
                            if (next !== value) update(next);
                        }}
                    />
                    {config.error ? (
                        <Text color="danger">
                            {config.error === true ? i18n('alert_load-error') : config.error}
                        </Text>
                    ) : null}
                </Flex>
            ))}
            <NavigationActionButtons actions={actions} arg={location} />
        </Flex>
    );
}
