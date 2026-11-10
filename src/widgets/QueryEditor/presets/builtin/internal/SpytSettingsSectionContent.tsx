import React from 'react';
import type {
    BuiltinEngineSettings,
    BuiltinEngineSettingsBinding,
} from '../../../../../types/builtinQueryEngines';
import {SpytSettingsContent} from './SpytSettingsContent';
import {useSpytSettings} from './useSpytSettings';

export function SpytSettingsSectionContent<TCustom extends BuiltinEngineSettings>({
    context,
}: {
    context: BuiltinEngineSettingsBinding<TCustom>;
}) {
    const state = useSpytSettings(context);
    return <SpytSettingsContent state={state} />;
}
