import React from 'react';
import type {
    QueryEditorEngine,
    QueryEditorEngineSettingsContext,
} from '../../../../types/queryEditor';
import type {
    BuiltinEngineSettings,
    BuiltinEngineSettingsBinding,
    BuiltinQueryEngineId,
    BuiltinQueryEnginesOptions,
} from '../../../../types/builtinQueryEngines';
import {BuiltinEngineSettingsFields, BuiltinEngineSettingsSections} from './BuiltinEngineSettings';

const defaultEngines: BuiltinQueryEngineId[] = ['yql', 'chyt', 'spyt', 'ql'];
function bindSettings<TCustom extends BuiltinEngineSettings, TValue>(
    context: QueryEditorEngineSettingsContext<TCustom, TValue>,
): BuiltinEngineSettingsBinding<TCustom> {
    return {
        value: context.value.custom,
        onChange: (custom, field) =>
            context.onChange({...context.value, custom}, {changes: [{section: 'custom', field}]}),
        errors: context.errors?.custom,
        onFieldBlur: (field) => context.onFieldBlur?.({section: 'custom', field}),
        disabled: context.disabled,
        clusterId: context.clusterId,
    };
}
/** Creates engine descriptors from already loaded data; never fetches or initializes settings. */
export function createBuiltinQueryEngines<
    TCustom extends BuiltinEngineSettings = BuiltinEngineSettings,
    TValue = string,
>(options: BuiltinQueryEnginesOptions = {}): QueryEditorEngine<TCustom, TValue>[] {
    const names = {
        yql: ['YQL', 'yql'],
        chyt: ['CHYT', 'clickhouse'],
        spyt: ['SPYT', 'spyt'],
        ql: ['YT QL', 'ytql'],
    } as const;
    return (options.engines ?? defaultEngines).map((id) => ({
        id,
        title: names[id][0],
        language: names[id][1],
        renderSettingsFields: (context) =>
            id === 'ql' ||
            (id === 'spyt' && options.spyt?.connectAvailable) ||
            (id === 'yql' && !options.yql?.versions?.length) ? null : (
                <BuiltinEngineSettingsFields
                    {...bindSettings(context)}
                    engineId={id}
                    options={options}
                />
            ),
        renderSettingsSections: (context) =>
            id !== 'spyt' || !options.spyt?.connectAvailable ? null : (
                <BuiltinEngineSettingsSections
                    {...bindSettings(context)}
                    engineId={id}
                    options={options}
                />
            ),
    }));
}
