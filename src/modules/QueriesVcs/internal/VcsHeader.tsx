import React from 'react';
import {Flex, Select, Spin, Text} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';
import {NavigationActionButtons} from '../../../components/NavigationActionButtons';
import type {VcsHeaderContext} from '../../../types/queriesVcs';
import i18n from '../i18n';
import './VcsHeader.scss';

const block = cn('qp-vcs-header');
export function VcsHeader({
    location,
    onUpdate,
    providers,
    repositories,
    branches,
    actions,
}: VcsHeaderContext) {
    const providerUnavailable =
        !location.providerId || providers.loading || Boolean(providers.error);
    const repositoryUnavailable = Boolean(
        repositories &&
        (!location.repositoryId ||
            repositories.loading ||
            repositories.error ||
            repositories.items.length === 0),
    );
    const selectors = [
        {
            id: 'provider',
            config: providers,
            value: location.providerId,
            disabled: false,
            title: i18n('field_provider'),
            update: (providerId?: string) => onUpdate({providerId, path: '/'}),
        },
        ...(repositories
            ? [
                  {
                      id: 'repository',
                      config: repositories,
                      value: location.repositoryId,
                      disabled: providerUnavailable,
                      hidden: repositories.items.length <= 1,
                      title: i18n('field_repository'),
                      update: (repositoryId?: string) =>
                          onUpdate({providerId: location.providerId, repositoryId, path: '/'}),
                  },
              ]
            : []),
        {
            id: 'branch',
            config: branches,
            value: location.branch,
            disabled: providerUnavailable || repositoryUnavailable,
            title: i18n('field_branch'),
            update: (branch?: string) => onUpdate({...location, branch, path: '/'}),
        },
    ];
    return (
        <Flex direction="column" gap={2} className={block()}>
            {selectors.map(({id, config, value, disabled, hidden, title, update}) => {
                const showEmpty =
                    hidden &&
                    !providerUnavailable &&
                    !config.loading &&
                    !config.error &&
                    config.items.length === 0;
                if (hidden && !config.loading && !config.error && !showEmpty) return null;
                return (
                    <Flex key={id} direction="column" gap={1}>
                        {!hidden && (
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
                        )}
                        {id === 'repository' && config.loading && (
                            <Flex alignItems="center" gap={1} role="status">
                                <Spin size="xs" />
                                <Text>{i18n('context_loading-repositories')}</Text>
                            </Flex>
                        )}
                        {showEmpty && (
                            <Text color="secondary">{i18n('context_no-repositories')}</Text>
                        )}
                        {config.error ? (
                            <Text color="danger" role="alert">
                                {config.error === true ? i18n('alert_load-error') : config.error}
                            </Text>
                        ) : null}
                    </Flex>
                );
            })}
            <NavigationActionButtons actions={actions} arg={location} />
        </Flex>
    );
}
