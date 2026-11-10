import React from 'react';
import {createBuiltinQuerySettings} from '../../src/widgets/QueryEditor/presets/builtin';
import type {BuiltinQuerySettingsOptions} from '../../src/widgets/QueryEditor/presets/builtin';
import {QuerySettings} from '../../src/modules/QuerySettings';
import type {BuiltinEngineSettings} from '../../src/types/builtinQueryEngines';

type Settings = BuiltinEngineSettings & {pool: string};

const options: BuiltinQuerySettingsOptions<Settings, number> = {
    engine: {
        engineId: 'yql',
        value: {pool: 'analytics'},
        onChange: (value, field) => {
            value.pool.toUpperCase();
            const setting: string | undefined = value[field];
            return setting;
        },
        options: {yql: {versions: ['stable']}},
    },
    sections: [{id: 'custom', title: 'Custom', content: <span>Custom content</span>}],
};

export const sectionSettings = <QuerySettings {...createBuiltinQuerySettings(options)} />;

export const invalidBinding: BuiltinQuerySettingsOptions = {
    engine: {
        engineId: 'yql',
        value: {},
        // @ts-expect-error Engine changes use the independently bound settings object.
        onChange: (value: string) => value,
    },
};

export const invalidAggregate: BuiltinQuerySettingsOptions = {
    engine: {engineId: 'yql', value: {}, onChange: () => {}},
    // @ts-expect-error The helper composes independent bindings, not an aggregate value.
    value: {custom: {}},
};
