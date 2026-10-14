import React, {useEffect, useState} from 'react';
import {Button, Disclosure, Flex, Icon, Text, useThemeValue} from '@gravity-ui/uikit';
import CheckIcon from '@gravity-ui/icons/svgs/check.svg';
import XmarkIcon from '@gravity-ui/icons/svgs/xmark.svg';
import cn from 'bem-cn-lite';
import {MonacoEditor} from '../../../../../components/MonacoEditor';
import type {QueryEditorEngineSettingsContext} from '../../../../../types/queryEditor';
import type {YtsaurusEngineSettings} from '../../../../../types/ytsaurusQueryEngines';
import i18n from '../i18n';
import './SpytSettings.scss';

const block = cn('qp-spyt-settings');

export function SpytSettings<TCustom extends YtsaurusEngineSettings>({
    context: {value, onChange, errors, onFieldBlur, disabled, clusterId},
}: {
    context: QueryEditorEngineSettingsContext<TCustom>;
}) {
    const theme = useThemeValue();
    const saved = value.custom.spytConfig ?? '{}';
    const [draft, setDraft] = useState(saved);
    const [invalid, setInvalid] = useState(false);
    useEffect(() => {
        setDraft(saved);
        setInvalid(false);
    }, [saved, clusterId]);
    const error = invalid ? i18n('alert_invalid-spyt-config') : errors?.custom?.spytConfig;
    const save = () => {
        if (disabled) return;
        try {
            const parsed: unknown = JSON.parse(draft);
            if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
                setInvalid(true);
                return;
            }
        } catch {
            setInvalid(true);
            return;
        }
        setInvalid(false);
        onChange({...value, custom: {...value.custom, spytConfig: draft}});
    };

    return (
        <Disclosure defaultExpanded summary="SPYT" className={block()}>
            <Flex direction="column" gap={2} className={block('content')}>
                <div className={block('editor-frame', {invalid: Boolean(error)})}>
                    <MonacoEditor
                        className={block('editor')}
                        value={draft}
                        language="json"
                        theme={theme}
                        readOnly={disabled}
                        onChange={(next) => {
                            if (!disabled) {
                                setDraft(next);
                                setInvalid(false);
                            }
                        }}
                        onBlur={() => onFieldBlur?.({section: 'custom', field: 'spytConfig'})}
                        monacoConfig={{
                            ariaLabel: i18n('field_spyt-config'),
                            minimap: {enabled: false},
                            lineNumbers: 'on',
                            lineNumbersMinChars: 2,
                            lineDecorationsWidth: 8,
                            glyphMargin: false,
                            folding: false,
                            scrollBeyondLastLine: false,
                            overviewRulerLanes: 0,
                            renderLineHighlight: 'none',
                            wordWrap: 'on',
                            padding: {top: 8, bottom: 8},
                        }}
                    />
                </div>
                {error && (
                    <Text color="danger" role="alert">
                        {error}
                    </Text>
                )}
                <Flex gap={1}>
                    <Button view="flat" disabled={disabled} onClick={save}>
                        <Icon data={CheckIcon} size={16} />
                        {i18n('action_save')}
                    </Button>
                    <Button
                        view="flat"
                        disabled={disabled}
                        onClick={() => {
                            setDraft(saved);
                            setInvalid(false);
                        }}
                    >
                        <Icon data={XmarkIcon} size={16} />
                        {i18n('action_cancel')}
                    </Button>
                </Flex>
            </Flex>
        </Disclosure>
    );
}
