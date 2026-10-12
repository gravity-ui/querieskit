import React from 'react';
import type {QueryEditorEngine} from '../../../../types/queryEditor';
import type {
    YtsaurusEngineSettings,
    YtsaurusQueryClique,
    YtsaurusQueryEngineId,
    YtsaurusQueryEnginesOptions,
} from '../../../../types/ytsaurusQueryEngines';
import {SpytSettings} from './internal/SpytSettings';
import {EngineSettingsSelect} from './internal/EngineSettingsSelect';
import i18n from './i18n';

const defaultEngines: YtsaurusQueryEngineId[] = ['yql', 'chyt', 'spyt', 'ql'];
const isActive = (clique: YtsaurusQueryClique) =>
    clique.state === 'active' && clique.health === 'good';

/** Creates engine descriptors from already loaded data; never fetches or initializes settings. */
export function createYtsaurusQueryEngines<
    TCustom extends YtsaurusEngineSettings = YtsaurusEngineSettings,
>(options: YtsaurusQueryEnginesOptions = {}): QueryEditorEngine<TCustom>[] {
    const engines: Record<YtsaurusQueryEngineId, QueryEditorEngine<TCustom>> = {
        yql: {
            id: 'yql',
            title: 'YQL',
            language: 'yql',
            renderSettingsFields: (context) =>
                options.yql?.versions?.length ? (
                    <EngineSettingsSelect
                        context={context}
                        field="yqlVersion"
                        title={i18n('field_yql-version')}
                        options={options.yql.versions.map((version) => ({
                            value: version,
                            content: version,
                        }))}
                        displayedValue={context.value.custom.yqlVersion}
                    />
                ) : null,
        },
        chyt: {
            id: 'chyt',
            title: 'CHYT',
            language: 'clickhouse',
            renderSettingsFields: (context) => {
                const {cliques, loading} = options.chyt ?? {};
                const selected = context.value.custom.clique;
                const showSelected =
                    cliques === undefined ||
                    loading ||
                    cliques.some(({alias}) => alias === selected);

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
            },
        },
        spyt: {
            id: 'spyt',
            title: 'SPYT',
            language: 's-expression',
            renderSettingsSections: (context) =>
                options.spyt?.connectAvailable ? <SpytSettings context={context} /> : null,
            renderSettingsFields: (context) =>
                options.spyt?.connectAvailable ? null : (
                    <EngineSettingsSelect
                        context={context}
                        field="discoveryGroup"
                        title={i18n('field_discovery-path')}
                        options={(options.spyt?.discoveryGroups ?? []).map((group) => ({
                            value: group.path,
                            content: group.title ?? group.path,
                            disabled: group.disabled,
                        }))}
                        displayedValue={context.value.custom.discoveryGroup}
                        loading={options.spyt?.loading}
                        hasClear
                    />
                ),
        },
        ql: {id: 'ql', title: 'YT QL', language: 'yql_ansi'},
    };

    return (options.engines ?? defaultEngines).map((engine) => engines[engine]);
}
