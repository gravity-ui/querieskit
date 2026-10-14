import React, {useState} from 'react';
import {Flex, Text, TextInput} from '@gravity-ui/uikit';
import {action} from 'storybook/actions';
import {FormField} from '../../../components/FormField';
import type {QueryEditorEngine} from '../../../types/queryEditor';
import type {QuerySettingsValue} from '../../../types/querySettings';
import type {BuiltinEngineSettings} from '../../../types/builtinQueryEngines';
import {QueryEditor} from '../QueryEditor';
import {createBuiltinQueryEngines} from '../presets/builtin';

type Settings = BuiltinEngineSettings & {warehouse?: string};
export type EngineSettingsExampleProps = {
    engineId: string;
    onEngineChange: (engineId: string) => void;
    loading?: boolean;
    empty?: boolean;
    connectAvailable?: boolean;
    disabled?: boolean;
    withErrors?: boolean;
    customEngine?: boolean;
};

export function EngineSettingsExample({
    engineId,
    onEngineChange,
    loading = false,
    empty = false,
    connectAvailable = false,
    disabled = false,
    withErrors = false,
    customEngine = false,
}: EngineSettingsExampleProps) {
    const [query, setQuery] = useState('SELECT 1;');
    const [clusterId, setClusterId] = useState('production');
    // Defaults belong to the application, including the initial YQL version.
    const [settings, setSettings] = useState<QuerySettingsValue<Settings>>({
        queryName: withErrors ? '' : 'Daily report',
        access: 'private',
        ytOperationTitle: 'Daily report',
        tokenIds: [],
        attributes: [],
        custom: {
            yqlVersion: 'stable',
            warehouse: '',
            spytConfig: JSON.stringify(
                {
                    executor_cores: 2,
                    executor_memory: '8G',
                    num_executors: 3,
                    spark_conf: {'spark.sql.shuffle.partitions': '8'},
                    cluster: 'hahn',
                },
                null,
                2,
            ),
        },
    });
    const cliques = empty
        ? []
        : [
              {alias: `${clusterId}-analytics`, state: 'active', health: 'good'},
              {alias: `${clusterId}-archive`, state: 'stopped', health: 'failed'},
          ];
    const discoveryGroups = empty
        ? []
        : [{path: `//${clusterId}/spark/default`, title: `${clusterId} Spark`}];
    const engines = createBuiltinQueryEngines<Settings>({
        yql: {versions: empty ? [] : ['stable', 'preview']},
        chyt: {loading, cliques: loading ? undefined : cliques},
        spyt: {connectAvailable, loading, discoveryGroups: loading ? undefined : discoveryGroups},
    });
    if (customEngine) {
        const engine: QueryEditorEngine<Settings> = {
            id: 'custom',
            title: 'Custom SQL',
            language: 'yql_ansi',
            renderSettingsFields: ({
                value,
                onChange,
                errors,
                onFieldBlur,
                disabled: fieldDisabled,
                clusterId: selectedCluster,
            }) => (
                <FormField label={`Warehouse (${selectedCluster})`}>
                    <TextInput
                        controlProps={{'aria-label': 'Warehouse'}}
                        value={value.custom.warehouse ?? ''}
                        onUpdate={(warehouse) =>
                            onChange({...value, custom: {...value.custom, warehouse}})
                        }
                        onBlur={() => onFieldBlur?.({section: 'custom', field: 'warehouse'})}
                        disabled={fieldDisabled}
                        errorMessage={errors?.custom?.warehouse}
                        validationState={errors?.custom?.warehouse ? 'invalid' : undefined}
                    />
                </FormField>
            ),
        };
        engines.push(engine);
    }
    return (
        <Flex direction="column" gap={3}>
            <Text color="secondary">
                Switch engines and clusters in the toolbar. This application preserves settings when
                switching; cluster options come from the parent.
            </Text>
            <div style={{height: 540}}>
                <QueryEditor<Settings>
                    value={query}
                    onChange={setQuery}
                    clusters={[
                        {id: 'production', title: 'Production'},
                        {id: 'development', title: 'Development'},
                    ]}
                    clusterId={clusterId}
                    onClusterChange={setClusterId}
                    engines={engines}
                    engineId={engineId}
                    onEngineChange={onEngineChange}
                    onRun={() => action('run')({query, engineId, clusterId, settings})}
                    onValidate={action('validate')}
                    onFormat={action('format')}
                    defaultActivePanel="settings"
                    defaultPanelWidth={360}
                    settingsProps={{
                        value: settings,
                        onChange: setSettings,
                        onFieldBlur: action('settings blur'),
                        disabled,
                        tokens: [{id: 'analytics', title: 'Analytics'}],
                        errors: withErrors
                            ? {
                                  fields: {
                                      queryName: settings.queryName.trim()
                                          ? undefined
                                          : 'Enter a query name',
                                  },
                                  custom: {
                                      yqlVersion: 'This version is unavailable for this account',
                                      clique: 'Select an available clique',
                                      discoveryGroup: 'Select an available discovery path',
                                      warehouse: 'Enter a warehouse',
                                  },
                              }
                            : undefined,
                    }}
                />
            </div>
        </Flex>
    );
}
