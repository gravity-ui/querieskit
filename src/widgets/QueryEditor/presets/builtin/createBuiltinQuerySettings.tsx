import React from 'react';
import type {
    BuiltinEngineSettings,
    BuiltinQuerySettingsOptions,
} from '../../../../types/builtinQueryEngines';
import type {
    QuerySettingsSection,
    QuerySettingsSectionsProps,
} from '../../../../types/querySettings';
import {BuiltinEngineSettingsFields} from './BuiltinEngineSettings';
import {SpytSettingsSectionContent} from './internal/SpytSettingsSectionContent';

/** Composes builtin controls without aggregate settings, fetching or additional state. */
export function createBuiltinQuerySettings<
    TCustom extends BuiltinEngineSettings = BuiltinEngineSettings,
    TValue = string,
>({
    engine,
    general,
    sections = [],
    ...props
}: BuiltinQuerySettingsOptions<TCustom, TValue>): QuerySettingsSectionsProps<TValue> {
    const {engineId, options = {}} = engine;
    const binding = {...engine, disabled: Boolean(props.disabled || engine.disabled)};
    const hasFields =
        (engineId === 'yql' && Boolean(options.yql?.versions?.length)) ||
        engineId === 'chyt' ||
        (engineId === 'spyt' && !options.spyt?.connectAvailable);
    const builtinSections: QuerySettingsSection[] = [];
    if (engineId === 'spyt' && options.spyt?.connectAvailable) {
        const ids = new Set(sections.map(({id}) => id));
        let id = 'builtin:spyt';
        for (let suffix = 1; ids.has(id); suffix += 1) id = `builtin:spyt:${suffix}`;
        builtinSections.push({
            id,
            title: 'SPYT',
            content: <SpytSettingsSectionContent context={binding} />,
        });
    }
    return {
        ...props,
        mode: 'sections',
        general: hasFields
            ? {
                  ...general,
                  customFields: (
                      <>
                          <BuiltinEngineSettingsFields {...binding} />
                          {general?.customFields}
                      </>
                  ),
              }
            : general,
        sections: [...builtinSections, ...sections],
    };
}
