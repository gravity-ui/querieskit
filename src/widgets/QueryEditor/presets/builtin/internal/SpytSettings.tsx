import React from 'react';
import {Disclosure} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';
import type {
    BuiltinEngineSettings,
    BuiltinEngineSettingsBinding,
} from '../../../../../types/builtinQueryEngines';
import {SpytSettingsContent} from './SpytSettingsContent';
import {useSpytSettings} from './useSpytSettings';
import './SpytSettings.scss';

const block = cn('qp-spyt-settings');

export function SpytSettings<TCustom extends BuiltinEngineSettings>(props: {
    context: BuiltinEngineSettingsBinding<TCustom>;
}) {
    const state = useSpytSettings(props.context);
    return (
        <Disclosure defaultExpanded summary="SPYT" className={block()}>
            <SpytSettingsContent
                state={state}
                className={block('content')}
                classNames={{
                    editorFrame: block('editor-frame'),
                    invalidEditorFrame: block('editor-frame', {invalid: true}),
                    editor: block('editor'),
                }}
            />
        </Disclosure>
    );
}
