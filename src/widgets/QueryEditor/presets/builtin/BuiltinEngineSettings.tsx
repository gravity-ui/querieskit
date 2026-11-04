import React from 'react';
import type {
    BuiltinEngineSettings,
    BuiltinEngineSettingsProps,
    BuiltinQueryClique,
} from '../../../../types/builtinQueryEngines';
import {SpytSettings} from './internal/SpytSettings';
import {EngineSettingsSelect} from './internal/EngineSettingsSelect';
import i18n from './i18n';
const isActive = (clique: BuiltinQueryClique) =>
    clique.state === 'active' && clique.health === 'good';

export function BuiltinEngineSettingsFields<
    TCustom extends BuiltinEngineSettings = BuiltinEngineSettings,
>({engineId, options = {}, ...context}: BuiltinEngineSettingsProps<TCustom>) {
    if (engineId === 'yql')
        return options.yql?.versions?.length ? (
            <EngineSettingsSelect
                context={context}
                field="yqlVersion"
                title={i18n('field_yql-version')}
                options={options.yql.versions.map((version) => ({
                    value: version,
                    content: version,
                }))}
                displayedValue={context.value.yqlVersion}
            />
        ) : null;
    if (engineId === 'chyt') {
        const {cliques, loading} = options.chyt ?? {};
        const selected = context.value.clique;
        const showSelected =
            cliques === undefined || loading || cliques.some(({alias}) => alias === selected);

        return (
            <EngineSettingsSelect
                context={context}
                field="clique"
                title={i18n('field_clique')}
                options={[...(cliques ?? [])]
                    .sort((a, b) => Number(isActive(b)) - Number(isActive(a)))
                    .map((clique) => ({
                        value: clique.alias,
                        content: [
                            clique.alias,
                            i18n(isActive(clique) ? 'value_active' : 'value_inactive'),
                            clique.operationId,
                        ]
                            .filter(Boolean)
                            .join(' · '),
                        disabled: clique.disabled,
                    }))}
                displayedValue={showSelected ? selected : undefined}
                loading={loading}
                hasClear
            />
        );
    }
    if (engineId === 'spyt')
        return options.spyt?.connectAvailable ? null : (
            <EngineSettingsSelect
                context={context}
                field="discoveryGroup"
                title={i18n('field_discovery-path')}
                options={(options.spyt?.discoveryGroups ?? []).map((group) => ({
                    value: group.path,
                    content: group.title ?? group.path,
                    disabled: group.disabled,
                }))}
                displayedValue={context.value.discoveryGroup}
                loading={options.spyt?.loading}
                hasClear
            />
        );
    return null;
}

export function BuiltinEngineSettingsSections<
    TCustom extends BuiltinEngineSettings = BuiltinEngineSettings,
>({engineId, options = {}, ...context}: BuiltinEngineSettingsProps<TCustom>) {
    return engineId === 'spyt' && options.spyt?.connectAvailable ? (
        <SpytSettings context={context} />
    ) : null;
}
